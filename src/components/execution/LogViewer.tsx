import { useState, useEffect, useRef } from 'react'
import {
  Terminal,
  Download,
  Search,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface LogEntry {
  timestamp: string
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  message: string
  node_id?: string
  execution_id?: string
}

interface LogViewerProps {
  logs: LogEntry[] | string
  isLoading?: boolean
  autoScroll?: boolean
  showSearch?: boolean
  className?: string
}

export default function LogViewer({
  logs,
  isLoading = false,
  autoScroll = true,
  showSearch = true,
  className = '',
}: LogViewerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const logEndRef = useRef<HTMLDivElement>(null)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Parse logs if they come as a string
  const parsedLogs: LogEntry[] =
    typeof logs === 'string'
      ? logs
          .split('\n')
          .filter(line => line.trim())
          .map((line, index) => {
            // Try to parse structured log format
            const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})/)
            const levelMatch = line.match(/\b(DEBUG|INFO|WARNING|ERROR|CRITICAL)\b/)

            return {
              timestamp: timestampMatch ? timestampMatch[1] : new Date().toISOString(),
              level: (levelMatch ? levelMatch[1] : 'INFO') as LogEntry['level'],
              message: line,
            }
          })
      : Array.isArray(logs)
        ? logs
        : []

  // Filter logs based on search and level
  const filteredLogs = parsedLogs.filter(log => {
    const matchesSearch =
      !searchTerm ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.node_id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel = levelFilter === 'all' || log.level === levelFilter

    return matchesSearch && matchesLevel
  })

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs, autoScroll])

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'ERROR':
      case 'CRITICAL':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-500" />
      case 'DEBUG':
        return <CheckCircle className="w-4 h-4 text-gray-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'ERROR':
      case 'CRITICAL':
        return 'text-red-400 bg-red-900/20'
      case 'WARNING':
        return 'text-yellow-400 bg-yellow-900/20'
      case 'INFO':
        return 'text-blue-400 bg-blue-900/20'
      case 'DEBUG':
        return 'text-gray-400 bg-gray-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  const downloadLogs = () => {
    const logText = parsedLogs
      .map(
        log =>
          `[${log.timestamp}] [${log.level}] ${log.node_id ? `[${log.node_id}] ` : ''}${log.message}`
      )
      .join('\n')

    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `execution-logs-${new Date().toISOString()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Execution Logs</h3>
          <span className="text-sm text-gray-400">({filteredLogs.length} entries)</span>
        </div>

        <div className="flex items-center space-x-2">
          {showSearch && (
            <>
              <select
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value)}
                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="DEBUG">Debug</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
                <option value="CRITICAL">Critical</option>
              </select>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-8 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}

          <button
            onClick={downloadLogs}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm text-white flex items-center space-x-1 transition-colors"
            title="Download logs"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Log Content */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto bg-gray-950 p-4 font-mono text-sm"
        style={{ maxHeight: '500px' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
            <span className="ml-3">Loading logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Terminal className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-lg font-medium">No logs available</p>
            <p className="text-sm mt-1">
              {searchTerm || levelFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Logs will appear here when the execution runs'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-2 rounded hover:bg-gray-900/50 transition-colors ${getLevelColor(log.level)}`}
              >
                <div className="flex-shrink-0 pt-0.5">{getLevelIcon(log.level)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        log.level === 'ERROR' || log.level === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-300'
                          : log.level === 'WARNING'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : log.level === 'INFO'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-gray-500/20 text-gray-300'
                      }`}
                    >
                      {log.level}
                    </span>
                    {log.node_id && (
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                        {log.node_id}
                      </span>
                    )}
                  </div>

                  <pre className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                    {log.message}
                  </pre>
                </div>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between p-2 bg-gray-900 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Total: {parsedLogs.length}</span>
          <span className="text-red-400">
            Errors: {parsedLogs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length}
          </span>
          <span className="text-yellow-400">
            Warnings: {parsedLogs.filter(l => l.level === 'WARNING').length}
          </span>
          <span className="text-blue-400">
            Info: {parsedLogs.filter(l => l.level === 'INFO').length}
          </span>
        </div>
        <div>{autoScroll && <span className="text-green-400">● Auto-scroll enabled</span>}</div>
      </div>
    </div>
  )
}
