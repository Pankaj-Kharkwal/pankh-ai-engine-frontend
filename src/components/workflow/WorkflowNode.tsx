import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
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
  Mail,
  MessageSquare,
  Hash,
  FileText,
  Lock,
  Cloud,
  Filter,
  GitBranch,
} from 'lucide-react'
import {
  getNodeClasses,
  getNodeHeaderClasses,
  getNodeIconClasses,
  getHandleClasses,
} from '../../utils/nodeColors'

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

const getBlockIcon = (blockType: string) => {
  const type = blockType.toLowerCase()

  if (type.includes('ai') || type.includes('llm') || type.includes('chat') ||
      type.includes('gpt') || type.includes('summarize') || type.includes('translate')) {
    return Zap
  }
  if (type.includes('data') || type.includes('database') || type.includes('storage') ||
      type.includes('json') || type.includes('csv') || type.includes('parse')) {
    return Database
  }
  if (type.includes('filter') || type.includes('sort')) {
    return Filter
  }
  if (type.includes('http') || type.includes('api') || type.includes('web') ||
      type.includes('network') || type.includes('webhook') || type.includes('scrape')) {
    return Globe
  }
  if (type.includes('email') || type.includes('mail')) {
    return Mail
  }
  if (type.includes('slack') || type.includes('discord') || type.includes('sms') ||
      type.includes('message')) {
    return MessageSquare
  }
  if (type.includes('math') || type.includes('sum') || type.includes('statistic') ||
      type.includes('random') || type.includes('hash')) {
    return Hash
  }
  if (type.includes('file') || type.includes('pdf') || type.includes('document') ||
      type.includes('read') || type.includes('write')) {
    return FileText
  }
  if (type.includes('encrypt') || type.includes('jwt') || type.includes('password') ||
      type.includes('auth') || type.includes('security')) {
    return Lock
  }
  if (type.includes('github') || type.includes('google') || type.includes('aws') ||
      type.includes('docker') || type.includes('k8s')) {
    return Cloud
  }
  if (type.includes('condition') || type.includes('loop') || type.includes('branch')) {
    return GitBranch
  }
  return Code
}

const getStatusOverlay = (status?: string) => {
  switch (status) {
    case 'running':
      return 'ring-4 ring-blue-400 ring-opacity-50 animate-pulse'
    case 'success':
      return 'ring-2 ring-green-400 ring-opacity-50'
    case 'error':
      return 'ring-2 ring-red-400 ring-opacity-50'
    default:
      return ''
  }
}

const getStatusColorClass = (status?: string, type: 'icon' | 'bg') => {
  switch (status) {
    case 'running':
      return type === 'icon' ? 'text-blue-600' : 'bg-blue-500'
    case 'success':
      return type === 'icon' ? 'text-green-600' : 'bg-green-500'
    case 'error':
      return type === 'icon' ? 'text-red-600' : 'bg-red-500'
    default:
      return type === 'icon' ? 'text-gray-400' : 'bg-gray-400'
  }
}

const WorkflowNode = ({ data, selected, id }: WorkflowNodeProps) => {
  const BlockIcon = getBlockIcon(data.blockType)
  const nodeClasses = getNodeClasses(data.blockType, selected)
  const headerClasses = getNodeHeaderClasses(data.blockType)
  const iconClasses = getNodeIconClasses(data.blockType)
  const inputHandleClass = getHandleClasses(data.blockType, 'input')
  const outputHandleClass = getHandleClasses(data.blockType, 'output')
  const statusOverlay = getStatusOverlay(data.status)

  return (
    <div className="group">
      {/* Quick Action Control Bar */}
      <div
        className={`absolute -top-10 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-200 ${
          selected || data.status === 'running' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            title="Configure Node"
            onClick={e => {
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent('openNodeConfig', { detail: { nodeId: id } }))
            }}
            className="p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-colors duration-150"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            title="Test Node"
            onClick={e => {
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent('testNode', { detail: { nodeId: id } }))
            }}
            className="p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-green-600 hover:text-white transition-colors duration-150"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            title="Delete Node"
            onClick={e => {
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent('deleteNode', { detail: { nodeId: id } }))
            }}
            className="p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-150"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Node Structure */}
      <div className={`relative min-w-[220px] max-w-[300px] rounded-xl shadow-lg ${nodeClasses} ${statusOverlay}`}>
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className={`w-4 h-4 -left-2 ${inputHandleClass} border-2 border-white dark:border-gray-800 rounded-full transition-transform duration-200 hover:scale-125`}
          isConnectable={true}
        />

        {/* Node Header */}
        <div className={`px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50 rounded-t-[10px] ${headerClasses}`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg shadow-sm ${iconClasses}`}>
              <BlockIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-gray-900 dark:text-white truncate">{data.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 font-mono">{data.blockType}</div>
            </div>
          </div>
        </div>

        {/* Node Body */}
        <div className="px-4 py-3 space-y-3">
          {/* Configuration Preview */}
          {data.config && Object.keys(data.config).length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-2">Configuration</div>
              <div className="space-y-1.5">
                {Object.entries(data.config).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="text-xs bg-white/60 dark:bg-gray-800/60 rounded-lg px-3 py-2 truncate border border-gray-200/50 dark:border-gray-700/50">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{key}:</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">
                      {typeof value === 'object' ? `[${Object.keys(value).length} items]` : String(value).substring(0, 30)}
                    </span>
                  </div>
                ))}
                {Object.keys(data.config).length > 2 && (
                  <div className="text-xs text-gray-500 italic pl-3">+{Object.keys(data.config).length - 2} more...</div>
                )}
              </div>
            </div>
          )}

          {/* Execution Info */}
          {(data.status !== 'idle' || data.executionTime !== undefined) && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50">
              {data.executionTime !== undefined && (
                <div className="flex items-center space-x-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span className="font-medium">Execution:</span>
                  <span className="font-mono font-semibold">{data.executionTime.toFixed(2)}ms</span>
                </div>
              )}
              {data.status === 'error' && data.error && (
                <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-red-800 dark:text-red-300 break-words">
                      <span className="font-bold">Error:</span> {data.error.length > 50 ? data.error.substring(0, 50) + '...' : data.error}
                    </div>
                  </div>
                </div>
              )}
              {data.status === 'success' && data.outputData && (
                <div className="mt-2 p-2.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="text-xs text-green-800 dark:text-green-300 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="font-medium truncate">
                      Output: {typeof data.outputData === 'object' ? `${Object.keys(data.outputData).length} fields` : 'Data ready'}
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
          className={`w-4 h-4 -right-2 ${outputHandleClass} border-2 border-white dark:border-gray-800 rounded-full transition-transform duration-200 hover:scale-125`}
          isConnectable={true}
        />

        {/* Status Badge */}
        {data.status && data.status !== 'idle' && (
          <div className="absolute -top-3 -right-3 z-30">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 ${getStatusColorClass(data.status, 'bg')}`}>
              {data.status === 'running' && <Loader2 className="w-4 h-4 text-white animate-spin" />}
              {data.status === 'success' && <CheckCircle className="w-4 h-4 text-white" />}
              {data.status === 'error' && <XCircle className="w-4 h-4 text-white" />}
            </div>
          </div>
        )}

        {/* Drag Handle */}
        <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}

export default memo(WorkflowNode)
