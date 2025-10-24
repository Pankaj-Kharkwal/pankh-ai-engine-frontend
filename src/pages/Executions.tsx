import { useState, useEffect } from "react";
import {
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Eye,
  RefreshCw,
  Search,
  Loader,
} from "lucide-react";
import { useExecution } from "../hooks/useApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api";

interface ExecutionData {
  id: string;
  workflow_id: string;
  status: "pending" | "running" | "completed" | "failed";
  node_states: Array<{
    node_id: string;
    status: "pending" | "running" | "completed" | "failed";
    started_at?: string;
    finished_at?: string;
    attempts: number;
    error?: string;
  }>;
  outputs?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export default function Executions() {
  const [selectedExecutionId, setSelectedExecutionId] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  // NEW: Real executions from API
  const { data: executions, isLoading } = useQuery({
    queryKey: ["executions"],
    queryFn: () => apiClient.getExecutions(),
    refetchInterval: autoRefresh ? 3000 : false,
  });

  const queryClient = useQueryClient();
  // Remove mock executions - using real API data

  // Use the real execution hook for live data when execution ID is provided
  const {
    data: liveExecution,
    refetch,
    isFetching,
  } = useExecution(selectedExecutionId);

  const currentExecution = liveExecution;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "running":
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-900/20 border-green-600";
      case "running":
        return "text-blue-400 bg-blue-900/20 border-blue-600";
      case "failed":
        return "text-red-400 bg-red-900/20 border-red-600";
      default:
        return "text-yellow-400 bg-yellow-900/20 border-yellow-600";
    }
  };

  // NEW: WebSocket connection for real-time updates
  useEffect(() => {
    if (!selectedExecutionId) return;

    const ws = new WebSocket(
      `ws://localhost:8000/ws/execution/${selectedExecutionId}`,
    );
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      // Update execution state in real-time
      queryClient.setQueryData(["execution", selectedExecutionId], update);
    };

    return () => ws.close();
  }, [selectedExecutionId, queryClient]);

  // Auto refresh for running executions
  useEffect(() => {
    if (autoRefresh && selectedExecutionId) {
      const interval = setInterval(() => {
        refetch();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedExecutionId, refetch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">
          Workflow Executions
        </h1>
        <p className="text-gray-400 mt-2">
          Monitor and debug your workflow runs in real-time
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Running</p>
              <p className="text-2xl font-bold text-blue-400">
                {executions?.filter((e) => e.status === "running").length || 0}
              </p>
            </div>
            <Play className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-400">
                {executions?.filter((e) => e.status === "completed").length ||
                  0}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-400">
                {executions?.filter((e) => e.status === "failed").length || 0}
              </p>
            </div>
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-purple-400">
                {executions?.length || 0}
              </p>
            </div>
            <BarChart3 className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Execution List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Monitor Execution
            </h2>

            {/* Execution ID Input */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">
                Live Execution ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={selectedExecutionId}
                  onChange={(e) => setSelectedExecutionId(e.target.value)}
                  placeholder="Enter execution ID..."
                  className="flex-1 glass-input text-sm"
                />
                <button
                  onClick={() => refetch()}
                  className="glass-button px-3 py-2"
                  disabled={!selectedExecutionId || isFetching}
                >
                  {isFetching ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="mt-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <span>Auto-refresh (3s)</span>
                </label>
              </div>
            </div>

            {/* Real Executions List */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-sm font-medium mb-3 text-gray-400">
                Recent Executions
              </h3>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-4">
                    <Loader className="w-6 h-6 animate-spin mx-auto text-blue-400" />
                    <p className="text-sm text-gray-400 mt-2">
                      Loading executions...
                    </p>
                  </div>
                ) : executions?.length ? (
                  executions.map((execution) => (
                    <div
                      key={execution.id}
                      className={`glass-button p-3 cursor-pointer hover:animate-glow ${
                        selectedExecutionId === execution.id
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      onClick={() => setSelectedExecutionId(execution.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(execution.status)}
                          <div>
                            <div className="font-medium text-sm">
                              {execution.id}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(
                                execution.created_at,
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                            execution.status,
                          )}`}
                        >
                          {execution.status}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <p className="text-sm">No executions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Execution Details */}
        <div className="lg:col-span-2">
          {currentExecution ? (
            <div className="space-y-6">
              {/* Execution Overview */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    {getStatusIcon(currentExecution.status)}
                    <span className="ml-2">
                      Execution {currentExecution.id}
                    </span>
                  </h2>
                  <div
                    className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
                      currentExecution.status,
                    )}`}
                  >
                    {currentExecution.status.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Workflow ID</div>
                    <div className="font-mono">
                      {currentExecution.workflow_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Started</div>
                    <div>
                      {new Date(currentExecution.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Updated</div>
                    <div>
                      {new Date(currentExecution.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Node States */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Node Execution Progress
                </h3>
                <div className="space-y-3">
                  {currentExecution.node_states.map((nodeState) => (
                    <div
                      key={nodeState.node_id}
                      className="flex items-center justify-between p-3 bg-glass-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(nodeState.status)}
                        <div>
                          <div className="font-medium">{nodeState.node_id}</div>
                          <div className="text-xs text-gray-400">
                            {nodeState.started_at &&
                              `Started: ${new Date(nodeState.started_at).toLocaleTimeString()}`}
                            {nodeState.finished_at &&
                              ` • Finished: ${new Date(nodeState.finished_at).toLocaleTimeString()}`}
                          </div>
                          {nodeState.error && (
                            <div className="text-xs text-red-400 mt-1">
                              Error: {nodeState.error}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                            nodeState.status,
                          )}`}
                        >
                          {nodeState.status}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Attempts: {nodeState.attempts}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outputs */}
              {currentExecution.outputs &&
                Object.keys(currentExecution.outputs).length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Node Outputs</h3>
                    <div className="space-y-4">
                      {Object.entries(currentExecution.outputs).map(
                        ([nodeId, output]) => (
                          <div key={nodeId}>
                            <div className="font-medium text-sm mb-2 text-blue-400">
                              📤 {nodeId}
                            </div>
                            <div className="bg-gray-900 rounded p-3 overflow-x-auto">
                              <pre className="text-xs text-gray-300">
                                {JSON.stringify(output, null, 2)}
                              </pre>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Eye className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Select an Execution to Monitor
              </h3>
              <p className="text-gray-400 mb-4">
                Choose an execution from the list or enter a live execution ID
                to monitor its progress
              </p>
              <div className="text-sm text-gray-500">
                💡 Tip: Use the workflow builder to create and run new workflows
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
