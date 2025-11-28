import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play,
  Edit,
  Copy,
  Trash2,
  Plus,
  Filter,
  Search,
  Loader2,
  AlertCircle,
  Clock,
  Zap,
  Settings,
  Tag,
} from 'lucide-react'
import { useWorkflows, useRunWorkflow } from '../hooks/useApi'
import { useAuth } from '../contexts/AuthContext'

// --- Helper Types & Simulated Data (for demonstration) ---
type WorkflowCategory = 'AI' | 'Data' | 'Integration' | 'Scheduled'
type Workflow = {
  id: string
  name: string
  category: WorkflowCategory
  created_at: string
  last_run_at?: string
  status: 'active' | 'inactive' | 'error'
}

// Helper to render workflow category tags
const CategoryTag = ({ category }: { category: WorkflowCategory }) => {
  let color = 'bg-indigo-700/50 text-indigo-300' // Updated for dark mode
  if (category === 'AI') color = 'bg-pink-700/50 text-pink-300'
  else if (category === 'Data') color = 'bg-yellow-700/50 text-yellow-300'
  else if (category === 'Scheduled') color = 'bg-cyan-700/50 text-cyan-300'

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded ${color} ml-2 flex-shrink-0`}
    >
      {category}
    </span>
  )
}

// Helper to render status badges
const StatusBadge = ({ status }: { status: Workflow['status'] }) => {
  // Colors updated to contrast against dark background
  let color = '  bg-[#6B7280]/30' // Gray/Inactive
  let text = 'Inactive'
  let Icon = Clock

  if (status === 'active') {
    color = 'text-[#6BFFB2] bg-[#6BFFB2]/20' // Mint Green/Active
    text = 'Active'
    Icon = Zap
  } else if (status === 'error') {
    color = 'text-[#FF6B6B] bg-[#FF6B6B]/20' // Coral Red/Error
    text = 'Error'
    Icon = AlertCircle
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${color}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {text}
    </span>
  )
}

// --- Main Component ---
export default function Workflows() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [runningId, setRunningId] = useState<string | null>(null)

  const { data: workflows, isLoading, error } = useWorkflows()
  const runWorkflowMutation = useRunWorkflow()

  // --- SIMULATE ENHANCED DATA (Same as before) ---
  const enhancedWorkflows: Workflow[] = (Array.isArray(workflows) ? workflows : []).map(
    (wf: any, index) => {
      const categories: WorkflowCategory[] = ['AI', 'Data', 'Integration', 'Scheduled']
      const statuses: Workflow['status'][] = ['active', 'inactive', 'error', 'active']

      return {
        ...wf,
        id: wf.id || `wf-${index}`,
        category: categories[index % categories.length],
        last_run_at:
          wf.last_run_at ||
          (index % 3 === 0 ? new Date(Date.now() - index * 60000).toISOString() : undefined),
        status: wf.status || statuses[index % statuses.length],
      }
    }
  )
  // --- END SIMULATE ENHANCED DATA ---

  const filteredWorkflows = enhancedWorkflows.filter(workflow =>
    workflow.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRunWorkflow = (workflowId: string) => {
    setRunningId(workflowId)
    runWorkflowMutation.mutate(workflowId, {
      onSuccess: () => setRunningId(null),
      onError: () => setRunningId(null),
    })
  }

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold gradient-text">Workflows</h1>
        <div className="glass-card p-12 min-h-[300px] flex flex-col justify-center items-center  ">
          <Loader2 className="w-10 h-10 animate-spin text-[#00C8FF] mb-3" />
          <span className="text-xl">Loading Workflows...</span>
        </div>
      </div>
    )
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold gradient-text">Workflows</h1>
        <div className="glass-card p-6 border-l-4 border-[#FF6B6B] bg-[#FF6B6B]/20">
          <div className="flex items-center space-x-4 text-[#FF6B6B]">
            <AlertCircle className="w-8 h-8 flex-shrink-0" />
            <div>
              <div className="font-medium text-lg text-white">Failed to Load Workflows</div>
              <div className="text-sm text-gray-400 mt-1">
                A connection error occurred. Check the console for details or refresh the page.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Main Content ---
  return (
    <div className="space-y-10">
      {/* Header with CTA */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold gradient-text">Your Workflows</h1>
          <p className="  mt-2 text-lg opacity-70">
            {enhancedWorkflows.length > 0
              ? `${enhancedWorkflows.length} active automations. Ready to run.`
              : 'Start by creating your first workflow to automate tasks.'}
          </p>
        </div>
        {/* CTA Button: Accent Color #00C8FF */}
        <button
          onClick={() => navigate('/workflows/create')}
          className="glass-button px-6 py-3 bg-[#C8A2FF] hover:bg-[#B385FF] text-[#1A1C20] flex items-center space-x-2 transition-all duration-200 shadow-xl shadow-[#C8A2FF]/30 font-bold"
          aria-label="Create New Workflow"
        >
          <Plus className="w-5 h-5" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Workflow List Card */}
      <div className="glass-card p-6 shadow-2xl">
        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-8 flex-wrap sm:flex-nowrap">
          <div className="flex-1 relative w-full sm:w-auto">
            {/* Inactive Color: #6B7280 */}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search by name, ID, or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#00C8FF]" /* Focus ring is Accent Blue */
            />
          </div>
          <button className="glass-button px-4 py-3 flex items-center space-x-2 flex-shrink-0   hover:bg-white/10">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        {/* Workflow Table */}
        {filteredWorkflows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                {/* Text Color: #6B7280 */}
                <tr className="text-[#6B7280] uppercase text-xs tracking-wider">
                  <th className="text-left py-3 font-semibold w-1/3">Workflow Name</th>
                  <th className="text-left py-3 font-semibold hidden sm:table-cell w-[100px]">
                    Status
                  </th>
                  <th className="text-left py-3 font-semibold hidden md:table-cell w-[180px]">
                    Last Run
                  </th>
                  <th className="text-right py-3 font-semibold w-[150px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkflows.map(workflow => {
                  const isRunning = runningId === workflow.id && runWorkflowMutation.isPending
                  return (
                    <tr
                      key={workflow.id}
                      className="border-b border-white/5 cursor-pointer transition-colors duration-150 group hover:bg-white/10"
                      onClick={() => navigate(`/workflows/${workflow.id}`)}
                    >
                      <td className="py-4 font-medium  ">
                        <div className="flex items-center flex-wrap gap-2">
                          {/* Accent Color: #00C8FF on hover */}
                          <span className="group-hover:text-[#00C8FF] transition-colors duration-150">
                            {workflow.name}
                          </span>
                          <CategoryTag category={workflow.category} />
                        </div>
                        {/* Text Color: #6B7280 */}
                        <div className="text-xs text-[#6B7280] font-mono mt-1">
                          ID: {workflow.id.substring(0, 8)}...
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 hidden sm:table-cell">
                        <StatusBadge status={workflow.status} />
                      </td>

                      {/* Last Run Column */}
                      <td className="py-4 text-[#A0A0A0] text-sm hidden md:table-cell">
                        {workflow.last_run_at ? (
                          new Date(workflow.last_run_at).toLocaleString()
                        ) : (
                          <span className="text-[#6B7280] italic">Never Run</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {/* Run Button: Success Color #6BFFB2 */}
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              handleRunWorkflow(workflow.id)
                            }}
                            disabled={isRunning || !workflow.id}
                            className={`glass-button p-2 transition-all duration-150 ${isRunning ? 'bg-white/10' : 'text-[#6BFFB2] hover:bg-[#6BFFB2]/20 hover:shadow-md hover:shadow-[#6BFFB2]/20'}`}
                            title={isRunning ? 'Running...' : 'Execute Workflow'}
                          >
                            {isRunning ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 fill-[#6BFFB2]" />
                            )}
                          </button>

                          {/* Edit Button: Accent Color #00C8FF */}
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              navigate(`/workflows/${workflow.id}`)
                            }}
                            className="glass-button p-2 text-[#00C8FF] hover:bg-[#00C8FF]/20 hover:shadow-md hover:shadow-[#00C8FF]/20"
                            title="Edit Workflow"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Overflow Menu (Tertiary Actions) */}
                          <div className="relative group">
                            {/* Inactive Color: #6B7280 */}
                            <button
                              className="glass-button p-2 text-[#6B7280] hover:bg-white/10"
                              title="More options"
                              onClick={e => e.stopPropagation()}
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            {/* Menu Background: Dark Charcoal #282C34 (or similar dark glass-card style) */}
                            <div className="absolute right-0 mt-2 w-40 rounded-lg shadow-2xl bg-[#282C34]/95 backdrop-blur-md z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto origin-top-right scale-95 group-hover:scale-100">
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  alert(`Clone workflow: ${workflow.name}`)
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm   hover:bg-white/10 rounded-t-lg"
                              >
                                <Copy className="w-4 h-4 mr-2" /> Clone
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  if (
                                    confirm(
                                      `Are you sure you want to delete the workflow: ${workflow.name}? This action cannot be undone.`
                                    )
                                  ) {
                                    alert('Delete initiated...')
                                  }
                                }}
                                // CORRECTED: Removed the misplaced JSX comment here
                                className="flex items-center w-full px-4 py-2 text-sm text-[#FF6B6B] hover:bg-[#FF6B6B]/20 rounded-b-lg"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty/No Workflows State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 p-4 rounded-full border-2 border-[#6B7280]/50 flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              {searchTerm ? (
                <Search className="w-12 h-12 text-[#6B7280] opacity-80" />
              ) : (
                <Zap className="w-12 h-12 text-purple-500 opacity-80" />
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm
                ? 'No Workflows Match Your Search'
                : `Ready to get started${user?.full_name ? ', ' + user.full_name.split(' ')[0] : ''}?`}
            </h3>
            <p className="text-[#A0A0A0] mb-6 max-w-md mx-auto">
              {searchTerm
                ? 'Try simplifying your keywords or clear the search to view all automations.'
                : 'You have 0 workflows. Create your first automation to unlock the power of AI-driven workflows!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/workflows/create')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Start Your First Workflow</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
