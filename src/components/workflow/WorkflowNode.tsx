import React, { memo } from 'react';
import { Handle, Position, type Node } from '@xyflow/react';
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
  GripVertical, // New icon for drag handle
} from 'lucide-react';

export interface WorkflowNodeData {
  label: string;
  blockType: string;
  config?: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  executionTime?: number;
  error?: string;
  outputData?: any;
}

// Define props type for custom node
interface WorkflowNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
  id: string;
}

const getBlockIcon = (blockType: string) => {
  const type = blockType.toLowerCase();
  if (type.includes('ai') || type.includes('llm') || type.includes('chat')) return Zap;
  if (type.includes('data') || type.includes('database') || type.includes('storage')) return Database;
  if (type.includes('http') || type.includes('api') || type.includes('web') || type.includes('network')) return Globe;
  return Code; // Default to Code for utility/logic
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'running':
      return 'border-blue-500 shadow-blue-200/50 bg-blue-50';
    case 'success':
      return 'border-green-500 shadow-green-200/50 bg-green-50';
    case 'error':
      return 'border-red-500 shadow-red-200/50 bg-red-50';
    default:
      return 'border-gray-300 shadow-md bg-white';
  }
};

const getStatusColorClass = (status?: string, type: 'icon' | 'bg') => {
  switch (status) {
    case 'running':
      return type === 'icon' ? 'text-blue-600' : 'bg-blue-500';
    case 'success':
      return type === 'icon' ? 'text-green-600' : 'bg-green-500';
    case 'error':
      return type === 'icon' ? 'text-red-600' : 'bg-red-500';
    default:
      return type === 'icon' ? 'text-gray-400' : 'bg-gray-400';
  }
};

const getStatusIcon = (status?: string) => {
  const colorClass = getStatusColorClass(status, 'icon');
  switch (status) {
    case 'running':
      return <Loader2 className={`w-4 h-4 ${colorClass} animate-spin`} />;
    case 'success':
      return <CheckCircle className={`w-4 h-4 ${colorClass}`} />;
    case 'error':
      return <XCircle className={`w-4 h-4 ${colorClass}`} />;
    default:
      return <Clock className={`w-4 h-4 ${colorClass}`} />;
  }
};

const WorkflowNode = ({ data, selected, id }: WorkflowNodeProps) => {
  const BlockIcon = getBlockIcon(data.blockType);
  const statusColor = getStatusColor(data.status);

  return (
    // Group for applying hover state to children (the quick actions)
    <div className="group">
      {/* --- 1. Quick Action Control Bar (n8n Style) --- */}
      <div
        className={`absolute -top-10 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-200 ${
          selected || data.status === 'running'
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <div className="flex space-x-1.5 p-1">
          {/* Configure */}
          <button
            title="Configure Node"
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(
                new CustomEvent('openNodeConfig', { detail: { nodeId: id } }),
              );
            }}
            className="p-1 rounded-md  text-gray-900 hover:bg-blue-600 hover:text-white transition-colors duration-150"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Test/Run Node */}
          <button
            title="Test Node"
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('testNode', { detail: { nodeId: id } }));
            }}
            className="p-1 rounded-md  text-gray-900 hover:bg-green-600 hover:text-white transition-colors duration-150"
          >
            <Play className="w-4 h-4" />
          </button>

          {/* Delete Node */}
          <button
            title="Delete Node"
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(
                new CustomEvent('deleteNode', { detail: { nodeId: id } }),
              );
            }}
            className="p-1 rounded-md  text-gray-900 hover:bg-red-600 hover:text-white transition-colors duration-150"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* --- End Quick Action Control Bar --- */}

      {/* --- 2. Main Node Structure --- */}
      <div
        className={`relative min-w-[220px] max-w-[300px] rounded-xl border-2 transition-all duration-300 ${
          statusColor
        } ${selected ? 'ring-4 ring-blue-300 ring-offset-2 shadow-2xl' : 'shadow-lg'}`}
      >
        {/* Input Handle (Target) */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-4 h-4 -left-2 !bg-blue-500 border-2 border-white rounded-full transition-transform duration-200 group-hover:scale-125"
          isConnectable={true}
        />

        {/* Node Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/70 rounded-t-[10px] backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            {/* Icon Area */}
            <div className="p-1 rounded-md bg-white shadow-sm border border-gray-100">
              <BlockIcon className="w-5 h-5 text-gray-700" />
            </div>
            {/* Labels */}
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-gray-900 truncate">
                {data.label}
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5 font-mono">
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
              <div className="text-xs font-semibold uppercase text-gray-600 mb-1">
                Configuration
              </div>
              <div className="space-y-1">
                {Object.entries(data.config)
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="text-xs bg-gray-100 rounded px-2 py-1 truncate border border-gray-200"
                    >
                      <span className="font-mono font-medium text-gray-700">{key}:</span>{' '}
                      <span className="text-gray-600">
                        {typeof value === 'object'
                          ? `[${Object.keys(value).length} items]`
                          : String(value).substring(0, 30)}
                      </span>
                    </div>
                  ))}
                {Object.keys(data.config).length > 2 && (
                  <div className="text-xs text-gray-500 italic">
                    +{Object.keys(data.config).length - 2} more parameters...
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Execution Info / Messages */}
        {(data.status !== 'idle' || data.executionTime !== undefined) && (
          <div className="pt-2 border-t border-gray-100">
            {/* Execution Time */}
            {data.executionTime !== undefined && (
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className='font-medium'>Execution Time:</span>
                <span className='font-mono'>{data.executionTime.toFixed(2)}ms</span>
              </div>
            )}

            {/* Error Message */}
            {data.status === 'error' && data.error && (
              <div className="mt-1 p-2 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-start space-x-1">
                  <AlertCircle className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-red-800 break-words">
                    <span className='font-bold'>Error:</span>{' '}
                    {data.error.length > 50 ? data.error.substring(0, 50) + '...' : data.error}
                  </div>
                </div>
              </div>
            )}

            {/* Success Output Preview */}
            {data.status === 'success' && data.outputData && (
              <div className="mt-1 p-2 bg-green-100 border border-green-300 rounded-lg">
                <div className="text-xs text-green-800 flex items-center space-x-1">
                  <CheckCircle className='w-4 h-4 text-green-700 flex-shrink-0' />
                  <div className="font-medium truncate">
                    Output available: {typeof data.outputData === 'object'
                      ? `${Object.keys(data.outputData).length} fields`
                      : 'Data ready'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Output Handle (Source) */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-4 h-4 -right-2 !bg-green-500 border-2 border-white rounded-full transition-transform duration-200 group-hover:scale-125"
          isConnectable={true}
        />

        {/* Status Indicator Badge (Large, prominent) */}
        {data.status && data.status !== 'idle' && (
          <div className="absolute -top-3 -right-3 z-30">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${getStatusColorClass(data.status, 'bg')}`}
            >
              {data.status === 'running' && (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              )}
              {data.status === 'success' && (
                <CheckCircle className="w-4 h-4 text-white" />
              )}
              {data.status === 'error' && (
                <XCircle className="w-4 h-4 text-white" />
              )}
            </div>
          </div>
        )}
        
        {/* Drag Handle (Subtle, for better UX) */}
        <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default memo(WorkflowNode);