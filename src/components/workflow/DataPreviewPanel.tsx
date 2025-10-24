import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { Node, Edge } from "@xyflow/react";

interface DataPreviewPanelProps {
  nodes: Node[];
  edges: Edge[];
  executionData?: any;
  isVisible: boolean;
  onToggleVisibility: () => void;
  selectedNodeId?: string;
  selectedEdgeId?: string;
}

interface NodeExecutionData {
  nodeId: string;
  status: "idle" | "running" | "success" | "error";
  inputData?: any;
  outputData?: any;
  executionTime?: number;
  error?: string;
  timestamp?: Date;
}

export default function DataPreviewPanel({
  nodes,
  edges,
  executionData,
  isVisible,
  onToggleVisibility,
  selectedNodeId,
  selectedEdgeId,
}: DataPreviewPanelProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [nodeExecutionData, setNodeExecutionData] = useState<
    Record<string, NodeExecutionData>
  >({});

  // Process execution data when it changes
  useEffect(() => {
    if (executionData) {
      const newExecutionData: Record<string, NodeExecutionData> = {};

      // Process node execution results
      if (executionData.nodeResults) {
        Object.entries(executionData.nodeResults).forEach(
          ([nodeId, result]: [string, any]) => {
            newExecutionData[nodeId] = {
              nodeId,
              status: result.success ? "success" : "error",
              inputData: result.inputData,
              outputData: result.outputData,
              executionTime: result.executionTime,
              error: result.error,
              timestamp: new Date(result.timestamp),
            };
          },
        );
      }

      setNodeExecutionData(newExecutionData);
    }
  }, [executionData]);

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  const downloadData = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderDataPreview = (
    data: any,
    title: string,
    nodeId: string,
    type: "input" | "output",
  ) => {
    if (!data) return null;

    const filename = `${nodeId}_${type}_data.json`;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
          <div className="flex space-x-1">
            <button
              onClick={() => copyToClipboard(data)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => downloadData(data, filename)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Download as JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-48 overflow-auto">
          <pre className="text-xs text-gray-800 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  const getNodeStatusIcon = (status: NodeExecutionData["status"]) => {
    switch (status) {
      case "running":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getNodeStatusColor = (status: NodeExecutionData["status"]) => {
    switch (status) {
      case "running":
        return "border-blue-300 bg-blue-50";
      case "success":
        return "border-green-300 bg-green-50";
      case "error":
        return "border-red-300 bg-red-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={onToggleVisibility}
          className="bg-white border border-gray-300 rounded-lg p-2 shadow-lg hover:bg-gray-50"
          title="Show Data Preview"
        >
          <Eye className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 w-96 max-h-[80vh] bg-white border border-gray-300 rounded-lg shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
        <button
          onClick={onToggleVisibility}
          className="p-1 text-gray-400 hover:text-gray-600"
          title="Hide Data Preview"
        >
          <EyeOff className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {nodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No nodes to preview</p>
            <p className="text-xs mt-1">
              Add nodes and run the workflow to see data flow
            </p>
          </div>
        ) : (
          nodes.map((node) => {
            const executionInfo = nodeExecutionData[node.id];
            const isExpanded = expandedNodes.has(node.id);
            const isSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                className={`border rounded-lg p-3 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : executionInfo
                      ? getNodeStatusColor(executionInfo.status)
                      : "border-gray-200 bg-white"
                }`}
              >
                {/* Node Header */}
                <div
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => toggleNodeExpansion(node.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <div className="flex items-center space-x-2 flex-1">
                    {executionInfo && getNodeStatusIcon(executionInfo.status)}
                    <span className="text-sm font-medium text-gray-900">
                      {node.data.label || node.id}
                    </span>
                    {executionInfo?.executionTime && (
                      <span className="text-xs text-gray-500">
                        {executionInfo.executionTime}ms
                      </span>
                    )}
                  </div>
                </div>

                {/* Node Data */}
                {isExpanded && (
                  <div className="mt-3 space-y-3 pl-6">
                    {executionInfo?.error && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">Error:</span>
                        </div>
                        <p className="mt-1">{executionInfo.error}</p>
                      </div>
                    )}

                    {renderDataPreview(
                      executionInfo?.inputData,
                      "Input Data",
                      node.id,
                      "input",
                    )}

                    {renderDataPreview(
                      executionInfo?.outputData,
                      "Output Data",
                      node.id,
                      "output",
                    )}

                    {!executionInfo && (
                      <div className="text-center py-4 text-gray-500">
                        <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No execution data yet</p>
                        <p className="text-xs mt-1">
                          Run the workflow to see data
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Live data preview</span>
          <span>{Object.keys(nodeExecutionData).length} nodes executed</span>
        </div>
      </div>
    </div>
  );
}
