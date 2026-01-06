import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react'
import type { Connection, Edge, Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  useBlocks,
  useBlockCategories,
  useCreateWorkflow,
  useRunWorkflow,
  useWorkflow,
} from '../hooks/useApi' // Assuming these hooks are available
import { getApiBaseUrl } from '../services/apiConfig'
import { apiClient } from '../services/api'
import BlockPalette from '../components/workflow/BlockPalette'
import WorkflowNode from '../components/workflow/WorkflowNode'
import NodeConfigPanel from '../components/workflow/NodeConfigPanel'
import CollaborationPanel from '../components/workflow/CollaborationPanel'
import ExecutionDebugger from '../components/workflow/ExecutionDebugger'
import ExecutionMonitor from '../components/workflow/ExecutionMonitor'
import AIWorkflowGenerator from '../components/ai/AIWorkflowGenerator'

// Import icons (mocked, you'll need to install or replace with your actual icon library)
import {
  Save,
  Play,
  Loader,
  CheckCircle,
  Search,
  Volume2,
  Globe,
  MessageSquare,
  Sparkles,
  LayoutGrid,
  ArrowRight,
  ArrowDown,
  ChevronDown,
} from 'lucide-react' // Assuming lucide-react or similar
import {
  getLayoutedElements,
} from '../utils/workflowLayout'

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Start Here - Drag blocks from the left panel' },
    type: 'default',
  },
]
const initialEdges: Edge[] = []

// Define custom node types
const nodeTypes = {
  workflowNode: WorkflowNode,
}

export default function WorkflowBuilder() {
  const { id: workflowId } = useParams<{ id?: string }>()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [paletteVisible, setPaletteVisible] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState(new Set(['utility', 'ai']))
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [workflowEnvVars] = useState<Record<string, any>>({}) // No setter needed for now
  const [collaborationVisible, setCollaborationVisible] = useState(false)
  const [debuggerVisible, setDebuggerVisible] = useState(false)
  const [monitorVisible, setMonitorVisible] = useState(false)
  const [executionData, setExecutionData] = useState<any>(null)
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(workflowId || null)
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false)
  const [sseConnection, setSseConnection] = useState<EventSource | null>(null)
  const executionPollRef = useRef<number | null>(null)
  const executionPollCancelRef = useRef<(() => void) | null>(null)
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('LR')
  const [layoutDropdownOpen, setLayoutDropdownOpen] = useState(false)

  // --- New State for Header/Execution ---
  const [workflowName, setWorkflowName] = useState('Untitled Workflow')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [nodeCounter, setNodeCounter] = useState(1) // Used for new node ID generation
  // -------------------------------------

  const createWorkflowMutation = useCreateWorkflow()
  const runWorkflowMutation = useRunWorkflow()
  const { data: existingWorkflow, isLoading: workflowLoading } = useWorkflow(workflowId || '')

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  const { data: apiBlocks, isLoading: blocksLoading } = useBlocks()
  const { data: categoriesData } = useBlockCategories()

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

    if (normalized?.node_states) {
      setNodes(nds =>
        nds.map(node => {
          const nodeState = normalized.node_states.find((ns: any) => ns.node_id === node.id)
          if (nodeState) {
            return {
              ...node,
              data: {
                ...node.data,
                status: nodeState.status,
              },
            }
          }
          return node
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

  // Load existing workflow when workflowId is present
  useEffect(() => {
    if (existingWorkflow && workflowId) {
      console.log('Loading existing workflow:', existingWorkflow)

      // Set workflow name
      setWorkflowName(existingWorkflow.name || 'Untitled Workflow')
      setCurrentWorkflowId(workflowId)

      // Convert backend workflow data to React Flow nodes and edges
      // Support both old format (graph.nodes/edges) and new format (blocks/connections)
      const graphNodes = existingWorkflow.graph?.nodes || existingWorkflow.blocks || []
      const graphEdges = existingWorkflow.graph?.edges || existingWorkflow.connections || []

      if (graphNodes.length > 0 || graphEdges.length > 0) {
        // Convert nodes/blocks to React Flow nodes
        const loadedNodes: Node[] = graphNodes.map((node: any, index: number) => {
          const blockLabel = node.name || node.type
          const blockType = node.name || node.type || node.block_type || blockLabel
          const blockId = node.block_id || node.blockId

          return {
            id: node.id,
            type: 'workflowNode',
            position: node.position || {
              x: 100 + index * 300,
              y: 100 + Math.floor(index / 3) * 200,
            },
            data: {
              label: blockLabel,
              blockType,
              blockId,
              config: node.parameters || node.input_mapping || {},
              parameters: node.parameters || node.input_mapping || {},
              status: 'idle',
            },
          }
        })

        // Convert edges/connections to React Flow edges
        const loadedEdges: Edge[] = graphEdges.map((edge: any, index: number) => ({
          id: edge.id || `e-${edge.from_node || edge.source_node_id}-${edge.to_node || edge.target_node_id}-${index}`,
          source: edge.from_node || edge.source_node_id,
          target: edge.to_node || edge.target_node_id,
          label: edge.condition || edge.label,
        }))

        setNodes(loadedNodes)
        setEdges(loadedEdges)
        setNodeCounter(loadedNodes.length)
      }
    }
  }, [existingWorkflow, workflowId, setNodes, setEdges])

  const categories = useMemo(() => {
    if (!categoriesData) return []
    return categoriesData
  }, [categoriesData])

  const registryBlocks = useMemo(() => {
    return Array.isArray(apiBlocks) ? apiBlocks : []
  }, [apiBlocks])

  const dynamicBlockTypes = registryBlocks

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

  const onAddNode = useCallback(
    (block: any) => {
      const newId = `${block.type}-${Date.now()}`
      const blockId = block?.id || block?._id
      const blockLabel = block?.manifest?.name || block?.name || block?.type
      const newNode: Node = {
        id: newId,
        position: { x: Math.random() * 400 + 200, y: Math.random() * 400 + 200 },
        data: {
          label: blockLabel,
          blockType: blockLabel || block?.type,
          blockId,
          config: {},
          status: 'idle',
        },
        type: 'workflowNode', // Use custom node type
      }
      setNodes(nds => [...nds, newNode])
      setNodeCounter(prev => prev + 1)
    },
    [setNodes]
  )

  // Handle node update from config panel
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

  // Handle node selection
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
  }, [])

  // Handle custom events from WorkflowNode
  useEffect(() => {
    const handleOpenConfig = (e: any) => {
      setSelectedNodeId(e.detail.nodeId)
    }

    const handleTestNode = (e: any) => {
      const nodeId = e.detail.nodeId
      setSelectedNodeId(nodeId)
      // You could also trigger a test here
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

  const onTogglePalette = useCallback(() => {
    setPaletteVisible(prev => !prev)
  }, [])

  // --- Auto-Layout Function ---
  const applyAutoLayout = useCallback((direction: 'TB' | 'LR' = layoutDirection) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      { direction, spacing: 'normal' }
    )
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
    setLayoutDirection(direction)
    setLayoutDropdownOpen(false)
  }, [nodes, edges, setNodes, setEdges, layoutDirection])

  // --- Workflow helpers ---
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
        alert('Add at least one configured block before saving the workflow.')
      }
      throw new Error('No configured nodes to save')
    }

    const payload = buildWorkflowPayload()

    try {
      const workflow = await createWorkflowMutation.mutateAsync(payload)
      setCurrentWorkflowId(workflow.id)
      if (!options.silent) {
        alert('Workflow saved successfully!')
      }
      return workflow
    } catch (error) {
      console.error('Failed to save workflow:', error)
      if (!options.silent) {
        alert('Failed to save workflow. Please try again.')
      }
      throw error
    }
  }

  const runWorkflow = async () => {
    if (!hasConfigurableNodes) {
      alert('Please add and configure at least one block before running the workflow.')
      return
    }

    try {
      setIsExecuting(true)
      setExecutionResult(null)

      let workflowId = currentWorkflowId
      if (!workflowId) {
        const workflow = await saveWorkflow({ silent: true })
        workflowId = workflow.id
      }

      const execution = await runWorkflowMutation.mutateAsync(workflowId)
      applyExecutionUpdate(execution)

      // Setup SSE connection for real-time progress
      const executionId = execution?.id || execution?.execution_id
      if (executionId) {
        startExecutionPolling(executionId)
        setupSSEConnection(executionId)
      }
    } catch (error) {
      console.error('Failed to run workflow:', error)
      alert('Failed to run workflow. Please check your configuration.')
    } finally {
      setIsExecuting(false)
    }
  }

  // Setup SSE connection for execution monitoring
  const setupSSEConnection = (executionId: string) => {
    // Close existing connection if any
    if (sseConnection) {
      sseConnection.close()
    }

    const sseUrl = `${getApiBaseUrl()}/executions/${executionId}/stream`

    const eventSource = new EventSource(sseUrl, { withCredentials: true })

    eventSource.onmessage = event => {
      try {
        const update = JSON.parse(event.data)
        console.log('SSE Update:', update)

        applyExecutionUpdate(update)

        // Close connection when execution completes
        if (isTerminalStatus(update.status)) {
          eventSource.close()
          setSseConnection(null)
          setIsExecuting(false)
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error)
      }
    }

    eventSource.onerror = error => {
      console.error('SSE Error:', error)
      eventSource.close()
      setSseConnection(null)
      startExecutionPolling(executionId)
    }

    setSseConnection(eventSource)
  }

  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      if (sseConnection) {
        sseConnection.close()
      }
      stopExecutionPolling()
    }
  }, [sseConnection, stopExecutionPolling])

  // Handle AI-generated workflow
  const handleApplyAIWorkflow = (workflow: any) => {
    // Clear existing nodes and edges
    setNodes([])
    setEdges([])

    // Convert AI-generated workflow to React Flow nodes
    const newNodes: Node[] = workflow.nodes.map((node: any, index: number) => {
      const blockLabel = node.label || node.name || node.type
      return {
        id: node.id,
        type: 'workflowNode',
        position: node.position || {
          x: 100 + index * 250,
          y: 100 + Math.floor(index / 4) * 200,
        },
        data: {
          label: blockLabel,
          blockType: blockLabel || node.type,
          blockId: node.block_id || node.blockId,
          config: node.parameters,
          parameters: node.parameters,
          status: 'idle',
        },
      }
    })

    // Convert connections to React Flow edges
    const newEdges: Edge[] = workflow.connections.map((conn: any, index: number) => ({
      id: `e-${conn.from}-${conn.to}-${index}`,
      source: conn.from,
      target: conn.to,
    }))

    setNodes(newNodes)
    setEdges(newEdges)
    setWorkflowName(workflow.description || 'AI Generated Workflow')
    setNodeCounter(newNodes.length)
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
      }

      setNodes(demoNodes)
      setEdges(demoEdges)
      setWorkflowName(name)
      setNodeCounter(count)
    },
    [buildDemoNode, setEdges, setNodes]
  )
  // ------------------------------------

  // Show loading state while fetching workflow
  if (workflowId && workflowLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    )
  }

  return (
    // The outer div is the main container, set to full viewport height and flexible column layout.
    <div style={{ height: '100vh' }} className="flex flex-col bg-gray-50 overflow-hidden">
      {/* --- IMPROVED WORKFLOW HEADER UI ---
            - Increased padding for a more spacious feel.
            - Added subtle border to the title input.
            - Aligned action buttons.
            */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-md z-20 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left Section: Title and Name Input */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
              {workflowId ? 'Edit Workflow' : 'Workflow Builder'}
            </h1>
            <input
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors"
              placeholder="Workflow name..."
            />
            {workflowId && (
              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                ID: {workflowId.slice(-8)}
              </span>
            )}
          </div>

          {/* Right Section: Action Buttons */}
          <div className="flex space-x-3 items-center">
            {/* AI Workflow Generator Button */}
            <button
              onClick={() => setAiGeneratorOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-4 py-2 flex items-center space-x-2 rounded-lg transition-all text-sm font-medium shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Generate</span>
            </button>

            {/* Auto-Layout Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => applyAutoLayout()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white pl-4 pr-2 py-2 flex items-center space-x-2 rounded-lg transition-all text-sm font-medium shadow-md hover:shadow-lg"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Auto-Align</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLayoutDropdownOpen(!layoutDropdownOpen)
                  }}
                  className="ml-1 p-1 hover:bg-white/20 rounded"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </button>
              {layoutDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                  <button
                    onClick={() => applyAutoLayout('LR')}
                    className={`flex items-center w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg ${layoutDirection === 'LR' ? 'text-emerald-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Horizontal Flow
                    {layoutDirection === 'LR' && <span className="ml-auto text-emerald-500">✓</span>}
                  </button>
                  <button
                    onClick={() => applyAutoLayout('TB')}
                    className={`flex items-center w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg ${layoutDirection === 'TB' ? 'text-emerald-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <ArrowDown className="w-4 h-4 mr-2" />
                    Vertical Flow
                    {layoutDirection === 'TB' && <span className="ml-auto text-emerald-500">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* --- FIX: Load Demo Dropdown ---
                        The parent div (relative group) now covers both the button and the dropdown area,
                        and the dropdown itself has group-hover:block/group-hover:opacity-100.
                        I've simplified the transition to use 'hidden' and 'block' for reliability.
                        */}
            <div className="relative group h-full">
              <button
                // Added `h-full` wrapper to the button to ensure it aligns vertically and covers the click area.
                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-2 flex items-center space-x-2 rounded-lg transition-colors text-sm font-medium text-gray-700 h-full"
              >
                <Loader className="w-4 h-4 text-gray-500" />
                <span>Load Demo</span>
              </button>
              {/* Dropdown Menu - Use `hidden` and `group-hover:block` for stable visibility */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl hidden group-hover:block z-50 transform origin-top-right transition-all duration-150 ease-out">
                <button
                  onClick={() => loadDemoWorkflow('simple')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-t-lg"
                >
                  Simple Search
                </button>
                <button
                  onClick={() => loadDemoWorkflow('ai_research')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-b-lg"
                >
                  AI Research Pipeline
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={() => saveWorkflow().catch(() => undefined)}
              disabled={createWorkflowMutation.isPending || !hasConfigurableNodes}
              className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-2 flex items-center space-x-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
            >
              {createWorkflowMutation.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 text-gray-500" />
              )}
              <span>Save</span>
            </button>

            {/* Run Button - Primary Action */}
            <button
              onClick={runWorkflow}
              disabled={isExecuting || !hasConfigurableNodes}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 flex items-center space-x-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md hover:shadow-lg"
            >
              {isExecuting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isExecuting ? 'Executing...' : 'Run Workflow'}</span>
            </button>

            {/* Utility Icons (Toggle Panels) */}
            <div className="border-l pl-3 ml-3 flex space-x-2">
              <button
                onClick={() => setCollaborationVisible(!collaborationVisible)}
                title="Toggle Collaboration"
                className={`p-2 rounded-full transition-colors ${collaborationVisible ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMonitorVisible(!monitorVisible)}
                title="Toggle Execution Monitor"
                className={`p-2 rounded-full transition-colors ${monitorVisible ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Globe className="w-5 h-5" />
              </button>
              {/* <button // Add a toggle for the config panel state for completeness
                                onClick={() => setDebuggerVisible(!debuggerVisible)}
                                title="Toggle Debugger"
                                className={`p-2 rounded-full transition-colors ${debuggerVisible ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <Search className="w-5 h-5" />
                            </button> */}
            </div>
          </div>
        </div>

        {/* Execution Status moved to a smaller line below the actions */}
        <div className="mt-2 flex items-center justify-between text-xs">
          <div className="text-gray-500">
            Nodes: <span className="font-semibold text-gray-700">{nodes.length}</span> | Edges:{' '}
            <span className="font-semibold text-gray-700">{edges.length}</span>
            {selectedNodeId && (
              <span className="ml-4 text-purple-600 font-medium border-l pl-4">
                Config Panel Open for: **
                {nodes.find(n => n.id === selectedNodeId)?.data.label || selectedNodeId}**
              </span>
            )}
          </div>
            {executionResult && (executionResult.id || executionResult.execution_id) && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-md flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-800">
                  Execution **{executionResult.status}**! ID:{' '}
                  {(executionResult.id || executionResult.execution_id).slice(-4)}
                </span>
              </div>
            )}
        </div>
      </div>
      {/* ---------------------------- */}

      {/* Main Content Area (Layout is already fixed from previous step) */}
      <div className="flex-1 flex overflow-hidden">
        <BlockPalette
          blocks={dynamicBlockTypes}
          categories={categories}
          onAddNode={onAddNode}
          expandedCategories={expandedCategories}
          onToggleCategory={onToggleCategory}
          onLoadDemoWorkflow={loadDemoWorkflow}
          isVisible={paletteVisible}
          onToggleVisibility={onTogglePalette}
          className={paletteVisible ? 'flex-shrink-0 w-64 border-r overflow-y-auto' : 'hidden'}
        />

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#aaa" gap={10} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {selectedNodeId && (
          <NodeConfigPanel
            nodeId={selectedNodeId}
            node={nodes.find(n => n.id === selectedNodeId) || null}
            availableNodes={nodes}
            workflowEnvVars={workflowEnvVars}
            onUpdate={handleNodeUpdate}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {/* Overlay Panels (Assumed to be fixed/absolute positioned) */}
      <CollaborationPanel
        isVisible={collaborationVisible}
        onToggleVisibility={() => setCollaborationVisible(!collaborationVisible)}
        currentUserId="current-user-id"
        workflowId="workflow-123"
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
      />

      {/* AI Workflow Generator Modal */}
      <AIWorkflowGenerator
        isOpen={aiGeneratorOpen}
        onClose={() => setAiGeneratorOpen(false)}
        onApplyToCanvas={handleApplyAIWorkflow}
        onWorkflowGenerated={workflow => {
          console.log('Workflow generated:', workflow)
        }}
      />
    </div>
  )
}
