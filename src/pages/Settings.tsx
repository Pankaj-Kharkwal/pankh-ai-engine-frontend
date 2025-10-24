import { Save, Key, Bell, Shield, Palette } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-gray-400 mt-2">Configure your PankhAI workspace</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2 text-blue-400" />
              API Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">API Endpoint</label>
                <input
                  type="text"
                  defaultValue="http://api:8000/api/v1/"
                  className="glass-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input
                  type="password"
                  placeholder="Enter your API key..."
                  className="glass-input w-full"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-green-400" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Workflow completion</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span>Error alerts</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span>System updates</span>
                <input type="checkbox" className="toggle" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-purple-400" />
              Appearance
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select className="glass-input w-full">
                  <option>Dark (Glassmorphic)</option>
                  <option>Light</option>
                  <option>System</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Accent Color</label>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full cursor-pointer border-2 border-white"></div>
                  <div className="w-8 h-8 bg-purple-500 rounded-full cursor-pointer"></div>
                  <div className="w-8 h-8 bg-green-500 rounded-full cursor-pointer"></div>
                  <div className="w-8 h-8 bg-yellow-500 rounded-full cursor-pointer"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-red-400" />
              Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Two-factor authentication</span>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <span>Session timeout</span>
                <select className="glass-input">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                  <option>Never</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="glass-button px-6 py-3 bg-blue-600 hover:bg-blue-700 hover:animate-glow flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  )
}