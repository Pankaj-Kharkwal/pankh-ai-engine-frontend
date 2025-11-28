import { useState } from 'react'
import {
  Play,
  Pause,
  SkipForward,
  Terminal,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Bug,
  Zap,
  List,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

export default function WorkflowManager() {
  const [activeTab, setActiveTab] = useState<'executions' | 'debugging' | 'analytics'>('executions')
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Workflow Manager</h1>
        <p className="text-gray-400 mt-2">Monitor executions, debug workflows, and analyze performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-glass-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('executions')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'executions'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <List className="w-4 h-4 mr-2" />
          Executions
        </button>
        <button
          onClick={() => setActiveTab('debugging')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'debugging'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Bug className="w-4 h-4 mr-2" />
          Debugging
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'analytics'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Analytics
        </button>
      </div>

      {/* Executions Tab - List of all executions */}
      {activeTab === 'executions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent Executions</h2>
            <div className="flex items-center space-x-3">
              <select className="glass-card px-3 py-2 text-sm">
                <option>All Workflows</option>
                <option>Data Processing Pipeline</option>
                <option>Email Campaign</option>
                <option>Social Analytics</option>
              </select>
              <select className="glass-card px-3 py-2 text-sm">
                <option>All Statuses</option>
                <option>Completed</option>
                <option>Failed</option>
                <option>Running</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {/* Execution Item 1 - Completed */}
            <div
              className="glass-card p-5 hover:bg-glass-200 cursor-pointer transition-all"
              onClick={() => {
                setSelectedExecution('exec-1')
                setActiveTab('debugging')
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <h3 className="font-semibold">Data Processing Pipeline</h3>
                    <p className="text-sm text-gray-400">Execution #12456</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">Duration</p>
                    <p className="font-medium">1.2s</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Nodes</p>
                    <p className="font-medium">8/8</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Started</p>
                    <p className="font-medium">2 min ago</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Execution Item 2 - Failed */}
            <div
              className="glass-card p-5 hover:bg-glass-200 cursor-pointer transition-all"
              onClick={() => {
                setSelectedExecution('exec-2')
                setActiveTab('debugging')
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <h3 className="font-semibold">Email Campaign</h3>
                    <p className="text-sm text-gray-400">Execution #12455</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">Duration</p>
                    <p className="font-medium">0.8s</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Nodes</p>
                    <p className="font-medium">3/6</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Started</p>
                    <p className="font-medium">5 min ago</p>
                  </div>
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                    Failed
                  </span>
                </div>
              </div>
            </div>

            {/* Execution Item 3 - Running */}
            <div
              className="glass-card p-5 hover:bg-glass-200 cursor-pointer transition-all"
              onClick={() => {
                setSelectedExecution('exec-3')
                setActiveTab('debugging')
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <AlertCircle className="w-5 h-5 text-blue-400 animate-pulse" />
                  <div>
                    <h3 className="font-semibold">Social Analytics</h3>
                    <p className="text-sm text-gray-400">Execution #12454</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">Duration</p>
                    <p className="font-medium">45s</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Nodes</p>
                    <p className="font-medium">5/10</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Started</p>
                    <p className="font-medium">45s ago</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                    Running
                  </span>
                </div>
              </div>
            </div>

            {/* Execution Item 4 - Completed */}
            <div
              className="glass-card p-5 hover:bg-glass-200 cursor-pointer transition-all"
              onClick={() => {
                setSelectedExecution('exec-4')
                setActiveTab('debugging')
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <h3 className="font-semibold">Data Processing Pipeline</h3>
                    <p className="text-sm text-gray-400">Execution #12453</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">Duration</p>
                    <p className="font-medium">1.5s</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Nodes</p>
                    <p className="font-medium">8/8</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Started</p>
                    <p className="font-medium">10 min ago</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Execution Item 5 - Completed */}
            <div
              className="glass-card p-5 hover:bg-glass-200 cursor-pointer transition-all"
              onClick={() => {
                setSelectedExecution('exec-5')
                setActiveTab('debugging')
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <h3 className="font-semibold">Email Campaign</h3>
                    <p className="text-sm text-gray-400">Execution #12452</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">Duration</p>
                    <p className="font-medium">2.1s</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Nodes</p>
                    <p className="font-medium">6/6</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Started</p>
                    <p className="font-medium">15 min ago</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debugging Tab - Single execution with logs and debug info */}
      {activeTab === 'debugging' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Execution Debugger</h2>
              <p className="text-sm text-gray-400">
                {selectedExecution ? `Debugging ${selectedExecution}` : 'Select an execution from the Executions tab'}
              </p>
            </div>
            <button
              className="glass-button px-4 py-2 text-sm"
              onClick={() => setActiveTab('executions')}
            >
              Back to Executions
            </button>
          </div>

          {selectedExecution ? (
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
                    <div className="glass-card p-4 bg-green-600/20 border-l-4 border-green-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Start Node</span>
                          <p className="text-xs text-gray-400 mt-1">Triggered at 10:30:15</p>
                        </div>
                        <span className="text-sm flex items-center text-green-400">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Completed
                        </span>
                      </div>
                    </div>
                    <div className="glass-card p-4 bg-green-600/20 border-l-4 border-green-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Data Transform</span>
                          <p className="text-xs text-gray-400 mt-1">Processed 142 records</p>
                        </div>
                        <span className="text-sm flex items-center text-green-400">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Completed
                        </span>
                      </div>
                    </div>
                    <div className="glass-card p-4 bg-yellow-600/20 border-l-4 border-yellow-400">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">API Call</span>
                          <p className="text-xs text-gray-400 mt-1">Waiting for response</p>
                        </div>
                        <span className="text-sm flex items-center text-yellow-400">
                          <Clock className="w-4 h-4 mr-1" />
                          In Progress
                        </span>
                      </div>
                    </div>
                    <div className="glass-card p-4 opacity-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-400">Email Send</span>
                          <p className="text-xs text-gray-400 mt-1">Waiting for previous node</p>
                        </div>
                        <span className="text-sm text-gray-400">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Terminal className="w-5 h-5 mr-2" />
                    Execution Logs
                  </h2>
                  <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                    <div className="text-green-400">[10:30:15] Starting workflow execution {selectedExecution}...</div>
                    <div className="text-blue-400">[10:30:15] Node 1: Start - Initializing</div>
                    <div className="text-green-400">[10:30:16] Node 1: Start - Status: COMPLETED (0.8s)</div>
                    <div className="text-blue-400">[10:30:16] Node 2: Data Transform - Processing 142 records</div>
                    <div className="text-gray-400">[10:30:16] Node 2: Record batch 1/3 processed</div>
                    <div className="text-gray-400">[10:30:16] Node 2: Record batch 2/3 processed</div>
                    <div className="text-gray-400">[10:30:17] Node 2: Record batch 3/3 processed</div>
                    <div className="text-green-400">[10:30:17] Node 2: Data Transform - Status: COMPLETED (1.2s)</div>
                    <div className="text-blue-400">[10:30:17] Node 3: API Call - Sending request to https://api.example.com</div>
                    <div className="text-yellow-400">[10:30:17] Node 3: Waiting for API response...</div>
                    <div className="text-gray-400">[10:30:18] Node 3: Response pending (timeout: 30s)</div>
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
                      <div className="text-xs text-gray-500 mt-1 font-mono">{`{user_id: "12345", ...}`}</div>
                    </div>
                    <div className="glass-card p-3">
                      <div className="text-sm font-medium">user_id</div>
                      <div className="text-xs text-gray-400">String</div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">"12345"</div>
                    </div>
                    <div className="glass-card p-3">
                      <div className="text-sm font-medium">processed_count</div>
                      <div className="text-xs text-gray-400">Number</div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">142</div>
                    </div>
                    <div className="glass-card p-3">
                      <div className="text-sm font-medium">api_response</div>
                      <div className="text-xs text-gray-400">Undefined</div>
                      <div className="text-xs text-gray-500 mt-1 font-mono">null</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Breakpoints</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-glass-200 rounded">
                      <span className="text-sm">Node 2: Line 23</span>
                      <button className="text-red-400 text-xs hover:text-red-300">Remove</button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-glass-200 rounded">
                      <span className="text-sm">Node 4: Line 45</span>
                      <button className="text-red-400 text-xs hover:text-red-300">Remove</button>
                    </div>
                  </div>
                  <button className="glass-button w-full mt-3 text-sm">Add Breakpoint</button>
                </div>

                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Performance</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Execution Time</span>
                      <span className="text-sm font-medium">2.8s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Memory Usage</span>
                      <span className="text-sm font-medium">24.5 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">CPU Usage</span>
                      <span className="text-sm font-medium">12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Network Calls</span>
                      <span className="text-sm font-medium">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <Bug className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Execution Selected</h3>
              <p className="text-gray-400 mb-6">Select an execution from the Executions tab to start debugging</p>
              <button
                className="glass-button px-6 py-3"
                onClick={() => setActiveTab('executions')}
              >
                Go to Executions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab Content */}
      {activeTab === 'analytics' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Executions</p>
                  <p className="text-3xl font-bold">12,456</p>
                  <p className="text-sm text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12.3%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-3xl font-bold">98.7%</p>
                  <p className="text-sm text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +2.1%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Response Time</p>
                  <p className="text-3xl font-bold">1.8s</p>
                  <p className="text-sm text-red-400 flex items-center mt-1">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    -5.2%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Users</p>
                  <p className="text-3xl font-bold">847</p>
                  <p className="text-sm text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +8.7%
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6">Execution Trends</h2>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization would go here</p>
                  <p className="text-sm">(Integrate with charting library)</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6">Top Workflows</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-glass-200 rounded-lg">
                  <div>
                    <div className="font-medium">Data Processing Pipeline</div>
                    <div className="text-sm text-gray-400">1,234 executions</div>
                  </div>
                  <div className="text-green-400">98.5%</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-glass-200 rounded-lg">
                  <div>
                    <div className="font-medium">Email Campaign</div>
                    <div className="text-sm text-gray-400">892 executions</div>
                  </div>
                  <div className="text-green-400">97.2%</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-glass-200 rounded-lg">
                  <div>
                    <div className="font-medium">Social Analytics</div>
                    <div className="text-sm text-gray-400">567 executions</div>
                  </div>
                  <div className="text-yellow-400">89.1%</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
