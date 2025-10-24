import React, { useState, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Settings,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface EnhancedWorkflowNodeProps {
  data: {
    label: string;
    blockType: string;
    icon: React.ComponentType<any>;
    color: string;
    parameters: any;
    manifest?: any;
    schema?: any;
    isConfigured?: boolean;
    hasErrors?: boolean;
    onParameterChange?: (nodeId: string, parameters: any) => void;
    onOpenConfig?: (nodeId: string) => void;
    nodeId: string;
    isMultiSelected?: boolean;
  };
  selected: boolean;
  isMultiSelected?: boolean;
}

const EnhancedWorkflowNode: React.FC<EnhancedWorkflowNodeProps> = ({
  data,
  selected,
}) => {
  const [showParameters, setShowParameters] = useState(false);
  const [localParams, setLocalParams] = useState(data.parameters || {});

  useEffect(() => {
    setLocalParams(data.parameters || {});
  }, [data.parameters]);

  const getBorderColor = (color: string) => {
    const colorMap: Record<string, string> = {
      "text-blue-400": "border-blue-400",
      "text-green-400": "border-green-400",
      "text-purple-400": "border-purple-400",
      "text-yellow-400": "border-yellow-400",
      "text-orange-400": "border-orange-400",
      "text-cyan-400": "border-cyan-400",
      "text-red-400": "border-red-400",
      "text-indigo-400": "border-indigo-400",
    };
    return colorMap[color] || "border-gray-400";
  };

  const getBackgroundColor = (color: string) => {
    const colorMap: Record<string, string> = {
      "text-blue-400": "bg-blue-50",
      "text-green-400": "bg-green-50",
      "text-purple-400": "bg-purple-50",
      "text-yellow-400": "bg-yellow-50",
      "text-orange-400": "bg-orange-50",
      "text-cyan-400": "bg-cyan-50",
      "text-red-400": "bg-red-50",
      "text-indigo-400": "bg-indigo-50",
    };
    return colorMap[color] || "bg-gray-50";
  };

  const IconComponent = data.icon;

  // Get the most important parameters to show inline
  const getDisplayParameters = () => {
    const params = data.parameters || {};
    const important = [];

    // Show first 3 non-empty string parameters or numbers
    const entries = Object.entries(params).slice(0, 3);
    for (const [key, value] of entries) {
      if (value !== undefined && value !== null && value !== "") {
        let displayValue = value;
        if (typeof value === "string" && value.length > 30) {
          displayValue = value.substring(0, 27) + "...";
        } else if (typeof value === "object") {
          displayValue = Array.isArray(value)
            ? `[${value.length} items]`
            : "Object";
        }
        important.push({ key, value: displayValue });
      }
    }

    return important;
  };

  const displayParams = getDisplayParameters();
  const paramCount = Object.keys(data.parameters || {}).length;

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md border-2 transition-all duration-200
        ${getBorderColor(data.color)}
        ${selected ? "ring-2 ring-blue-400 ring-offset-2" : ""}
        ${data.isMultiSelected ? "ring-2 ring-purple-400 ring-offset-2" : ""}
        ${data.hasErrors ? "border-red-500" : ""}
        min-w-[200px] max-w-[280px]
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400 border-2 border-white shadow-sm -left-1.5"
      />

      {/* Node Header */}
      <div
        className={`p-3 rounded-t-lg ${getBackgroundColor(data.color)} border-b border-gray-100`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className={`p-1.5 rounded-md bg-white shadow-sm`}>
              <IconComponent className={`w-4 h-4 ${data.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">
                {data.label}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {data.blockType}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {data.hasErrors && (
              <AlertCircle
                className="w-4 h-4 text-red-500"
                title="Configuration errors"
              />
            )}
            {data.isConfigured && !data.hasErrors && (
              <CheckCircle
                className="w-4 h-4 text-green-500"
                title="Configured"
              />
            )}
            <button
              onClick={() => {
                console.log('Configure button clicked', data);
                console.log('onOpenConfig function:', data.onOpenConfig);
                console.log('nodeId:', data.nodeId);
                data.onOpenConfig?.(data.nodeId);
              }}
              className="p-1 hover:bg-white/50 rounded transition-colors"
              title="Configure parameters"
            >
              <Settings className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Parameters Preview */}
      <div className="p-3">
        {displayParams.length > 0 && (
          <div className="space-y-1.5">
            {displayParams.map(({ key, value }) => (
              <div
                key={key}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-gray-600 font-medium truncate flex-1 mr-2">
                  {key}:
                </span>
                <span className="text-gray-800 bg-gray-100 px-2 py-1 rounded truncate max-w-[120px]">
                  {String(value)}
                </span>
              </div>
            ))}

            {paramCount > displayParams.length && (
              <button
                onClick={() => setShowParameters(!showParameters)}
                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showParameters ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>
                  {showParameters
                    ? "Show less"
                    : `+${paramCount - displayParams.length} more`}
                </span>
              </button>
            )}
          </div>
        )}

        {displayParams.length === 0 && (
          <div className="text-xs text-gray-500 italic text-center py-1">
            No parameters set
          </div>
        )}

        {/* Expanded Parameters */}
        {showParameters && (
          <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
            {Object.entries(data.parameters || {})
              .slice(displayParams.length)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-600 font-medium truncate flex-1 mr-2">
                    {key}:
                  </span>
                  <span className="text-gray-800 bg-gray-100 px-2 py-1 rounded truncate max-w-[120px]">
                    {typeof value === "object"
                      ? Array.isArray(value)
                        ? `[${value.length}]`
                        : "Object"
                      : String(value).length > 20
                        ? String(value).substring(0, 17) + "..."
                        : String(value)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="px-3 pb-2">
        <div
          className={`
          text-xs px-2 py-1 rounded-full text-center font-medium
          ${
            data.isConfigured
              ? data.hasErrors
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }
        `}
        >
          {data.hasErrors
            ? "Errors"
            : data.isConfigured
              ? "Ready"
              : "Configure"}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-gray-400 border-2 border-white shadow-sm -right-1.5"
      />
    </div>
  );
};

export default EnhancedWorkflowNode;
