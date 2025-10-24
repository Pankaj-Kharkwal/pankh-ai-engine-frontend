import { BarChart3, TrendingUp, TrendingDown, Activity, Users } from 'lucide-react'

export default function Analytics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
        <p className="text-gray-400 mt-2">Performance metrics and insights for your workflows</p>
      </div>

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
    </div>
  )
}
