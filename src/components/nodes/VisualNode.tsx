import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Settings, Play, AlertCircle } from 'lucide-react';

interface VisualNodeData {
  label: string;
  blockType: string;
  category: string;
  description?: string;
  parameters?: Record<string, any>;
  executionState?: 'idle' | 'running' | 'success' | 'error';
  color?: string;
}

const VisualNode: React.FC<NodeProps<VisualNodeData>> = ({
  data,
  selected,
  id
}) => {
  const {
    label,
    blockType,
    category,
    description,
    executionState = 'idle',
    color = '#6366f1'
  } = data;

  const getStateColor = () => {
    switch (executionState) {
      case 'running': return '#f59e0b';
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      default: return color;
    }
  };

  const getStateIcon = () => {
    switch (executionState) {
      case 'running': return <Play className="w-3 h-3 animate-spin" />;
      case 'success': return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className={`
      bg-white border-2 rounded-lg shadow-lg min-w-[180px] min-h-[80px]
      ${selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-200'}
      hover:shadow-xl transition-all duration-200
    `}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 bg-gray-400 border-2 border-white hover:bg-blue-500 transition-colors"
        style={{ left: -6 }}
      />

      {/* Node Header */}
      <div
        className="px-3 py-2 rounded-t-lg text-white text-sm font-medium flex items-center justify-between"
        style={{ backgroundColor: getStateColor() }}
      >
        <span className="truncate flex-1">{label}</span>
        <div className="flex items-center gap-1 ml-2">
          {getStateIcon()}
          <Settings className="w-3 h-3 opacity-70 hover:opacity-100 cursor-pointer" />
        </div>
      </div>

      {/* Node Body */}
      <div className="px-3 py-2">
        <div className="text-xs text-gray-500 mb-1">{category}</div>
        {description && (
          <div className="text-xs text-gray-600 line-clamp-2">
            {description}
          </div>
        )}
        <div className="text-xs text-gray-400 mt-1">{blockType}</div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 bg-gray-400 border-2 border-white hover:bg-blue-500 transition-colors"
        style={{ right: -6 }}
      />
    </div>
  );
};

export default memo(VisualNode);