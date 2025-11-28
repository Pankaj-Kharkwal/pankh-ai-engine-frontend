import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertCircle,
  X,
  Loader,
  ArrowRight,
  Circle,
  Settings,
} from 'lucide-react'
import type { Node, Edge } from '@xyflow/react'

interface ExecutionDebuggerProps {
  nodes: Node[]
  edges: Edge[]
  executionData?: any
  isVisible: boolean
  onToggleVisibility: () => void
  onExecuteStep?: (nodeId: string) => void
  onExecuteToBreakpoint?: (breakpointNodeId: string) => void
  onStopExecution?: () => void
  isDay?: boolean // THEME PROP: true = light mode, false = dark mode
}

interface Breakpoint {
  nodeId: string
  enabled: boolean
}

interface ExecutionStep {
  nodeId: string
  status: 'pending' | 'running' | 'completed' | 'error'
  inputData?: any
  outputData?: any
  error?: string
  executionTime?: number
  timestamp: Date
}

export default function ExecutionDebugger({
  nodes,
  edges,
  executionData,
  isVisible,
  onToggleVisibility,
  onExecuteStep,
  onExecuteToBreakpoint,
  onStopExecution,
  isDay = false,
}: ExecutionDebuggerProps) {
  // --- state (kept your logic) ---
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([])
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isDebugging, setIsDebugging] = useState(false)
  const [executionMode, setExecutionMode] = useState<'normal' | 'step' | 'breakpoint'>('normal')
  const [selectedStep, setSelectedStep] = useState<number | null>(null)

  const panelRef = useRef<HTMLDivElement | null>(null)

  // --- keep existing parsing logic (unchanged behavior) ---
  useEffect(() => {
    if (executionData?.nodeResults) {
      const steps: ExecutionStep[] = []
      const processedNodes = new Set<string>()

      const getExecutionOrder = (): string[] => {
        const order: string[] = []
        const visited = new Set<string>()
        const visiting = new Set<string>()

        const visit = (nodeId: string) => {
          if (visited.has(nodeId) || visiting.has(nodeId)) return
          visiting.add(nodeId)
          const incomingEdges = edges.filter(edge => edge.target === nodeId)
          incomingEdges.forEach(edge => visit(edge.source))
          visiting.delete(nodeId)
          visited.add(nodeId)
          order.push(nodeId)
        }

        nodes.forEach(node => {
          const hasIncoming = edges.some(edge => edge.target === node.id)
          if (!hasIncoming) {
            visit(node.id)
          }
        })
        nodes.forEach(node => {
          if (!order.includes(node.id)) {
            order.push(node.id)
          }
        })
        return order
      }
      const executionOrder = getExecutionOrder()
      executionOrder.forEach(nodeId => {
        const result = executionData.nodeResults[nodeId]
        if (result) {
          steps.push({
            nodeId,
            status: result.success ? 'completed' : 'error',
            inputData: result.inputData,
            outputData: result.outputData,
            error: result.error,
            executionTime: result.executionTime,
            timestamp: new Date(result.timestamp || Date.now()),
          })
          processedNodes.add(nodeId)
        } else {
          steps.push({
            nodeId,
            status: 'pending',
            timestamp: new Date(),
          })
        }
      })
      setExecutionSteps(steps)
      setCurrentStepIndex(
        steps.findIndex(step => step.status === 'running') !== -1
          ? steps.findIndex(step => step.status === 'running')
          : steps.length - 1
      )
    } else {
      setExecutionSteps([])
      setCurrentStepIndex(-1)
    }
  }, [executionData, nodes, edges])

  // --- breakpoint helpers (same behavior) ---
  const toggleBreakpoint = (nodeId: string) => {
    setBreakpoints(prev => {
      const existing = prev.find(bp => bp.nodeId === nodeId)
      if (existing) {
        return prev.map(bp => (bp.nodeId === nodeId ? { ...bp, enabled: !bp.enabled } : bp))
      } else {
        return [...prev, { nodeId, enabled: true }]
      }
    })
  }

  const isBreakpointEnabled = (nodeId: string) => {
    return breakpoints.some(bp => bp.nodeId === nodeId && bp.enabled)
  }

  // --- execution controls (same behavior) ---
  const startDebugging = () => {
    setIsDebugging(true)
    setExecutionMode('step')
    setCurrentStepIndex(0)
    setSelectedStep(0)
  }

  const stopDebugging = () => {
    setIsDebugging(false)
    setExecutionMode('normal')
    setCurrentStepIndex(-1)
    setSelectedStep(null)
    onStopExecution?.()
  }

  const executeNextStep = () => {
    if (currentStepIndex < executionSteps.length - 1) {
      const nextStep = executionSteps[currentStepIndex + 1]
      setCurrentStepIndex(currentStepIndex + 1)
      setSelectedStep(currentStepIndex + 1)
      onExecuteStep?.(nextStep.nodeId)
    }
  }

  const executeToNextBreakpoint = () => {
    const nextBreakpointIndex = executionSteps.findIndex(
      (step, index) => index > currentStepIndex && isBreakpointEnabled(step.nodeId)
    )

    if (nextBreakpointIndex !== -1) {
      setCurrentStepIndex(nextBreakpointIndex)
      setSelectedStep(nextBreakpointIndex)
      onExecuteToBreakpoint?.(executionSteps[nextBreakpointIndex].nodeId)
    }
  }

  const getNodeName = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    return node?.data?.label || node?.type || nodeId
  }

  // --- UI helpers (modified for theme) ---
  const getStepStatusIcon = (status: ExecutionStep['status']) => {
    const baseClasses = 'w-4 h-4'
    switch (status) {
      case 'running':
        return <Loader className={`${baseClasses} animate-spin text-indigo-500`} />
      case 'completed':
        return <CheckCircle className={`${baseClasses} text-green-500`} />
      case 'error':
        return <AlertCircle className={`${baseClasses} text-red-500`} />
      default:
        return <Circle className={`${baseClasses} text-gray-400`} />
    }
  }

  const getStepAccentClasses = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'running':
        return 'border-l-4 border-indigo-400'
      case 'completed':
        return 'border-l-4 border-green-400'
      case 'error':
        return 'border-l-4 border-red-400'
      default:
        return 'border-l-4 border-gray-300'
    }
  }

  // theme helpers
  const bgMain = isDay ? 'bg-white' : 'bg-[#071020]'
  const panelGlass = isDay ? 'bg-white/90' : 'bg-[#0b1220]/70 backdrop-blur-md'
  const headerBg = isDay ? 'bg-gradient-to-r from-indigo-50 to-white' : 'bg-gradient-to-r from-[#071428]/40 to-[#071020]/10'
  const textPrimary = isDay ? 'text-gray-900' : 'text-white'
  const textMuted = isDay ? 'text-gray-600' : 'text-gray-300'

  // --- Render ---

  return (
    <>
      <AnimatePresence>
          <motion.div
            key="execution-debugger-panel"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className={`fixed bottom-4 right-4 z-50 w-[420px] max-h-[82vh] rounded-xl shadow-2xl ${panelGlass} border ${isDay ? 'border-gray-200' : 'border-[#162033]'}`}
            ref={panelRef}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${headerBg} border-b ${isDay ? 'border-gray-100' : 'border-[#111827]'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${isDay ? 'bg-indigo-100' : 'bg-indigo-900/20'}`}>
                  <Settings className={`w-5 h-5 ${isDay ? 'text-indigo-700' : 'text-indigo-300'}`} />
                </div>
                <div>
                  <div className={`text-sm font-bold ${textPrimary}`}>Workflow Debugger</div>
                  <div className={`text-[12px] ${textMuted}`}>Step through execution, inspect I/O, set breakpoints</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleVisibility}
                  className={`p-1.5 rounded-md transition-colors ${isDay ? 'hover:bg-gray-100' : 'hover:bg-[#081422]'}`}
                  title="Hide"
                >
                  <X className={`${isDay ? 'text-gray-700' : 'text-gray-200'} w-5 h-5`} />
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className={`px-4 py-3 border-b ${isDay ? 'border-gray-100' : 'border-[#0f2433]'} ${isDay ? 'bg-white/60' : 'bg-transparent'}`}>
              <div className="flex items-center gap-2">
                {!isDebugging ? (
                  <button
                    onClick={startDebugging}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${isDay ? 'bg-indigo-600 text-white' : 'bg-indigo-500/90 text-white'} shadow-sm hover:brightness-105 transition-all`}
                    disabled={executionSteps.length === 0}
                  >
                    <Play className="w-4 h-4" />
                    Start Debugging
                  </button>
                ) : (
                  <>
                    <button
                      onClick={executeNextStep}
                      disabled={currentStepIndex >= executionSteps.length - 1}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white font-medium shadow-sm hover:brightness-105 disabled:opacity-60"
                      title="Step Over"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Step
                    </button>

                    <button
                      onClick={executeToNextBreakpoint}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 text-white font-medium shadow-sm hover:brightness-105"
                      title="Continue to Breakpoint"
                    >
                      <Pause className="w-4 h-4" />
                      Continue
                    </button>

                    <button
                      onClick={stopDebugging}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 text-white font-medium shadow-sm hover:brightness-95"
                      title="Stop"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </button>
                  </>
                )}
              </div>

              {/* Stats row */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-medium">
                <div className={`text-center rounded-md px-2 py-1 ${isDay ? 'bg-white' : 'bg-[#071827]/40'}`}>
                  <div className={`text-[11px] ${textMuted}`}>Mode</div>
                  <div className={`text-sm ${textPrimary}`}>{isDebugging ? executionMode : 'Normal'}</div>
                </div>
                <div className={`text-center rounded-md px-2 py-1 ${isDay ? 'bg-white' : 'bg-[#071827]/40'}`}>
                  <div className={`text-[11px] ${textMuted}`}>Progress</div>
                  <div className={`text-sm ${textPrimary}`}>{currentStepIndex + 1} / {executionSteps.length}</div>
                </div>
                <div className={`text-center rounded-md px-2 py-1 ${isDay ? 'bg-white' : 'bg-[#071827]/40'}`}>
                  <div className={`text-[11px] ${textMuted}`}>Breakpoints</div>
                  <div className={`text-sm ${textPrimary}`}>{breakpoints.filter(bp => bp.enabled).length}</div>
                </div>
              </div>
            </div>

            {/* Steps list */}
            <div className="overflow-y-auto max-h-[48vh] px-3 py-3 space-y-2">
              {executionSteps.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className={`w-12 h-12 mx-auto mb-3 ${isDay ? 'text-indigo-600' : 'text-indigo-300'}`} />
                  <div className={`text-sm font-semibold ${textPrimary}`}>No execution steps yet</div>
                  <div className={`text-xs mt-1 ${textMuted}`}>Run the workflow to populate the history.</div>
                </div>
              ) : (
                executionSteps.map((step, index) => {
                  const hasBreakpoint = isBreakpointEnabled(step.nodeId)
                  const isCurrentStep = index === currentStepIndex && isDebugging
                  const isSelected = selectedStep === index
                  const nodeName = getNodeName(step.nodeId)

                  const selectedClasses = isSelected ? (isDay ? 'ring-2 ring-indigo-200 bg-indigo-50' : 'ring-2 ring-indigo-600 bg-[#071a2b]') : ''
                  const currentClasses = isCurrentStep ? 'bg-amber-50 border-amber-300' : ''

                  return (
                    <motion.div
                      key={`${step.nodeId}-${index}`}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16 }}
                      onClick={() => setSelectedStep(index)}
                      className={`rounded-lg p-3 border ${getStepAccentClasses(step.status)} cursor-pointer ${selectedClasses} ${currentClasses} ${isDay ? 'bg-white' : 'bg-[#071a2b]/60'} shadow-sm`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Breakpoint toggle */}
                        <button
                          onClick={e => { e.stopPropagation(); toggleBreakpoint(step.nodeId) }}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border-2 ${hasBreakpoint ? 'bg-red-500 border-red-700' : `${isDay ? 'border-gray-200' : 'border-gray-600'} bg-transparent hover:border-red-500`}`}
                          title={hasBreakpoint ? 'Disable breakpoint' : 'Enable breakpoint'}
                        >
                          {hasBreakpoint ? <Circle className="w-3 h-3 fill-white text-white" /> : <div className="w-2.5 h-2.5 rounded-full bg-transparent" />}
                        </button>

                        {/* Status icon */}
                        <div className="flex-shrink-0">
                          {getStepStatusIcon(step.status)}
                        </div>

                        {/* Node info */}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold truncate ${isDay ? 'text-gray-900' : 'text-white'}`}>{nodeName}</div>
                          <div className={`text-xs mt-0.5 flex items-center gap-2 ${isDay ? 'text-gray-500' : 'text-gray-300'}`}>
                            <span className="capitalize">{step.status}</span>
                            {step.executionTime !== undefined && step.status !== 'pending' && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[12px]">{step.executionTime}ms</span>
                              </>
                            )}
                            <span className="ml-auto text-[11px] text-gray-400">{new Date(step.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        {/* Current indicator */}
                        {isCurrentStep && (
                          <div className="px-2 py-0.5 bg-amber-500 text-xs font-bold text-gray-900 rounded-full border border-amber-700">
                            PAUSED
                          </div>
                        )}
                      </div>

                      {/* Details — expand when selected */}
                      {isSelected && (
                        <div className="mt-3 pl-10 pt-3 border-t pt-3">
                          {step.error && (
                            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 mb-3">
                              <div className="flex items-center gap-2 font-bold mb-1">
                                <AlertCircle className="w-4 h-4" />
                                <span>Error</span>
                              </div>
                              <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">{String(step.error)}</pre>
                            </div>
                          )}

                          {[
                            { title: 'Input Data', data: step.inputData },
                            { title: 'Output Data', data: step.outputData },
                          ].map(({ title, data }) =>
                            data ? (
                              <div key={title} className="mb-3">
                                <div className={`text-xs font-bold mb-1 ${isDay ? 'text-gray-700' : 'text-gray-300'}`}>{title}</div>
                                <pre className={`text-xs font-mono p-2 rounded border ${isDay ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-[#021024] border-[#062033] text-gray-200' } overflow-x-auto max-h-48`}>
                                  {JSON.stringify(data, null, 2)}
                                </pre>
                              </div>
                            ) : null
                          )}
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
      </AnimatePresence>
    </>
  )
}
