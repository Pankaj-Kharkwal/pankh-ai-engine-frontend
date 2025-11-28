import { useMemo } from 'react'
import {
  Clock,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  BarChart3,
} from 'lucide-react'

interface ExecutionMetricsProps {
  execution: any
  className?: string
}

interface NodeMetrics {
  total: number
  completed: number
  failed: number
  running: number
  pending: number
  avgExecutionTime: number
  totalExecutionTime: number
  successRate: number
}

export default function ExecutionMetrics({ execution, className = '' }: ExecutionMetricsProps) {
  // Calculate metrics from execution data
  const metrics: NodeMetrics = useMemo(() => {
    if (!execution?.node_states) {
      return {
        total: 0,
        completed: 0,
        failed: 0,
        running: 0,
        pending: 0,
        avgExecutionTime: 0,
        totalExecutionTime: 0,
        successRate: 0,
      }
    }

    const nodeStates = execution.node_states
    const total = nodeStates.length
    const completed = nodeStates.filter((n: any) => n.status === 'completed').length
    const failed = nodeStates.filter((n: any) => n.status === 'failed').length
    const running = nodeStates.filter((n: any) => n.status === 'running').length
    const pending = nodeStates.filter((n: any) => n.status === 'pending').length

    // Calculate execution times
    let totalTime = 0
    let executedCount = 0

    nodeStates.forEach((node: any) => {
      if (node.started_at && node.finished_at) {
        const duration = new Date(node.finished_at).getTime() - new Date(node.started_at).getTime()
        totalTime += duration
        executedCount++
      }
    })

    const avgTime = executedCount > 0 ? totalTime / executedCount : 0
    const successRate = total > 0 ? (completed / total) * 100 : 0

    return {
      total,
      completed,
      failed,
      running,
      pending,
      avgExecutionTime: avgTime,
      totalExecutionTime: totalTime,
      successRate,
    }
  }, [execution])

  // Calculate overall execution duration
  const executionDuration = useMemo(() => {
    if (!execution?.created_at || !execution?.updated_at) return 0
    return new Date(execution.updated_at).getTime() - new Date(execution.created_at).getTime()
  }, [execution])

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return `${minutes}m ${seconds}s`
  }

  // Get node state percentages for chart
  const getNodeStatePercentages = () => {
    if (metrics.total === 0) return []

    return [
      {
        label: 'Completed',
        value: metrics.completed,
        percentage: (metrics.completed / metrics.total) * 100,
        color: 'bg-green-500',
      },
      {
        label: 'Failed',
        value: metrics.failed,
        percentage: (metrics.failed / metrics.total) * 100,
        color: 'bg-red-500',
      },
      {
        label: 'Running',
        value: metrics.running,
        percentage: (metrics.running / metrics.total) * 100,
        color: 'bg-blue-500',
      },
      {
        label: 'Pending',
        value: metrics.pending,
        percentage: (metrics.pending / metrics.total) * 100,
        color: 'bg-yellow-500',
      },
    ].filter(item => item.value > 0)
  }

  const nodeStateData = getNodeStatePercentages()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Nodes */}
        <div className="glass-card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Nodes</p>
              <p className="text-2xl font-bold text-white mt-1">{metrics.total}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400 opacity-80" />
          </div>
        </div>

        {/* Success Rate */}
        <div className="glass-card p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Success Rate</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {metrics.successRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400 opacity-80" />
          </div>
        </div>

        {/* Duration */}
        <div className="glass-card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Duration</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {formatDuration(executionDuration)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-400 opacity-80" />
          </div>
        </div>

        {/* Avg Node Time */}
        <div className="glass-card p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Avg Node Time</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">
                {formatDuration(metrics.avgExecutionTime)}
              </p>
            </div>
            <Zap className="w-8 h-8 text-orange-400 opacity-80" />
          </div>
        </div>
      </div>

      {/* Node Status Breakdown */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-400" />
          Node Status Breakdown
        </h3>

        {/* Progress Bar Chart */}
        <div className="space-y-4">
          {/* Visual Progress Bar */}
          <div className="h-8 bg-gray-800 rounded-lg overflow-hidden flex">
            {nodeStateData.map((item, index) => (
              <div
                key={index}
                className={`${item.color} transition-all duration-500 flex items-center justify-center text-xs font-bold text-white`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.label}: ${item.value} (${item.percentage.toFixed(1)}%)`}
              >
                {item.percentage > 10 && item.value}
              </div>
            ))}
          </div>

          {/* Legend and Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Completed</p>
                <p className="text-lg font-bold text-white">{metrics.completed}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Failed</p>
                <p className="text-lg font-bold text-white">{metrics.failed}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-xs text-gray-400">Running</p>
                <p className="text-lg font-bold text-white">{metrics.running}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Pending</p>
                <p className="text-lg font-bold text-white">{metrics.pending}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Timeline */}
      {execution?.node_states && execution.node_states.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            Node Execution Timeline
          </h3>

          <div className="space-y-2">
            {execution.node_states
              .filter((node: any) => node.started_at && node.finished_at)
              .map((node: any, index: number) => {
                const duration =
                  new Date(node.finished_at).getTime() - new Date(node.started_at).getTime()
                const maxDuration = Math.max(
                  ...execution.node_states
                    .filter((n: any) => n.started_at && n.finished_at)
                    .map(
                      (n: any) =>
                        new Date(n.finished_at).getTime() - new Date(n.started_at).getTime()
                    )
                )
                const widthPercentage = (duration / maxDuration) * 100

                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-32 text-sm text-gray-300 truncate" title={node.node_id}>
                      {node.node_id}
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full flex items-center px-2 text-xs font-semibold text-white transition-all duration-500 ${
                          node.status === 'completed'
                            ? 'bg-green-500'
                            : node.status === 'failed'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                        }`}
                        style={{ width: `${widthPercentage}%` }}
                      >
                        {formatDuration(duration)}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
