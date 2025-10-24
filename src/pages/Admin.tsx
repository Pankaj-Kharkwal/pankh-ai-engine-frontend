import { Users, Shield, BarChart3, Database, AlertTriangle } from 'lucide-react'

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', workflows: 12 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', workflows: 8 },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'User', status: 'Inactive', workflows: 3 },
]

export default function Admin() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">Manage users, system settings, and monitor platform health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-3xl font-bold">1,247</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Workflows</p>
              <p className="text-3xl font-bold">342</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">System Health</p>
              <p className="text-3xl font-bold text-green-400">99.9%</p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Storage Used</p>
              <p className="text-3xl font-bold">68%</p>
            </div>
            <Database className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-400">
                  <th className="text-left py-3 font-medium">Name</th>
                  <th className="text-left py-3 font-medium">Role</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Workflows</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-glass-200">
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'Admin' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-gray-900 text-gray-300'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3">{user.workflows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">System Alerts</h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-yellow-900/20 border border-yellow-400/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
                <div className="flex-1">
                  <div className="font-medium">High CPU Usage</div>
                  <div className="text-sm text-gray-400">Worker node-3 at 87%</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-900/20 border border-blue-400/20 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400 mr-3" />
                <div className="flex-1">
                  <div className="font-medium">Security Update</div>
                  <div className="text-sm text-gray-400">Available for deployment</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full glass-button p-3 text-left hover:animate-glow">
                <div className="font-medium">Backup Database</div>
                <div className="text-sm text-gray-400">Create system backup</div>
              </button>
              <button className="w-full glass-button p-3 text-left hover:animate-glow">
                <div className="font-medium">Update System</div>
                <div className="text-sm text-gray-400">Deploy latest updates</div>
              </button>
              <button className="w-full glass-button p-3 text-left hover:animate-glow">
                <div className="font-medium">Generate Report</div>
                <div className="text-sm text-gray-400">Monthly usage report</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}