import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  Database,
  Activity,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  EyeOff,
  Play,
  CheckCircle,
  X,
} from "lucide-react";
import type { Node, Edge } from "@xyflow/react";

interface ExecutionMonitorProps {
  nodes: Node[];
  edges: Edge[];
  executionData?: any;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

interface PerformanceMetrics {
  totalExecutionTime: number;
  averageNodeTime: number;
  slowestNode: {
    id: string;
    name: string;
    time: number;
  } | null;
  fastestNode: {
    id: string;
    name: string;
    time: number;
  } | null;
  nodeCount: number;
  edgeCount: number;
  successRate: number;
}

interface TimelineEvent {
  id: string;
  nodeId: string;
  nodeName: string;
  type: "start" | "complete" | "error";
  timestamp: Date;
  duration?: number;
  dataSize?: number;
}

export default function ExecutionMonitor({
  nodes,
  edges,
  executionData,
  isVisible,
  onToggleVisibility,
}: ExecutionMonitorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["metrics", "timeline"]), // Expand metrics by default too
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "all" | "last5" | "last10"
  >("all");

  // Calculate performance metrics (no change to logic)
  const metrics: PerformanceMetrics = useMemo(() => {
    if (!executionData?.nodeResults) {
      return {
        totalExecutionTime: 0,
        averageNodeTime: 0,
        slowestNode: null,
        fastestNode: null,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        successRate: 0,
      };
    }

    const results = Object.values(executionData.nodeResults) as any[];
    const successfulResults = results.filter((r) => r.success);
    const totalTime = results.reduce(
      (sum, r) => sum + (r.executionTime || 0),
      0,
    );
    const avgTime = results.length > 0 ? totalTime / results.length : 0;

    const timedResults = results.filter((r) => r.executionTime);
    const slowest =
      timedResults.length > 0
        ? timedResults.reduce((max, r) =>
            r.executionTime > max.executionTime ? r : max,
          )
        : null;

    const fastest =
      timedResults.length > 0
        ? timedResults.reduce((min, r) =>
            r.executionTime < min.executionTime ? r : min,
          )
        : null;

    return {
      totalExecutionTime: totalTime,
      averageNodeTime: avgTime,
      slowestNode: slowest
        ? {
            id: slowest.nodeId,
            name:
              nodes.find((n) => n.id === slowest.nodeId)?.data.label ||
              slowest.nodeId,
            time: slowest.executionTime,
          }
        : null,
      fastestNode: fastest
        ? {
            id: fastest.nodeId,
            name:
              nodes.find((n) => n.id === fastest.nodeId)?.data.label ||
              fastest.nodeId,
            time: fastest.executionTime,
          }
        : null,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      successRate:
        results.length > 0
          ? (successfulResults.length / results.length) * 100
          : 0,
    };
  }, [executionData, nodes, edges]);

  // Generate timeline events (no change to logic)
  const timelineEvents: TimelineEvent[] = useMemo(() => {
    if (!executionData?.nodeResults) return [];

    const events: TimelineEvent[] = [];
    const nodeResults = executionData.nodeResults;

    Object.entries(nodeResults).forEach(([nodeId, result]: [string, any]) => {
      const node = nodes.find((n) => n.id === nodeId);
      const nodeName = node?.data.label || nodeId;

      // Add start event (estimated)
      const startTime = new Date(result.timestamp || Date.now());
      startTime.setMilliseconds(
        startTime.getMilliseconds() - (result.executionTime || 0),
      );

      events.push({
        id: `${nodeId}-start`,
        nodeId,
        nodeName,
        type: "start",
        timestamp: startTime,
      });

      // Add completion/error event
      events.push({
        id: `${nodeId}-${result.success ? "complete" : "error"}`,
        nodeId,
        nodeName,
        type: result.success ? "complete" : "error",
        timestamp: new Date(result.timestamp || Date.now()),
        duration: result.executionTime,
        dataSize: result.outputData
          ? JSON.stringify(result.outputData).length
          : 0,
      });
    });

    // Sort by timestamp
    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [executionData, nodes]);

  // Filter events based on timeframe (no change to logic)
  const filteredEvents = useMemo(() => {
    if (selectedTimeframe === "all") return timelineEvents;

    const limit = selectedTimeframe === "last5" ? 5 : 10;
    return timelineEvents.slice(-limit);
  }, [timelineEvents, selectedTimeframe]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDataSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "start":
        return <Play className="w-4 h-4 text-blue-600" />;
      case "complete":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <X className="w-4 h-4 text-red-600" />;
    }
  };

  // IMPROVEMENT: Use border-l-4 for a strong color accent and cleaner white background
  const getEventColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "start":
        return "border-l-4 border-blue-500 bg-white hover:bg-blue-50/50 transition-colors";
      case "complete":
        return "border-l-4 border-green-500 bg-white hover:bg-green-50/50 transition-colors";
      case "error":
        return "border-l-4 border-red-500 bg-white hover:bg-red-50/50 transition-colors";
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed top-[65%] right-4 z-40">
        <button
          onClick={onToggleVisibility}
          // IMPROVEMENT: Rounded full, slightly darker shadow, blue hover accent
          className="bg-white border border-gray-300 rounded-full p-3 shadow-md hover:shadow-lg hover:border-blue-500 transition"
          title="Show Execution Monitor"
        >
          <BarChart3 className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[70vh] bg-white border border-gray-200 rounded-xl shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-800">
          Execution Monitor
        </h3>
        <button
          onClick={onToggleVisibility}
          // IMPROVEMENT: Full-round hover for better target
          className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          title="Hide Execution Monitor"
        >
          <EyeOff className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Performance Metrics */}
        <div className="space-y-3 border-b border-gray-100 pb-4">
          <button
            onClick={() => toggleSection("metrics")}
            // IMPROVEMENT: Full-width clickable area with hover state
            className="flex items-center space-x-2 w-full text-left py-2 -mx-2 px-2 hover:bg-gray-50 rounded-md transition-colors"
          >
            {expandedSections.has("metrics") ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <BarChart3 className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-900 text-base">
              Performance Metrics
            </span>
          </button>

          {expandedSections.has("metrics") && (
            <div className="ml-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Total Time Card */}
                <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800">
                      Total Time
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-blue-800 mt-1">
                    {formatDuration(metrics.totalExecutionTime)}
                  </div>
                </div>

                {/* Avg/Node Card */}
                <div className="bg-white p-3 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-800">
                      Avg/Node
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-green-800 mt-1">
                    {formatDuration(metrics.averageNodeTime)}
                  </div>
                </div>

                {/* Success Rate Card */}
                <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-800">
                      Success Rate
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-purple-800 mt-1">
                    {metrics.successRate.toFixed(1)}%
                  </div>
                </div>

                {/* Nodes/Edges Card */}
                <div className="bg-white p-3 rounded-xl border border-orange-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium text-orange-800">
                      Nodes/Edges
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-orange-800 mt-1">
                    {metrics.nodeCount}/{metrics.edgeCount}
                  </div>
                </div>
              </div>

              {/* Slowest Node */}
              {metrics.slowestNode && (
                <div className="bg-white p-3 rounded-xl border border-red-200 shadow-sm">
                  <div className="text-xs font-medium text-red-700 mb-1">
                    Slowest Node
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    {metrics.slowestNode.name}
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    {formatDuration(metrics.slowestNode.time)}
                  </div>
                </div>
              )}

              {/* Fastest Node */}
              {metrics.fastestNode && (
                <div className="bg-white p-3 rounded-xl border border-green-200 shadow-sm">
                  <div className="text-xs font-medium text-green-700 mb-1">
                    Fastest Node
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    {metrics.fastestNode.name}
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {formatDuration(metrics.fastestNode.time)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Execution Timeline */}
        <div className="space-y-3 border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection("timeline")}
              className="flex items-center space-x-2 text-left py-2 -mx-2 px-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              {expandedSections.has("timeline") ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <Activity className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-900 text-base">
                Execution Timeline
              </span>
            </button>

            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white hover:border-blue-400 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Events</option>
              <option value="last10">Last 10</option>
              <option value="last5">Last 5</option>
            </select>
          </div>

          {expandedSections.has("timeline") && (
            <div className="ml-6 space-y-3 max-h-72 overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <Activity className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No execution events yet</p>
                  <p className="text-xs mt-1">
                    Run the workflow to see the live timeline.
                  </p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    // IMPROVEMENT: Uses the new getEventColor for a left border accent
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${getEventColor(event.type)}`}
                  >
                    <div className="pt-1 flex-shrink-0">
                        {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">
                        {event.nodeName}
                      </div>
                      <div className="text-xs text-gray-600 space-x-1 mt-0.5">
                        <span className="capitalize font-medium">{event.type}</span>
                        <span className="text-gray-400">|</span>
                        <span>{event.timestamp.toLocaleTimeString()}</span>
                        {event.duration && (
                          <>
                            <span className="text-gray-400">|</span>
                            <span className="font-mono">{formatDuration(event.duration)}</span>
                          </>
                        )}
                        {event.dataSize && (
                          <>
                            <span className="text-gray-400">|</span>
                            <span>{formatDataSize(event.dataSize)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Resource Usage */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("resources")}
            className="flex items-center space-x-2 w-full text-left py-2 -mx-2 px-2 hover:bg-gray-50 rounded-md transition-colors"
          >
            {expandedSections.has("resources") ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <Database className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-900 text-base">Resource Usage</span>
          </button>

          {expandedSections.has("resources") && (
            <div className="ml-6 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 space-y-1">
                <div className="font-medium text-gray-800">Data Metrics</div>
                <ul className="list-disc list-inside ml-2 text-xs space-y-0.5">
                    <li>Memory usage tracking coming soon...</li>
                    <li>API call metrics coming soon...</li>
                    <li>Network usage coming soon...</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="font-medium">Live Monitoring Active</span>
          <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition font-medium">
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}