import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  MiniMap,
} from '@xyflow/react'
import type { Connection, Edge, Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useBlocks, useBlockCategories, useCreateWorkflow, useRunWorkflow, useWorkflow, useWorkflows } from '../hooks/useApi'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import WorkflowNode from '../components/workflow/WorkflowNode'
import NodeConfigPanel from '../components/workflow/NodeConfigPanel'
import CollaborationPanel from '../components/workflow/CollaborationPanel'
import ExecutionDebugger from '../components/workflow/ExecutionDebugger'
import ExecutionMonitor from '../components/workflow/ExecutionMonitor'
import { apiClient } from '../services/api'

// Icons
import {
  Save,
  Play,
  Loader,
  Settings,
  BarChart3,
  ChevronDown,
  User,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronRight,
  Zap,
  Database,
  Globe as GlobeIcon,
  Share2,
  Hash,
  Lock,
  BookOpen,
  Plus,
} from 'lucide-react'

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Start Here - Drag blocks from the left panel' },
    type: 'default',
  },
]
const initialEdges: Edge[] = []

// nodeTypes will be created inside the component so we can pass the theme prop to nodes

// Quick Start Templates
const quickStartTemplates = [
  {
    id: 'simple_search',
    name: 'Simple Search',
    description: 'Basic Search & Filter',
    color: 'bg-blue-500',
  },
  {
    id: 'ai_content',
    name: 'AI content Generator',
    description: 'Advanced Prompt Eng.',
    color: 'bg-purple-500',
  },
  {
    id: 'full_pipeline',
    name: 'Full Data Pipeline',
    description: 'Extract Transform & Load',
    color: 'bg-teal-500'
  },
]

// Tab types
type TabType = 'blocks' | 'triggers' | 'copilot' | 'env_vars'

type ThemeMode = 'day' | 'night'

export default function WorkflowBuilderRedesign({ theme = 'night' }: { theme?: ThemeMode }) {
  const isDay = theme === 'day'
  const nodeTypes = useMemo(
    () => ({
      workflowNode: (props: any) => <WorkflowNode {...props} theme={theme} />,
    }),
    [theme]
  )
  const { id: workflowId } = useParams<{ id?: string }>()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [workflowEnvVars, setWorkflowEnvVars] = useState<Record<string, string>>({})
  const [envKey, setEnvKey] = useState('')
  const [envValue, setEnvValue] = useState('')
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(workflowId || null)
  const [workflowName, setWorkflowName] = useState('Untitled Workflow')
  const [isExecuting, setIsExecuting] = useState(false)
  const [, setExecutionResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabType>('blocks')
  const [executionData, setExecutionData] = useState<any>(null)
  const [expandedCategories, setExpandedCategories] = useState(new Set(['utility', 'ai']))
  const [collaborationVisible, setCollaborationVisible] = useState(false)
  const [debuggerVisible, setDebuggerVisible] = useState(false)
  const [monitorVisible, setMonitorVisible] = useState(false)
  const [activePanel, setActivePanel] = useState<"debugger" | "monitor" | "collaboration" | null>(null);
  const executionPollRef = useRef<number | null>(null)
  const executionPollCancelRef = useRef<(() => void) | null>(null)

  const [, setNodeCounter] = useState(1)
  const [blocksSearchTerm, setBlocksSearchTerm] = useState('')
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [draggedBlock, setDraggedBlock] = useState<any>(null)
  const [hasInitializedView, setHasInitializedView] = useState(false)
  const [workflowQuickFilter, setWorkflowQuickFilter] = useState<'all' | 'today' | 'thisWeek'>('all')
  const [workflowSortName, setWorkflowSortName] = useState<'az' | 'za' | ''>('')
  const [workflowSortId, setWorkflowSortId] = useState<'short' | 'long' | ''>('')
  const [workflowSortDate, setWorkflowSortDate] = useState<'new' | 'old' | ''>('')
  const createWorkflowMutation = useCreateWorkflow()
  const runWorkflowMutation = useRunWorkflow()
  const { user } = useAuth()
  const { data: existingWorkflow, isLoading: workflowLoading } = useWorkflow(workflowId || '')

  const { data: apiBlocks, isLoading: blocksLoading } = useBlocks()
  useBlockCategories() // Categories are used in categoryInfo mapping
  const { data: workflows, isLoading: workflowsLoading } = useWorkflows()
  const [workflowSearch, setWorkflowSearch] = useState('')
  const registryBlocks = useMemo(() => {
    return Array.isArray(apiBlocks) ? apiBlocks : []
  }, [apiBlocks])

  const findRegistryBlock = useCallback(
    (aliases: string[]) => {
      if (!registryBlocks.length) return undefined
      const normalizedAliases = aliases.map(alias => alias.toLowerCase())
      return registryBlocks.find(block => {
        const haystack = [
          block?.type,
          block?.name,
          block?.manifest?.name,
          block?.manifest?.description,
          block?.manifest?.category,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return normalizedAliases.some(alias => haystack.includes(alias))
      })
    },
    [registryBlocks]
  )

  const buildDemoNode = useCallback(
    (options: {
      id: string
      position: { x: number; y: number }
      aliases: string[]
      fallbackLabel: string
      parameters: Record<string, any>
    }): Node => {
      const blockMatch = findRegistryBlock(options.aliases)
      const blockId = blockMatch?.id || blockMatch?._id
      const blockLabel = blockMatch?.manifest?.name || blockMatch?.name || options.fallbackLabel
      return {
        id: options.id,
        type: 'workflowNode',
        position: options.position,
        data: {
          label: blockLabel,
          blockType: blockLabel,
          blockId,
          config: options.parameters,
          parameters: options.parameters,
          status: 'idle',
        },
      }
    },
    [findRegistryBlock]
  )

  const isTerminalStatus = useCallback((status?: string) => {
    return status === 'completed' || status === 'failed' || status === 'cancelled' || status === 'timeout'
  }, [])

  const normalizeExecution = useCallback((execution: any) => {
    if (!execution) return execution
    const executionId = execution.id || execution.execution_id || execution.executionId
    return {
      ...execution,
      id: executionId,
      execution_id: execution.execution_id || executionId,
    }
  }, [])

  const buildNodeResults = useCallback((execution: any) => {
    if (!execution) return null
    if (execution.nodeResults) return execution.nodeResults

    const nodeExecutions = execution.node_executions || execution.nodeExecutions
    if (!Array.isArray(nodeExecutions)) return null

    const results: Record<string, any> = {}
    nodeExecutions.forEach((nodeExec: any) => {
      const nodeId = nodeExec.node_id || nodeExec.nodeId
      if (!nodeId) return
      const nodeResult = nodeExec.result || {}
      const outputData =
        nodeResult.result ??
        nodeResult.outputs ??
        nodeResult.output ??
        nodeResult

      results[nodeId] = {
        nodeId,
        success: nodeExec.success !== false && nodeResult.success !== false,
        inputData: nodeResult.inputs ?? nodeResult.input,
        outputData,
        error: nodeResult.error || nodeExec.error_message || nodeExec.error,
        executionTime:
          nodeResult.execution_time_ms ??
          nodeResult.executionTime ??
          nodeExec.execution_time_ms ??
          nodeExec.executionTime,
        timestamp: nodeExec.executed_at || nodeExec.timestamp || nodeResult.timestamp,
      }
    })

    return results
  }, [])

  const applyExecutionUpdate = useCallback((execution: any) => {
    const normalized = normalizeExecution(execution)
    const nodeResults = buildNodeResults(normalized)
    const nextExecution = nodeResults ? { ...normalized, nodeResults } : normalized

    setExecutionData(nextExecution)
    setExecutionResult((prev: any) => {
      if (!prev || prev.id === nextExecution?.id) {
        return { ...prev, ...nextExecution }
      }
      return prev
    })

    if (nodeResults) {
      setNodes(nds =>
        nds.map(node => {
          const nodeResult = nodeResults[node.id]
          if (!nodeResult) return node
          return {
            ...node,
            data: {
              ...node.data,
              status: nodeResult.success ? 'success' : 'error',
              output: nodeResult.outputData,
            },
          }
        })
      )
    }

    if (isTerminalStatus(normalized?.status)) {
      setIsExecuting(false)
    }
  }, [buildNodeResults, isTerminalStatus, normalizeExecution, setNodes])

  const stopExecutionPolling = useCallback(() => {
    if (executionPollCancelRef.current) {
      executionPollCancelRef.current()
      executionPollCancelRef.current = null
    }
  }, [])

  const startExecutionPolling = useCallback((executionId: string) => {
    stopExecutionPolling()

    let cancelled = false
    const poll = async () => {
      if (cancelled) return
      try {
        const execution = await apiClient.getExecution(executionId)
        applyExecutionUpdate(execution)
        const status = execution?.status
        if (!isTerminalStatus(status)) {
          executionPollRef.current = window.setTimeout(poll, 2000)
        }
      } catch (error) {
        if (!cancelled) {
          executionPollRef.current = window.setTimeout(poll, 4000)
        }
      }
    }

    poll()

    executionPollCancelRef.current = () => {
      cancelled = true
      if (executionPollRef.current) {
        window.clearTimeout(executionPollRef.current)
      }
    }
  }, [applyExecutionUpdate, isTerminalStatus, stopExecutionPolling])
  const filteredWorkflows = useMemo(() => {
    const list = Array.isArray(workflows) ? workflows : []
    const q = (workflowSearch || '').trim().toLowerCase()
    if (!q) return list
    return list.filter((w: any) => {
      const name = String(w?.name || '').toLowerCase()
      const id = String(w?.id || '').toLowerCase()
      return name.includes(q) || id.includes(q)
    })
  }, [workflows, workflowSearch])

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  // Apply theme-aware styles to edges so lines change color between day/night
  const themedEdges = useMemo(() => {
    return edges.map(e => ({
      ...e,
      style: e.style ?? { stroke: isDay ? '#374151' : '#9CA3AF' },
    }))
  }, [edges, isDay])

  // Initialize view with reasonable zoom level
  useEffect(() => {
    if (reactFlowInstance && !hasInitializedView) {
      // Set initial viewport with zoom level 0.8 (80% zoom - makes things appear smaller/normal size)
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 0.8 })
      setHasInitializedView(true)
    }
  }, [reactFlowInstance, hasInitializedView])

  // Fit view when nodes are loaded (but only if there are actual workflow nodes, not just the initial placeholder)
  useEffect(() => {
    if (reactFlowInstance && hasInitializedView) {
      const workflowNodes = nodes.filter(node => node.data?.blockType || node.id === '1')
      if (workflowNodes.length > 1) {
        // Only fit view if there are multiple nodes
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2, maxZoom: 1.2, minZoom: 0.3 })
        }, 100)
      }
    }
  }, [reactFlowInstance, nodes, hasInitializedView])

  // Load existing workflow
  useEffect(() => {
    if (existingWorkflow && workflowId) {
      console.log('Loading existing workflow:', existingWorkflow)

      const workflow = existingWorkflow as any
      setWorkflowName(workflow.name || 'Workflow :- 01')
      setCurrentWorkflowId(workflowId)

      // Support both old format (graph.nodes/edges) and new format (blocks/connections)
      const graphNodes = workflow.graph?.nodes || workflow.blocks || []
      const graphEdges = workflow.graph?.edges || workflow.connections || []

      if (graphNodes.length > 0) {
        const loadedNodes: Node[] = graphNodes.map((node: any, index: number) => {
          const blockLabel = node.name || node.type
          const blockType = node.name || node.type || node.block_type || blockLabel
          const blockId = node.block_id || node.blockId

          return {
            id: node.id,
            type: 'workflowNode',
            position: node.position || { x: 100 + index * 300, y: 100 + Math.floor(index / 3) * 200 },
            data: {
              label: blockLabel,
              blockType,
              blockId,
              config: node.input_mapping || node.parameters || {},
              parameters: node.input_mapping || node.parameters || {},
              status: 'idle',
            },
          }
        })

        const loadedEdges: Edge[] = graphEdges.map((edge: any, index: number) => ({
          id: edge.id || `e-${edge.source_node_id || edge.from_node}-${edge.target_node_id || edge.to_node}-${index}`,
          source: edge.source_node_id || edge.from_node,
          target: edge.target_node_id || edge.to_node,
        }))

        setNodes(loadedNodes)
        setEdges(loadedEdges)
        setNodeCounter(loadedNodes.length)
      }
    }
  }, [existingWorkflow, workflowId, setNodes, setEdges])

  // Categories and blocks are used in the blocks tab rendering

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
  }, [])

  const handleNodeUpdate = useCallback(
    (nodeId: string, dataPatch: Record<string, any>) => {
      setNodes(nds =>
        nds.map(node => {
          if (node.id !== nodeId) return node
          const nextData = {
            ...node.data,
            ...dataPatch,
          }

          if (dataPatch.config && !dataPatch.parameters) {
            nextData.parameters = dataPatch.config
          }

          if (dataPatch.parameters && !dataPatch.config) {
            nextData.config = dataPatch.parameters
          }

          return { ...node, data: nextData }
        })
      )
    },
    [setNodes]
  )

  const onAddNode = useCallback(
    (block: any, position?: { x: number; y: number }) => {
      const newId = `${block.type}-${Date.now()}`
      const blockId = block?.id || block?._id
      const blockLabel = block?.manifest?.name || block?.name || block?.type
      const newNode: Node = {
        id: newId,
        position: position || { x: Math.random() * 400 + 200, y: Math.random() * 400 + 200 },
        data: {
          label: blockLabel,
          blockType: blockLabel || block?.type,
          blockId,
          config: {},
          status: 'idle',
        },
        type: 'workflowNode',
      }
      setNodes(nds => [...nds.filter(n => n.id !== '1'), newNode]) // Remove initial "Start Here" node
      setNodeCounter(prev => prev + 1)
    },
    [setNodes]
  )

  // Drag and drop handlers
  const onDragStart = useCallback((event: React.DragEvent, block: any) => {
    setDraggedBlock(block)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/reactflow', JSON.stringify(block))
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowInstance || !draggedBlock) return

      const reactFlowBounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      onAddNode(draggedBlock, position)
      setDraggedBlock(null)
    },
    [reactFlowInstance, draggedBlock, onAddNode]
  )

  // Handle custom events from WorkflowNode
  useEffect(() => {
    const handleOpenConfig = (e: any) => {
      setSelectedNodeId(e.detail.nodeId)
    }

    const handleTestNode = (e: any) => {
      const nodeId = e.detail.nodeId
      setSelectedNodeId(nodeId)
      console.log('Test node:', nodeId)
    }

    const handleDeleteNode = (e: any) => {
      const nodeId = e.detail.nodeId
      setNodes(nds => nds.filter(node => node.id !== nodeId))
      setEdges(eds => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId))
      if (selectedNodeId === nodeId) setSelectedNodeId(null)
    }

    window.addEventListener('openNodeConfig', handleOpenConfig)
    window.addEventListener('testNode', handleTestNode)
    window.addEventListener('deleteNode', handleDeleteNode)

    return () => {
      window.removeEventListener('openNodeConfig', handleOpenConfig)
      window.removeEventListener('testNode', handleTestNode)
      window.removeEventListener('deleteNode', handleDeleteNode)
    }
  }, [setNodes, setEdges, selectedNodeId])

  const onToggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }, [])

  const buildWorkflowPayload = useCallback(() => {
    const graphNodes = nodes
      .filter(node => Boolean(node.data?.blockType))
      .map(node => ({
        id: node.id,
        name: node.data?.label || node.data?.blockType,
        type: node.data.blockType,
        block_id: node.data?.blockId || node.data?.block_id,
        parameters: node.data?.parameters || node.data?.config || {},
        position: node.position,
      }))

    const graphEdges = edges.map(edge => ({
      from_node: edge.source,
      to_node: edge.target,
    }))

    return {
      name: workflowName || 'Untitled Workflow',
      graph: {
        nodes: graphNodes,
        edges: graphEdges,
      },
    }
  }, [nodes, edges, workflowName])

  const hasConfigurableNodes = useMemo(
    () => nodes.some(node => Boolean(node.data?.blockType)),
    [nodes]
  )

  const saveWorkflow = async (options: { silent?: boolean } = {}) => {
    if (!hasConfigurableNodes) {
      if (!options.silent) {
        toast.warning('Add at least one configured block before saving the workflow.')
      }
      throw new Error('No configured nodes to save')
    }

    const payload = buildWorkflowPayload()

    try {
      const workflow = await createWorkflowMutation.mutateAsync(payload) as any
      setCurrentWorkflowId(workflow.id)
      if (!options.silent) {
        toast.success('Workflow saved successfully!')
      }
      return workflow
    } catch (error) {
      console.error('Failed to save workflow:', error)
      if (!options.silent) {
        toast.error('Failed to save workflow. Please try again.')
      }
      throw error
    }
  }

  const runWorkflow = async () => {
    if (!hasConfigurableNodes) {
      toast.warning('Please add and configure at least one block before running the workflow.')
      return
    }

    try {
      setIsExecuting(true)
      setExecutionResult(null)

      let workflowIdToRun = currentWorkflowId
      if (!workflowIdToRun) {
        const workflow = await saveWorkflow({ silent: true })
        workflowIdToRun = (workflow as any).id
      }

      if (!workflowIdToRun) {
        throw new Error('Failed to get workflow ID')
      }

      const execution = await runWorkflowMutation.mutateAsync(workflowIdToRun)
      applyExecutionUpdate(execution)
      const executionId = execution?.id || execution?.execution_id
      if (executionId) {
        startExecutionPolling(executionId)
      }
      toast.success('Workflow execution started!')
    } catch (error) {
      console.error('Failed to run workflow:', error)
      toast.error('Failed to run workflow. Please check your configuration.')
    } finally {
      setIsExecuting(false)
    }
  }

  const loadDemoWorkflow = useCallback(
    (workflowType: 'simple' | 'ai_research' | 'full_pipeline') => {
      setNodes([])
      setEdges([])
      setSelectedNodeId(null)
      setExecutionResult(null)

      let demoNodes: Node[] = []
      let demoEdges: Edge[] = []
      let name = 'Demo Workflow'
      let count = 0

      if (workflowType === 'simple') {
        name = 'Simple Search Demo'
        const searchNode = buildDemoNode({
          id: 'search_demo',
          position: { x: 100, y: 100 },
          aliases: ['web search', 'search', 'searxng'],
          fallbackLabel: 'Web Search',
          parameters: {
            query: 'machine learning tutorials 2025',
            limit: 5,
            time_range: 'month',
          },
        })

        const conditionNode = buildDemoNode({
          id: 'condition_check',
          position: { x: 400, y: 100 },
          aliases: ['condition'],
          fallbackLabel: 'Condition Check',
          parameters: {
            value: 5,
            operator: '>',
            compare_to: 3,
          },
        })

        demoNodes = [searchNode, conditionNode]
        demoEdges = [{ id: 'e-simple-1', source: 'search_demo', target: 'condition_check' }]
        count = 2
      } else if (workflowType === 'ai_research') {
        name = 'AI Research & Analysis'
        const searchNode = buildDemoNode({
          id: 'search_ai_news',
          position: { x: 100, y: 100 },
          aliases: ['web search', 'search', 'searxng'],
          fallbackLabel: 'Web Search',
          parameters: {
            query: 'artificial intelligence news 2025 latest developments',
            limit: 6,
            time_range: 'month',
          },
        })

        const mapNode = buildDemoNode({
          id: 'map_summary',
          position: { x: 400, y: 100 },
          aliases: ['json', 'mapper'],
          fallbackLabel: 'JSON Mapper',
          parameters: {
            input_data: { headline: 'Sample headline', summary: 'Sample summary' },
            mapping: {
              headline: '$.headline',
              summary: '$.summary',
            },
          },
        })

        const conditionNode = buildDemoNode({
          id: 'review_gate',
          position: { x: 700, y: 100 },
          aliases: ['condition'],
          fallbackLabel: 'Condition Check',
          parameters: {
            value: 'ready',
            operator: '==',
            compare_to: 'ready',
          },
        })

        demoNodes = [searchNode, mapNode, conditionNode]
        demoEdges = [
          { id: 'e-ai-1', source: 'search_ai_news', target: 'map_summary' },
          { id: 'e-ai-2', source: 'map_summary', target: 'review_gate' },
        ]
        count = 3
      } else if (workflowType === 'full_pipeline') {
        name = 'Full Data Pipeline'
        // Placeholder for full pipeline - can be expanded later
        const extractNode = buildDemoNode({
          id: 'extract',
          position: { x: 100, y: 100 },
          aliases: ['web search', 'search', 'searxng'],
          fallbackLabel: 'Web Search',
          parameters: {
            query: 'data pipeline patterns',
            limit: 3,
            time_range: 'year',
          },
        })

        const transformNode = buildDemoNode({
          id: 'transform',
          position: { x: 400, y: 100 },
          aliases: ['json', 'mapper'],
          fallbackLabel: 'JSON Mapper',
          parameters: {
            input_data: { value: 10, label: 'sample' },
            mapping: {
              value: '$.value',
              label: '$.label',
            },
          },
        })

        const loadNode = buildDemoNode({
          id: 'load',
          position: { x: 700, y: 100 },
          aliases: ['condition'],
          fallbackLabel: 'Condition Check',
          parameters: {
            value: 1,
            operator: '==',
            compare_to: 1,
          },
        })

        demoNodes = [extractNode, transformNode, loadNode]
        demoEdges = [
          { id: 'e-pipeline-1', source: 'extract', target: 'transform' },
          { id: 'e-pipeline-2', source: 'transform', target: 'load' },
        ]
        count = 3
      }

      setNodes(demoNodes)
      setEdges(demoEdges)
      setWorkflowName(name)
      setNodeCounter(count)
    },
    [buildDemoNode, setEdges, setNodes]
  )

  // Execution table data
  const executionTableData = useMemo(() => {
    if (!executionData) return []
    const runId = (executionData?.id || executionData?.execution_id || '').slice(0, 8)
    const nodeResults = executionData?.nodeResults || {}

    return nodes
      .filter(node => node.data?.blockType)
      .map(node => {
        const nodeResult = nodeResults[node.id]
        const statusLabel = nodeResult
          ? nodeResult.success
            ? 'Completed'
            : 'Failed'
          : node.data.status === 'success'
            ? 'Completed'
            : node.data.status === 'error'
              ? 'Failed'
              : 'Running'
        return {
          block: node.data.label || node.data.blockType,
          runId: runId || 'n/a',
          status: statusLabel,
          output: nodeResult?.outputData || node.data.output || '',
        }
      })
  }, [executionData, nodes])

  useEffect(() => {
    return () => {
      stopExecutionPolling()
    }
  }, [stopExecutionPolling])

  // Category info for blocks display
  const categoryInfo: Record<
    string,
    { icon: React.ComponentType<any>; description: string; color: string }
  > = {
    ai: { icon: Zap, description: 'Generative AI, models, and reasoning', color: 'text-fuchsia-400' },
    data: { icon: Database, description: 'Storage, retrieval, and transformations', color: 'text-blue-400' },
    network: { icon: GlobeIcon, description: 'HTTP requests, web scraping, and APIs', color: 'text-emerald-400' },
    integration: { icon: Share2, description: 'Third-party service connectors', color: 'text-rose-400' },
    communication: { icon: MessageSquare, description: 'Email, chat, and notification services', color: 'text-amber-400' },
    utility: { icon: Settings, description: 'Logic, time, control flow, and debugging', color: 'text-slate-400' },
    math: { icon: Hash, description: 'Mathematical and numerical operations', color: 'text-orange-400' },
    document: { icon: BookOpen, description: 'File reading/writing and document parsing', color: 'text-indigo-400' },
    security: { icon: Lock, description: 'Authentication, secrets, and encryption', color: 'text-red-400' },
  }

  // Filter and group blocks by category
  const filteredBlocks = useMemo(() => {
    if (!apiBlocks) return []
    const safeBlocks = Array.isArray(apiBlocks) ? apiBlocks : []
    
    return safeBlocks.filter(block => {
      if (!block || !block.manifest) return false
      const searchLower = blocksSearchTerm.toLowerCase()
      const name = String(block.manifest.name || block.type || '').toLowerCase()
      const type = String(block.type || '').toLowerCase()
      const description = String(block.manifest.description || '').toLowerCase()
      const category = String(block.manifest.category || 'utility').toLowerCase()
      
      return (
        name.includes(searchLower) ||
        type.includes(searchLower) ||
        description.includes(searchLower) ||
        category.includes(searchLower)
      )
    })
  }, [apiBlocks, blocksSearchTerm])

  const blocksByCategory = useMemo(() => {
    return filteredBlocks.reduce(
      (acc, block) => {
        const category = block.manifest?.category || 'utility'
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(block)
        return acc
      },
      {} as Record<string, any[]>
    )
  }, [filteredBlocks])

  if (workflowId && workflowLoading) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDay ? 'bg-white' : 'bg-[#1a0f22]'}`}>
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className={`${isDay ? 'text-gray-600' : 'text-gray-400'}`}>Loading workflow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-full ${isDay ? 'bg-white text-gray-900' : 'bg-[#1a0f22] text-white'} overflow-hidden`}>
      {/* Left Sidebar */}
      <div className={`w-64 ${isDay ? 'bg-gray-100 border-r border-gray-200 text-gray-900' : 'bg-[#120c1a] border-r border-[#27202a] text-white'} flex flex-col`}>
        {/* Top Section: Workflow Name, Save, Run */}
        <div className={`p-4 border-b ${isDay ? 'border-gray-200' : 'border-[#27202a]'}`}>
          <div className="mb-3">
            <input
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              className={`w-full ${isDay ? 'bg-gray-50 text-gray-900' : 'bg-[#150b1e] text-white'} px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Workflow name..."
            />
          </div>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => saveWorkflow().catch(() => undefined)}
              disabled={createWorkflowMutation.isPending || !hasConfigurableNodes}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${isDay ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-[#150b1e] hover:bg-[#2a172e]'}`}
            >
              {createWorkflowMutation.isPending ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              Save
            </button>
            <button
              onClick={runWorkflow}
              disabled={isExecuting || !hasConfigurableNodes}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${isDay ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isExecuting ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3" />
              )}
              RUN
            </button>
          </div>
          
          {/* SLIDING PANELS */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              activePanel ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {activePanel === "debugger" && (
              <div className="animate-slide-down">
                <ExecutionDebugger
                  nodes={nodes}
                  edges={edges}
                  executionData={executionData}
                  isVisible={debuggerVisible}
                  onToggleVisibility={() => setDebuggerVisible(!debuggerVisible)}
                  // // onExecuteStep={handleExecuteStep}
                  // // onExecuteToBreakpoint={handleExecuteToBreakpoint}
                  // // onStopExecution={handleStopExecution}
                  isDay={isDay} 
                />
              </div>
            )}

            {activePanel === "monitor" && (
              <div className="animate-slide-down">
                <ExecutionMonitor
                  nodes={nodes}
                  edges={edges}
                  executionData={executionData}
                  isVisible={true}
                  onToggleVisibility={() => setActivePanel(null)}
                />
              </div>
            )}

            {activePanel === "collaboration" && (
              <div className="animate-slide-down">
                <CollaborationPanel
                  isVisible={true}
                  onToggleVisibility={() => setActivePanel(null)}
                  currentUserId="current-user-id"
                  workflowId={currentWorkflowId || "workflow-123"}
                />
              </div>
            )}
          </div>

        </div>

        {/* Quick Start Templates Section */}
        <div className="p-3 border-b border-[#27202a]">
          <h3 className="text-xs font-semibold text-gray-300 mb-2">Quick Start Template</h3>
          <div className="space-y-1.5">
            {quickStartTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => {
                  if (template.id === 'simple_search') loadDemoWorkflow('simple')
                  else if (template.id === 'ai_content') loadDemoWorkflow('ai_research')
                  else if (template.id === 'full_pipeline') loadDemoWorkflow('full_pipeline')
                }}
                className={`w-full text-left p-2 rounded cursor-pointer transition-colors ${template.selected ? 'bg-teal-500/20 border border-teal-500' : isDay ? 'bg-gray-50 hover:bg-gray-100 text-gray-900' : 'bg-[#150b1e] hover:bg-[#2a172e]'}`}
              >
                <div className="font-medium text-xs">{template.name}</div>
                <div className={`text-xs mt-0.5 ${isDay ? 'text-gray-600' : 'text-gray-400'}`}>{template.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className={`flex ${isDay ? 'border-b border-gray-200' : 'border-b border-[#27202a]'} flex-shrink-0`}>
            <button
              onClick={() => setActiveTab('blocks')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'blocks'
                  ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
                  : (isDay ? 'text-gray-700 hover:text-gray-600' : 'text-gray-400 hover:text-gray-300')
              }`}
            >
              Blocks
            </button>
            <button
              onClick={() => setActiveTab('triggers')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'triggers'
                  ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                  : (isDay ? 'text-gray-700 hover:text-gray-600' : 'text-gray-400 hover:text-gray-300')
              }`}
            >
              Triggers
            </button>
            <button
              onClick={() => setActiveTab('env_vars')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'env_vars'
                  ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                  : (isDay ? 'text-gray-700 hover:text-gray-600' : 'text-gray-400 hover:text-gray-300')
              }`}
            >
              Env Vars
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'blocks' && (
              <div className="p-4">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search blocks..."
                    value={blocksSearchTerm}
                    onChange={e => setBlocksSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDay ? 'bg-gray-50 text-gray-900' : 'bg-[#150b1e] text-white'}`}
                  />
                </div>

                {/* Blocks by Category */}
                <div className="space-y-3">
                  {Object.entries(blocksByCategory).map(([category, categoryBlocks]) => {
                    const categoryMeta = categoryInfo[category] || {
                      icon: Settings,
                      description: 'Miscellaneous blocks',
                      color: 'text-slate-400',
                    }
                    const CategoryIcon = categoryMeta.icon
                    const isExpanded = expandedCategories.has(category)
                    const blocks = categoryBlocks as any[]

                    return (
                      <div key={category} className={`rounded overflow-hidden ${isDay ? 'border border-gray-200' : 'border border-[#27202a]'}`}>
                        <button
                          onClick={() => onToggleCategory(category)}
                          className={`w-full flex items-center justify-between p-2 transition-colors ${isExpanded ? (isDay ? 'bg-gray-50' : 'bg-[#150b1e]') : (isDay ? 'bg-white hover:bg-gray-50' : 'bg-[#120c1a] hover:bg-[#150b1e]')}`}
                        >
                          <div className="flex items-center gap-2">
                            <CategoryIcon className={`w-4 h-4 ${categoryMeta.color}`} />
                            <span className={`text-xs font-medium capitalize ${isDay ? 'text-gray-800' : 'text-gray-300'}`}>{category}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${isDay ? 'bg-gray-100 text-gray-700' : 'bg-[#150b1e] text-gray-400'}`}>
                              {blocks.length}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className={`w-4 h-4 ${isDay ? 'text-gray-600' : 'text-gray-400'}`} />
                          ) : (
                            <ChevronRight className={`w-4 h-4 ${isDay ? 'text-gray-600' : 'text-gray-400'}`} />
                          )}
                        </button>
                        {isExpanded && (
                          <div className={`${isDay ? 'bg-white' : 'bg-[#120c1a]'}`}>
                            {blocks.map((block: any) => (
                              <div
                                key={block.type}
                                draggable
                                onDragStart={(e) => onDragStart(e, block)}
                                onClick={() => onAddNode(block)}
                                className={`flex items-center gap-2 p-2 cursor-move transition-colors border-t ${isDay ? 'border-gray-200 hover:bg-gray-50' : 'border-[#27202a] hover:bg-[#150b1e]'}`}
                              >
                                <CategoryIcon className={`w-4 h-4 ${categoryMeta.color}`} />
                                <div className="flex-1 min-w-0">
                                  <div className={`text-xs font-medium truncate ${isDay ? 'text-gray-900' : 'text-gray-200'}`}>
                                    {block.manifest?.name || block.type}
                                  </div>
                                  <div className={`text-xs truncate ${isDay ? 'text-gray-600' : 'text-gray-500'}`}>
                                    {block.manifest?.description || 'No description'}
                                  </div>
                                </div>
                                <Plus className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {Object.keys(blocksByCategory).length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      {blocksLoading ? 'Loading blocks...' : 'No blocks found'}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'triggers' && (
              <div className="text-center text-gray-400 text-sm py-8">
                Triggers coming soon...
              </div>
            )}
            {activeTab === 'env_vars' && (
              <div className="p-4">
                <div className="text-xs text-yellow-400 mb-2">Set Your Environment Variables.</div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <input
                    aria-label="env-key"
                    value={envKey}
                    onChange={e => setEnvKey(e.target.value)}
                    placeholder="Key (e.g. NODE_ENV)"
                    className={`flex-1 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDay ? 'bg-gray-50 text-gray-900' : 'bg-[#4d395e] text-white'}`}
                  />
                  <input
                    aria-label="env-value"
                    value={envValue}
                    onChange={e => setEnvValue(e.target.value)}
                    placeholder="Value"
                    className={`flex-1 px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDay ? 'bg-gray-50 text-gray-900' : 'bg-[#4d395e] text-white'}`}
                  />
                  <button
                    onClick={() => {
                      const key = envKey.trim()
                      if (!key) return
                      setWorkflowEnvVars(prev => ({ ...prev, [key]: envValue }))
                      setEnvKey('')
                      setEnvValue('')
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium ${isDay ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    Add
                  </button>
                </div>

                <div className="text-xs text-gray-400 mb-2">Current Env Vars</div>
                <div className="space-y-2">
                  {Object.keys(workflowEnvVars).length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-2">No env vars set</div>
                  )}
                  {Object.entries(workflowEnvVars).map(([k, v]) => (
                    <div key={k} className={`${isDay ? 'bg-gray-50' : 'bg-[#120c1a]'} flex items-center justify-between p-1 rounded`}>
                      <div className="min-w-0">
                        <div className={`text-xs font-medium truncate ${isDay ? 'text-gray-900' : 'text-white'}`}>{k}</div>
                        <div className={`text-[11px] truncate ${isDay ? 'text-gray-600' : 'text-gray-400'}`}>{String(v)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // Edit: populate inputs for editing
                            setEnvKey(k)
                            setEnvValue(String(v))
                          }}
                          className={`${isDay ? 'text-xs text-gray-700 px-2 py-0.5 rounded hover:bg-gray-100' : 'text-xs text-gray-300 px-2 py-0.5 rounded hover:bg-[#150b1e]'}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setWorkflowEnvVars(prev => {
                            const next = { ...prev }
                            delete next[k]
                            return next
                          })}
                          className={`${isDay ? 'text-xs text-red-600 px-2 py-0.5 rounded hover:bg-red-50' : 'text-xs text-red-400 px-2 py-0.5 rounded hover:bg-[#150b1e]'}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Central Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas */}
        <div className={`flex-1 relative ${isDay ? 'bg-white' : 'bg-[#1a0f22]'}`} onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={themedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            onInit={setReactFlowInstance}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            minZoom={0.2}
            maxZoom={2}
            attributionPosition="bottom-left"
          >
            <Background color={isDay ? '#e5e7eb' : '#241522'} gap={10} />
            {/* Controls can be enabled if desired */}
            <MiniMap
              className={isDay ? 'bg-white border-gray-200' : 'bg-[#120c1a] border-[#27202a]'}
              nodeColor={isDay ? '#374151' : '#120c1a'}
              maskColor={isDay ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.5)'}
            />
          </ReactFlow>
        </div>

        {/* Bottom Bar: Node/Edge Count */}
        <div className={`${isDay ? 'bg-gray-100 border-t border-gray-200 text-gray-700' : 'bg-[#120c1a] border-t border-[#27202a] text-sm text-gray-400'} px-4 py-2 text-sm`}>
            <div className="flex ">
            <div className="flex-1">
               Nodes :- <span className={`${isDay ? 'text-gray-900' : 'text-white'} font-semibold`}>{nodes.length}</span> Edges :-{' '}
          <span className={`${isDay ? 'text-gray-900' : 'text-white'} font-semibold`}>{edges.length}</span>
          </div>
        {/* Icon Buttons */}
        <div className="flex gap-4 m-auto justify-center">
            {/* Debugger Button */}
            <button
              onClick={() =>
                setActivePanel(activePanel === "debugger" ? null : "debugger")
              }
              className={`p-2 rounded transition-colors ${
                activePanel === "debugger"
                  ? "bg-yellow-600 text-white"
                  : isDay
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  : "bg-[#150b1e] hover:bg-[#2a172e]"
              }`}
              title="Execution Manager"
            >
              <Settings className="w-4 h-4" />
            </button>
            {/* Monitor Button */}
            <button
              onClick={() =>
                setActivePanel(activePanel === "monitor" ? null : "monitor")
              }
              className={`p-2 rounded transition-colors ${
                activePanel === "monitor"
                  ? "bg-yellow-600 text-white"
                  : isDay
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  : "bg-[#150b1e] hover:bg-[#2a172e]"
              }`}
              title="Analytics"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            {/* Collaboration Button */}
            <button
              onClick={() =>
                setActivePanel(activePanel === "collaboration" ? null : "collaboration")
              }
              className={`p-2 rounded transition-colors ${
                activePanel === "collaboration"
                  ? "bg-yellow-600 text-white"
                  : isDay
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  : "bg-[#150b1e] hover:bg-[#2a172e]"
              }`}
              title="Collaboration"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
            </div>
         
                
        </div>

        {/* Execution Table */}
        {executionTableData.length > 0 && (
          <div className="bg-[#120c1a] border-t border-[#27202a] max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#150b1e] sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300 font-medium">Block</th>
                  <th className="px-4 py-2 text-left text-gray-300 font-medium">Run ID</th>
                  <th className="px-4 py-2 text-left text-gray-300 font-medium">Status</th>
                  <th className="px-4 py-2 text-left text-gray-300 font-medium">Output</th>
                </tr>
              </thead>
              <tbody>
                {executionTableData.map((row, index) => (
                  <tr key={index} className="border-b border-[#27202a] hover:bg-[#150b1e]/50">
                    <td className="px-4 py-2">
                      <span className="bg-amber-900/30 text-amber-300 px-2 py-1 rounded text-xs">
                        {String(row.block)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-300 font-mono text-xs">{String(row.runId)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          row.status === 'Running'
                            ? 'bg-blue-900/30 text-blue-300'
                            : row.status === 'Completed'
                            ? 'bg-green-900/30 text-green-300'
                            : row.status === 'Failed'
                            ? 'bg-red-900/30 text-red-300'
                            : 'bg-[#150b1e] text-gray-300'
                        }`}
                      >
                        {row.status === 'Running' && <Loader className="w-3 h-3 animate-spin" />}
                        {row.status === 'Completed' && <CheckCircle className="w-3 h-3" />}
                        {row.status === 'Failed' && <XCircle className="w-3 h-3" />}
                        {String(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-400 text-xs">{String(row.output || '-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className={`w-64 ${isDay ? 'bg-gray-100 border-l border-gray-200 text-gray-900' : 'bg-[#120c1a] border-l border-[#27202a] text-white'} flex flex-col`}>
        {/* Top Section: Workspace Header */}
        <div className={`p-4 border-b ${isDay ? 'border-gray-200' : 'border-[#27202a]'}`}>
          <div className="flex items-center justify-center mb-2">
            <button className={`p-1.5 ${isDay ? 'border-gray-200' : 'bg-gray-700'} rounded mr-2`} title="User Profile">
              <User className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold"><span className='text-yellow-500 text-xl'>{user?.full_name }'s</span> Workspace</h2>
            {/* <div className="flex items-center gap-2">
              // <button className="text-xs text-gray-400 hover:text-gray-300">INVITE</button>
            </div> */}
          </div>
          {/* <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300">
            <ChevronDown className="w-4 h-4" />
          </button> */}
        </div>

        {/* Search Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Workflow..."
              value={workflowSearch}
              onChange={e => setWorkflowSearch(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDay ? 'bg-gray-50 text-gray-900' : 'bg-[#150b1e] text-white'}`}
            />
          </div>
        </div>

        {/* Content Area - Saved Workflows */}
       <div className="flex-1 overflow-y-auto p-4">
          {/* ---------------- FILTER CONTROLS ---------------- */}
          <div className="mb-4 space-y-3">
            {/* Quick Filters */}
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-semibold ${isDay ? "text-gray-800" : "text-yellow-600"}`}>
                Saved Workflows
              </h3>
              <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-3 py-2 text-xs rounded border ${
                isDay
                  ? "bg-white text-gray-800 border-gray-300"
                  : "bg-[#1a0f25] text-gray-200 border-gray-700"
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Filter</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            </div>

            {/* Sorting */}
            {/* FILTER DROPDOWN BUTTON */}
          <div className="relative inline-block text-left">
            {filterOpen && (
              <div
                className={`absolute z-20 mt-2 w-60 p-3 rounded shadow-lg border ${
                  isDay
                    ? "bg-white border-gray-300 text-gray-800"
                    : "bg-[#1a0f25] border-gray-700 text-gray-200"
                }`}
              >

                {/* Quick Filter */}
                <div className="mb-2">
                  <label className="text-xs font-semibold">Quick Filter</label>
                  <select
                    value={workflowQuickFilter}
                    onChange={(e) => setWorkflowQuickFilter(e.target.value as any)}
                    className={`mt-1 w-full px-2 py-1 text-xs rounded border ${
                      isDay
                        ? "bg-white text-gray-800 border-gray-300"
                        : "bg-[#140c1c] text-gray-200 border-gray-700"
                    }`}
                  >
                    <option value="all">All</option>
                    <option value="today">Created Today</option>
                    <option value="thisWeek">Created This Week</option>
                  </select>
                </div>

                {/* Sort by Name */}
                <div className="mb-2">
                  <label className="text-xs font-semibold">Sort by Name</label>
                  <select
                    value={workflowSortName}
                    onChange={(e) => setWorkflowSortName(e.target.value as any)}
                    className={`mt-1 w-full px-2 py-1 text-xs rounded border ${
                      isDay
                        ? "bg-white text-gray-800 border-gray-300"
                        : "bg-[#140c1c] text-gray-200 border-gray-700"
                    }`}
                  >
                    <option value="">Default</option>
                    <option value="az">A → Z</option>
                    <option value="za">Z → A</option>
                  </select>
                </div>

                {/* Sort by ID */}
                <div className="mb-2">
                  <label className="text-xs font-semibold">Sort by ID Length</label>
                  <select
                    value={workflowSortId}
                    onChange={(e) => setWorkflowSortId(e.target.value as any)}
                    className={`mt-1 w-full px-2 py-1 text-xs rounded border ${
                      isDay
                        ? "bg-white text-gray-800 border-gray-300"
                        : "bg-[#140c1c] text-gray-200 border-gray-700"
                    }`}
                  >
                    <option value="">Default</option>
                    <option value="short">Short → Long</option>
                    <option value="long">Long → Short</option>
                  </select>
                </div>

                {/* Sort by Date */}
                <div>
                  <label className="text-xs font-semibold">Sort by Date</label>
                  <select
                    value={workflowSortDate}
                    onChange={(e) => setWorkflowSortDate(e.target.value as any)}
                    className={`mt-1 w-full px-2 py-1 text-xs rounded border ${
                      isDay
                        ? "bg-white text-gray-800 border-gray-300"
                        : "bg-[#140c1c] text-gray-200 border-gray-700"
                    }`}
                  >
                    <option value="">Default</option>
                    <option value="new">Newest First</option>
                    <option value="old">Oldest First</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          </div>

          {/* ---------------- FILTER + SORT LOGIC ---------------- */}
          {(() => {
            let list = [...filteredWorkflows]

            // Quick Filter
            const now = new Date()
            if (workflowQuickFilter === "today") {
              list = list.filter(w => new Date(w.created_at).toDateString() === now.toDateString())
            }
            if (workflowQuickFilter === "thisWeek") {
              const weekAgo = new Date()
              weekAgo.setDate(now.getDate() - 7)
              list = list.filter(w => new Date(w.created_at) >= weekAgo)
            }

            // Sort by Name
            if (workflowSortName === "az") {
              list.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
            }
            if (workflowSortName === "za") {
              list.sort((a, b) => (b.name || "").localeCompare(a.name || ""))
            }

            // Sort by ID Length
            if (workflowSortId === "short") {
              list.sort((a, b) => a.id.length - b.id.length)
            }
            if (workflowSortId === "long") {
              list.sort((a, b) => b.id.length - a.id.length)
            }

            // Sort by Date
            if (workflowSortDate === "new") {
              list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            }
            if (workflowSortDate === "old") {
              list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            }

            return (
              <div className="space-y-2">
                {list.length > 0 ? (
                  list.map((workflow: any) => (
                    <div
                      key={workflow.id}
                      className={`${
                        isDay
                          ? "bg-gray-50 hover:bg-gray-100 text-gray-900"
                          : "bg-[#150b1e] hover:bg-[#2a172e] text-white"
                      } p-3 rounded cursor-pointer transition-colors`}
                      onClick={() => (window.location.href = `/workflows/${workflow.id}`)}
                    >
                      <div className={`text-sm font-medium truncate ${isDay ? "text-gray-900" : "text-white"}`}>
                        {workflow.name || "Untitled Workflow"}
                      </div>
                      <div className={`text-xs mt-1 font-mono ${isDay ? "text-gray-600" : "text-gray-400"}`}>
                        {workflow.id?.slice(0, 8) || "N/A"}
                      </div>

                      {workflow.created_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(workflow.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-sm py-8">
                    No saved workflows match your filters
                  </div>
                )}
              </div>
            )
          })()}
        </div>

      </div>

      {/* Node Config Panel (Overlay) */}
      {selectedNodeId && (
        <NodeConfigPanel
          nodeId={selectedNodeId}
          node={nodes.find(n => n.id === selectedNodeId) || null}
          availableNodes={nodes}
          workflowEnvVars={workflowEnvVars}
          onUpdate={handleNodeUpdate}
          theme={theme}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {/* Overlay Panels */}
      {/* <CollaborationPanel
        isVisible={collaborationVisible}
        onToggleVisibility={() => setCollaborationVisible(!collaborationVisible)}
        currentUserId="current-user-id"
        workflowId={currentWorkflowId || 'workflow-123'}
      />

      <ExecutionDebugger
        nodes={nodes}
        edges={edges}
        executionData={executionData}
        isVisible={debuggerVisible}
        onToggleVisibility={() => setDebuggerVisible(!debuggerVisible)}
      />

      <ExecutionMonitor
        nodes={nodes}
        edges={edges}
        executionData={executionData}
        isVisible={monitorVisible}
        onToggleVisibility={() => setMonitorVisible(!monitorVisible)}
      /> */}
    </div>
  )
}
