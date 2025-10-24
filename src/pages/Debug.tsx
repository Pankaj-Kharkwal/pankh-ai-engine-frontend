import { Play, Pause, SkipForward, Terminal } from 'lucide-react'

export default function Debug() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Debug Console</h1>
        <p className="text-gray-400 mt-2">Step-through debugging and parameter inspection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Execution Flow</h2>
              <div className="flex space-x-2">
                <button className="glass-button p-2">
                  <Play className="w-4 h-4" />
                </button>
                <button className="glass-button p-2">
                  <Pause className="w-4 h-4" />
                </button>
                <button className="glass-button p-2">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="glass-card p-4 bg-blue-600">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Start Node</span>
                  <span className="text-sm">✓ Completed</span>
                </div>
              </div>
              <div className="glass-card p-4 bg-yellow-600">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Data Transform</span>
                  <span className="text-sm">⏸ Paused</span>
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-400">Email Send</span>
                  <span className="text-sm text-gray-400">⏳ Pending</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Terminal className="w-5 h-5 mr-2" />
              Console Output
            </h2>
            <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
              <div className="text-green-400">[10:30:15] Starting workflow execution...</div>
              <div className="text-blue-400">[10:30:16] Node 1: Start - Status: COMPLETED</div>
              <div className="text-yellow-400">[10:30:17] Node 2: Transform - Status: PAUSED</div>
              <div className="text-gray-400">[10:30:17] Breakpoint hit at line 23</div>
              <div className="text-white cursor-blink">_</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Variable Inspector</h2>
            <div className="space-y-3">
              <div className="glass-card p-3">
                <div className="text-sm font-medium">input_data</div>
                <div className="text-xs text-gray-400">Object (12 keys)</div>
              </div>
              <div className="glass-card p-3">
                <div className="text-sm font-medium">user_id</div>
                <div className="text-xs text-gray-400">String: "12345"</div>
              </div>
              <div className="glass-card p-3">
                <div className="text-sm font-medium">processed_count</div>
                <div className="text-xs text-gray-400">Number: 42</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Breakpoints</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-glass-200 rounded">
                <span className="text-sm">Line 23</span>
                <button className="text-red-400 text-xs">Remove</button>
              </div>
              <div className="flex items-center justify-between p-2 bg-glass-200 rounded">
                <span className="text-sm">Line 45</span>
                <button className="text-red-400 text-xs">Remove</button>
              </div>
            </div>
            <button className="glass-button w-full mt-3 text-sm">Add Breakpoint</button>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Execution Time</span>
                <span className="text-sm">1.2s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm">24MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">CPU Usage</span>
                <span className="text-sm">12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
