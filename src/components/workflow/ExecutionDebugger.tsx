import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  Square,
  SkipForward,
  Circle,
  AlertCircle,
  CheckCircle,
  Settings,
  X,
  Loader,
  ArrowRight, // New: Used for 'Step' button, clearer than SkipForward
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
}: ExecutionDebuggerProps) {
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([])
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isDebugging, setIsDebugging] = useState(false)
  const [executionMode, setExecutionMode] = useState<'normal' | 'step' | 'breakpoint'>('normal')
  const [selectedStep, setSelectedStep] = useState<number | null>(null)

  const panelRef = useRef<HTMLDivElement>(null)

  // --- EXISTING LOGIC REMAINS (useEffect, toggleBreakpoint, etc.) ---
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

        // Ensure all nodes are included in the execution steps, even if they have cycles or no connections
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

  const toggleBreakpoint = (nodeId: string) => {
    setBreakpoints(prev => {
      const existing = prev.find(bp => bp.nodeId === nodeId)
      if (existing) {
        // Toggle the enabled status if it exists
        return prev.map(bp => (bp.nodeId === nodeId ? { ...bp, enabled: !bp.enabled } : bp))
      } else {
        // Add new enabled breakpoint
        return [...prev, { nodeId, enabled: true }]
      }
    })
  }

  const isBreakpointEnabled = (nodeId: string) => {
    return breakpoints.some(bp => bp.nodeId === nodeId && bp.enabled)
  }

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
  // --- END OF EXISTING LOGIC ---

  // --- NEW UI HELPER FUNCTIONS ---

  const getStepStatusIcon = (status: ExecutionStep['status']) => {
    const baseClasses = 'w-4 h-4'
    switch (status) {
      case 'running':
        // IMPROVEMENT: Loader icon is prominent
        return <Loader className={`${baseClasses} text-indigo-500 animate-spin`} />
      case 'completed':
        return <CheckCircle className={`${baseClasses} text-green-500`} />
      case 'error':
        return <AlertCircle className={`${baseClasses} text-red-500`} />
      default:
        // IMPROVEMENT: Darker gray for better contrast
        return <Circle className={`${baseClasses} text-gray-500 fill-gray-200`} />
    }
  }

  // IMPROVEMENT: This function now returns classes for a left border accent, reducing card background noise
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

  // --- COMPONENT RENDER ---

  if (!isVisible) {
    return (
      <div className="fixed top-[55%] right-4 z-40">
        <button
          onClick={onToggleVisibility}
          className="bg-white border border-gray-300 rounded-full p-3 shadow-xl hover:bg-gray-100 transition-colors transform hover:scale-105"
          title="Show Execution Debugger"
        >
          <Settings className="w-6 h-6 text-indigo-600" />
        </button>
      </div>
    )
  }

  return (
    <div
      ref={panelRef}
      className="fixed bottom-4 right-4 w-[400px] max-h-[80vh] bg-white border border-gray-200 rounded-xl shadow-2xl z-40 flex flex-col font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-indigo-50/70 rounded-t-xl">
        <h3 className="text-xl font-extrabold text-gray-800 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-indigo-700" />
          <span>Workflow Debugger</span>
        </h3>
        <button
          onClick={onToggleVisibility}
          className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-white"
          title="Hide Execution Debugger"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          {!isDebugging ? (
            <button
              onClick={startDebugging}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors text-base font-semibold disabled:opacity-50"
              disabled={executionSteps.length === 0}
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Debugging</span>
            </button>
          ) : (
            <>
              <button
                onClick={executeNextStep}
                disabled={currentStepIndex >= executionSteps.length - 1}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                title="Execute Next Step (F10)"
              >
                <ArrowRight className="w-4 h-4" /> {/* Changed to ArrowRight for clarity */}
                <span>Step Over</span>
              </button>
              <button
                onClick={executeToNextBreakpoint}
                className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors text-sm font-medium"
                title="Continue to Next Breakpoint (F5)"
              >
                <Pause className="w-4 h-4" />
                <span>Continue</span>
              </button>
              <button
                onClick={stopDebugging}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors text-sm font-medium"
                title="Stop Execution"
              >
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>

        {/* Status Indicators (Improved Layout) */}
        <div className="mt-4 flex text-xs font-semibold border-b border-gray-200">
          <div className="flex-1 text-center p-3 text-gray-700 border-r border-gray-100 bg-gray-50 rounded-tl-lg">
            <div className="text-gray-500 font-medium text-xs">Mode</div>
            <div className="text-gray-900 font-extrabold text-sm capitalize">
              {isDebugging ? executionMode : 'Normal'}
            </div>
          </div>
          <div className="flex-1 text-center p-3 text-gray-700 border-r border-gray-100 bg-gray-50">
            <div className="text-gray-500 font-medium text-xs">Progress</div>
            <div className="text-gray-900 font-extrabold text-sm">
              {currentStepIndex + 1} / {executionSteps.length}
            </div>
          </div>
          <div className="flex-1 text-center p-3 text-gray-700 bg-gray-50 rounded-tr-lg">
            <div className="text-gray-500 font-medium text-xs">Breakpoints</div>
            <div className="text-gray-900 font-extrabold text-sm">
              {breakpoints.filter(bp => bp.enabled).length}
            </div>
          </div>
        </div>
      </div>

      {/* Execution Steps */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 space-y-2">
          {executionSteps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Settings className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Execution Steps Empty</p>
              <p className="text-xs mt-1">Run the workflow to populate the history.</p>
            </div>
          ) : (
            executionSteps.map((step, index) => {
              const hasBreakpoint = isBreakpointEnabled(step.nodeId)
              const isCurrentStep = index === currentStepIndex && isDebugging
              const isSelected = selectedStep === index
              const nodeName = getNodeName(step.nodeId)

              return (
                <div
                  key={`${step.nodeId}-${index}`}
                  className={`border rounded-xl p-3 cursor-pointer transition-all duration-150 shadow-sm bg-white hover:bg-gray-50
                    ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50 shadow-lg'
                        : isCurrentStep
                          ? 'border-yellow-500 ring-2 ring-yellow-200 bg-yellow-50'
                          : getStepAccentClasses(step.status) // Stronger left border accent
                    }`}
                  onClick={() => setSelectedStep(index)}
                >
                  <div className="flex items-center space-x-3">
                    {/* Breakpoint Toggle */}
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        toggleBreakpoint(step.nodeId)
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors flex-shrink-0 border-2
                        ${
                          hasBreakpoint
                            ? 'bg-red-500 border-red-700'
                            : 'bg-transparent border-gray-300 hover:border-red-500'
                        }`}
                      title={hasBreakpoint ? 'Remove breakpoint' : 'Add breakpoint'}
                    >
                      {hasBreakpoint && <Circle className="w-2.5 h-2.5 fill-white text-white" />}
                    </button>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">{getStepStatusIcon(step.status)}</div>

                    {/* Node Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{nodeName}</div>
                      <div className="text-xs text-gray-600 flex items-center space-x-2">
                        <span className="capitalize">{step.status}</span>
                        {step.executionTime !== undefined && step.status !== 'pending' && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="font-mono">{step.executionTime}ms</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Current Step Indicator (Visual Cue) */}
                    {isCurrentStep && (
                      <div className="px-2 py-0.5 bg-yellow-500 text-xs font-bold text-gray-800 rounded-full flex-shrink-0 border border-yellow-700">
                        PAUSED
                      </div>
                    )}
                  </div>

                  {/* Step Details */}
                  {isSelected && (
                    <div className="mt-3 pl-8 space-y-3 pt-3 border-t border-gray-200">
                      {step.error && (
                        <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-800">
                          <div className="flex items-center space-x-2 font-bold mb-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>Error:</span>
                          </div>
                          <pre className="mt-1 whitespace-pre-wrap font-mono text-xs overflow-x-auto text-red-900">
                            {step.error}
                          </pre>
                        </div>
                      )}

                      {/* Data Sections */}
                      {[
                        { title: 'Input Data', data: step.inputData, Icon: ArrowRight },
                        { title: 'Output Data', data: step.outputData, Icon: CheckCircle },
                      ].map(
                        ({ title, data, Icon }) =>
                          data && (
                            <div key={title}>
                              <div className="text-xs font-bold text-gray-700 mb-1 flex items-center">
                                <Icon className="w-3 h-3 mr-1 text-indigo-500" />
                                {title}:
                              </div>
                              <pre className="text-xs bg-gray-100 p-2 rounded-lg border border-gray-300 overflow-x-auto max-h-40 text-gray-800 font-mono shadow-inner">
                                {JSON.stringify(data, null, 2)}
                              </pre>
                            </div>
                          )
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
