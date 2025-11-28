import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  GitBranch,
  Play,
  MessageSquare,
  Blocks,
  Store,
  Activity,
  Bug,
  BarChart3,
  Zap,
  Users,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react'
import WorkflowBuilderRedesign from './WorkflowBuilderRedesign'

export default function WorkflowBuilderRedesignPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<'day' | 'night'>('night')
  const isDay = theme === 'day'


  return (
    <div className={`fixed inset-0 flex flex-col ${isDay ? 'bg-white text-gray-900' : 'bg-[#1a0f22] text-white'} overflow-hidden`}>
      {/* Back Button Header */}
      <div className={`flex-shrink-0 px-4 z-50 ${isDay ? 'bg-gray-200 border-b border-gray-200' : 'bg-[#1a0f22] border-b border-[#27202a]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className={`${isDay ? 'p-2 rounded bg-gray-100 text-gray-900 hover:bg-gray-200' : 'p-2 rounded bg-[#150b1e] text-gray-200 hover:bg-[#2a172e]'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(t => (t === 'night' ? 'day' : 'night'))}
              aria-label="Toggle theme"
              className={`p-2 rounded bg-transparent transition-colors ${isDay ? 'text-gray-800 hover:bg-black/5' : 'text-gray-200 hover:bg-white/5'}`}
            >
              {theme === 'night' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Slide-in Sidebar (mobile-style) */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`h-full ${isDay ? 'bg-white shadow' : 'bg-[#120c1a] shadow-xl'}`}>
          <div className={`flex items-center justify-between p-4 ${isDay ? 'border-b border-gray-200' : 'border-b border-[#27202a]'}`}>
            <div className="flex items-center gap-3">
              <div className={`${isDay ? 'w-10 h-10 bg-gray-100 rounded flex items-center justify-center' : 'w-10 h-10 bg-white/5 rounded flex items-center justify-center'}`}>
                <img src="/logo.png" alt="logo" className="w-6 h-6" />
              </div>
              <div>
                <div className={`${isDay ? 'text-gray-900 font-semibold' : 'text-white font-semibold'}`}>PankhAI</div>
                <div className="text-xs text-yellow-500">Workflow Engine</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`${isDay ? 'p-2 rounded bg-transparent text-gray-700 hover:text-gray-900' : 'p-2 rounded bg-transparent text-gray-300 hover:text-white'}`}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-96px)]">
            {/* Primary Navigation */}
            <div className="space-y-1">
              {[
                { name: 'Dashboard', href: '/', end: true, icon: LayoutDashboard },
                { name: 'Workflow Builder', href: '/workflows/create', icon: GitBranch },
                { name: 'Workflows', href: '/workflows', end: true, icon: Play },
                { name: 'BYOChatbot', href: '/chatbot', icon: MessageSquare },
                { name: 'Blocks', href: '/blocks', icon: Blocks },
              ].map(item => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all duration-150 ${isActive ? (isDay ? 'bg-gray-100 text-gray-900' : 'bg-white/10 text-white') : (isDay ? 'text-gray-700 hover:bg-gray-50' : 'text-white/70 hover:bg-white/5')}`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </NavLink>
              ))}
            </div>

            <div className={`${isDay ? 'border-t border-gray-200 mt-3 pt-3 text-xs text-gray-500' : 'border-t border-[#27202a] mt-3 pt-3 text-xs text-gray-300'}`}>More</div>

            <div className="space-y-1 mt-2">
              {[
                { name: 'Marketplace', href: '/marketplace', icon: Store },
                { name: 'Executions', href: '/executions', icon: Activity },
                { name: 'Debug Console', href: '/debug', icon: Bug },
                { name: 'Analytics', href: '/analytics', icon: BarChart3 },
                { name: 'Workflow Manager', href: '/workflow-manager', icon: Zap },
                { name: 'Admin', href: '/admin', icon: Users },
                { name: 'Settings', href: '/settings', icon: Settings },
              ].map(item => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all duration-150 ${isActive ? (isDay ? 'bg-gray-100 text-gray-900' : 'bg-white/10 text-white') : (isDay ? 'text-gray-700 hover:bg-gray-50' : 'text-white/70 hover:bg-white/5')}`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay when sidebar open */}
      {sidebarOpen && (
        <div
          className={`fixed inset-0 z-40 ${isDay ? 'bg-black/20' : 'bg-black/50'}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Full Screen Workflow Builder */}
      <div className="flex-1 overflow-hidden h-full">
        <WorkflowBuilderRedesign theme={theme} />
      </div>
    </div>
  )
}

