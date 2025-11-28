import React, { memo } from 'react'
import { Handle, Position, type Node } from '@xyflow/react'
import {
  Settings,
  Play,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Zap,
  Database,
  Globe,
  Code,
  GripVertical,
} from 'lucide-react'

export interface WorkflowNodeData {
  label: string
  blockType: string
  config?: Record<string, any>
  status?: 'idle' | 'running' | 'success' | 'error'
  executionTime?: number
  error?: string
  outputData?: any
}

interface WorkflowNodeProps {
  data: WorkflowNodeData
  selected?: boolean
  id: string
}

type ThemeMode = 'day' | 'night'

interface WorkflowNodePropsWithTheme extends WorkflowNodeProps {
  theme?: ThemeMode
}

const getBlockIcon = (blockType: string) => {
  const type = blockType.toLowerCase()
  if (type.includes('ai') || type.includes('llm') || type.includes('chat')) return Zap
  if (type.includes('data') || type.includes('database') || type.includes('storage'))
    return Database
  if (
    type.includes('http') ||
    type.includes('api') ||
    type.includes('web') ||
    type.includes('network')
  )
    return Globe
  return Code
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'running':
      return 'border-blue-500 shadow-blue-500/30 bg-gray-800'
    case 'success':
      return 'border-green-500 shadow-green-500/30 bg-gray-800'
    case 'error':
      return 'border-red-500 shadow-red-500/30 bg-gray-800'
    default:
      return 'border-gray-600 shadow-lg bg-gray-800'
  }
}

const getStatusColorClass = (status?: string, type: 'icon' | 'bg') => {
  switch (status) {
    case 'running':
      return type === 'icon' ? 'text-blue-400' : 'bg-blue-500'
    case 'success':
      return type === 'icon' ? 'text-green-400' : 'bg-green-500'
    case 'error':
      return type === 'icon' ? 'text-red-400' : 'bg-red-500'
    default:
      return type === 'icon' ? 'text-gray-400' : 'bg-gray-500'
  }
}

const getStatusIcon = (status?: string) => {
  const colorClass = getStatusColorClass(status, 'icon')
  switch (status) {
    case 'running':
      return <Loader2 className={`w-4 h-4 ${colorClass} animate-spin`} />
    case 'success':
      return <CheckCircle className={`w-4 h-4 ${colorClass}`} />
    case 'error':
      return <XCircle className={`w-4 h-4 ${colorClass}`} />
    default:
      return <Clock className={`w-4 h-4 ${colorClass}`} />
  }
}

const WorkflowNode = ({ data, selected, id, theme }: WorkflowNodePropsWithTheme) => {
  const isDay = theme === 'day'
  const BlockIcon = getBlockIcon(data.blockType)
  const statusColor = getStatusColor(data.status)
  const wrapperStatusClass = isDay ? 'border-gray-200 bg-white' : statusColor

  return (
    <div className="group">
      {/* Quick Action Control Bar */}
      <div
        className={`absolute -top-10 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-200 ${
          selected || data.status === 'running'
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <div className={`flex space-x-1 rounded-lg p-1 ${isDay ? 'bg-white border border-gray-200 shadow' : 'bg-gray-800 border border-gray-700 shadow-xl'}`}>
          <button
            title="Configure Node"
            onClick={e => {
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent('openNodeConfig', { detail: { nodeId: id } }))
            }}
            className={`p-1.5 rounded-md transition-colors duration-150 ${isDay ? 'text-gray-700 hover:bg-blue-600 hover:text-white' : 'text-gray-300 hover:bg-blue-600 hover:text-white'}`}
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            title="Test Node"
            onClick={e => {
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent('testNode', { detail: { nodeId: id } }))
            }}
            className={`p-1.5 rounded-md transition-colors duration-150 ${isDay ? 'text-gray-700 hover:bg-green-600 hover:text-white' : 'text-gray-300 hover:bg-green-600 hover:text-white'}`}
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            title="Delete Node"
            onClick={e => {
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent('deleteNode', { detail: { nodeId: id } }))
            }}
            className={`p-1.5 rounded-md transition-colors duration-150 ${isDay ? 'text-gray-700 hover:bg-red-600 hover:text-white' : 'text-gray-300 hover:bg-red-600 hover:text-white'}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Node Structure */}
      <div
        className={`relative min-w-[220px] max-w-[300px] rounded-xl border-2 transition-all duration-300 ${wrapperStatusClass} ${
          selected ? (isDay ? 'ring-4 ring-blue-500/30 ring-offset-2 ring-offset-white shadow-2xl' : 'ring-4 ring-blue-500/50 ring-offset-2 ring-offset-gray-900 shadow-2xl') : (isDay ? 'shadow' : 'shadow-lg')
        }`}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-4 h-4 -left-2 !bg-blue-500 border-2 border-gray-800 rounded-full transition-transform duration-200 hover:scale-125"
          isConnectable={true}
        />

        {/* Node Header */}
        <div className={`px-4 py-3 border-b ${isDay ? 'border-gray-200 bg-white rounded-t-[10px]' : 'border-gray-700 bg-gradient-to-r from-gray-700 to-gray-800 rounded-t-[10px]'}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDay ? 'bg-gray-50 border border-gray-200' : 'bg-gray-700 shadow-sm border border-gray-600'}`}>
              <BlockIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-base font-bold truncate ${isDay ? 'text-gray-900' : 'text-gray-100'}`}>{data.label}</div>
              <div className={`text-xs truncate mt-0.5 font-mono ${isDay ? 'text-gray-600' : 'text-gray-400'}`}>
                {data.blockType}
              </div>
            </div>
          </div>
        </div>

        {/* Node Body */}
        <div className="px-4 py-3 space-y-3">
          {/* Configuration Preview */}
          {data.config && Object.keys(data.config).length > 0 && (
            <div>
              <div className={`text-xs font-semibold uppercase mb-2 ${isDay ? 'text-gray-600' : 'text-gray-400'}`}>
                Configuration
              </div>
              <div className="space-y-1.5">
                {Object.entries(data.config)
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className={`text-xs rounded-lg px-3 py-2 truncate border ${isDay ? 'bg-gray-50 border-gray-200' : 'bg-gray-700 border-gray-600'}`}
                    >
                      <span className={`font-semibold ${isDay ? 'text-gray-900' : 'text-gray-200'}`}>{key}:</span>{' '}
                      <span className={`${isDay ? 'text-gray-700' : 'text-gray-300'}`}>
                        {typeof value === 'object'
                          ? `[${Object.keys(value).length} items]`
                          : String(value).substring(0, 30)}
                      </span>
                    </div>
                  ))}
                {Object.keys(data.config).length > 2 && (
                  <div className={`text-xs italic pl-3 ${isDay ? 'text-gray-600' : 'text-gray-500'}`}>
                    +{Object.keys(data.config).length - 2} more parameters...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Execution Info */}
          {(data.status !== 'idle' || data.executionTime !== undefined) && (
            <div className="pt-2 border-t border-gray-700">
              {data.executionTime !== undefined && (
                <div className="flex items-center space-x-1.5 text-xs text-gray-300">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-medium">Execution:</span>
                  <span className="font-mono font-semibold">{data.executionTime.toFixed(2)}ms</span>
                </div>
              )}

              {/* Error Message */}
              {data.status === 'error' && data.error && (
                <div className="mt-2 p-2.5 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-red-300 break-words">
                      <span className="font-bold">Error:</span>{' '}
                      {data.error.length > 50 ? data.error.substring(0, 50) + '...' : data.error}
                    </div>
                  </div>
                </div>
              )}

              {/* Success Output */}
              {data.status === 'success' && data.outputData && (
                <div className="mt-2 p-2.5 bg-green-900/30 border border-green-700/50 rounded-lg">
                  <div className="text-xs text-green-300 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div className="font-medium truncate">
                      Output:{' '}
                      {typeof data.outputData === 'object'
                        ? `${Object.keys(data.outputData).length} fields`
                        : 'Data ready'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-4 h-4 -right-2 !bg-green-500 border-2 border-gray-800 rounded-full transition-transform duration-200 hover:scale-125"
          isConnectable={true}
        />

        {/* Status Badge */}
        {data.status && data.status !== 'idle' && (
          <div className="absolute -top-3 -right-3 z-30">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-800 ${getStatusColorClass(data.status, 'bg')}`}
            >
              {data.status === 'running' && <Loader2 className="w-4 h-4 text-white animate-spin" />}
              {data.status === 'success' && <CheckCircle className="w-4 h-4 text-white" />}
              {data.status === 'error' && <XCircle className="w-4 h-4 text-white" />}
            </div>
          </div>
        )}

        {/* Drag Handle */}
        <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 p-1 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}

export default memo(WorkflowNode)
