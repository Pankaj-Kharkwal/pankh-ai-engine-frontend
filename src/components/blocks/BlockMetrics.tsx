import React from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Activity, BarChart3 } from 'lucide-react';

interface BlockMetricsProps {
  blockType: string;
  metrics?: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    average_execution_time_ms: number;
    min_execution_time_ms: number;
    max_execution_time_ms: number;
    last_execution_timestamp?: string;
    success_rate: number;
    recent_executions: Array<{
      timestamp: string;
      status: 'success' | 'failed';
      execution_time_ms: number;
      error?: string;
    }>;
  };
}

export default function BlockMetrics({ blockType, metrics }: BlockMetricsProps) {
  if (!metrics) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No metrics available</p>
        <p className="text-xs mt-1">This block hasn't been executed yet</p>
      </div>
    );
  }

  const successRate = metrics.success_rate * 100;
  const failureRate = 100 - successRate;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total Runs</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{metrics.total_executions}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900">Success Rate</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{successRate.toFixed(1)}%</p>
          <p className="text-xs text-green-700 mt-1">{metrics.successful_executions} successful</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-900">Failed</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-900">{metrics.failed_executions}</p>
          <p className="text-xs text-red-700 mt-1">{failureRate.toFixed(1)}% failure rate</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Avg Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {metrics.average_execution_time_ms.toFixed(0)}<span className="text-sm">ms</span>
          </p>
        </div>
      </div>

      {/* Performance Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-gray-700" />
          Performance Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Fastest Execution</label>
            <div className="flex items-center mt-2">
              <TrendingDown className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-lg font-semibold text-gray-900">
                {metrics.min_execution_time_ms.toFixed(0)}ms
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Average Execution</label>
            <div className="flex items-center mt-2">
              <Activity className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-lg font-semibold text-gray-900">
                {metrics.average_execution_time_ms.toFixed(0)}ms
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Slowest Execution</label>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-lg font-semibold text-gray-900">
                {metrics.max_execution_time_ms.toFixed(0)}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Executions */}
      {metrics.recent_executions && metrics.recent_executions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Executions</h3>
          <div className="space-y-2">
            {metrics.recent_executions.map((execution, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  execution.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {execution.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {execution.status === 'success' ? 'Success' : 'Failed'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(execution.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-700">
                      <Clock className="w-4 h-4 mr-1" />
                      {execution.execution_time_ms.toFixed(0)}ms
                    </div>
                  </div>
                </div>
                {execution.error && (
                  <div className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded">
                    {execution.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Success Rate Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Success vs Failure Distribution</h3>
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600"
            style={{ width: `${successRate}%` }}
          />
          <div
            className="absolute top-0 right-0 h-full bg-gradient-to-r from-red-400 to-red-600"
            style={{ width: `${failureRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-green-700 font-medium">
            {metrics.successful_executions} successful ({successRate.toFixed(1)}%)
          </span>
          <span className="text-red-700 font-medium">
            {metrics.failed_executions} failed ({failureRate.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
