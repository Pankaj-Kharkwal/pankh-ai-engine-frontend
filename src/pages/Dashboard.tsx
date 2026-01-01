import {
  BarChart3,
  Zap,
  Clock,
  AlertCircle,
  PlusCircle,
  LayoutGrid,
  Settings,
  ListChecks,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWorkflows, useRegistryStats, useHealth } from '../hooks/useApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { WelcomeBanner } from '../components/common/WelcomeBanner'
import AIAssistant from '../components/ai/AIAssistant'

// Stat Card with Glassmorphism
interface StatCardProps {
  name: string
  value: string
  icon: React.ElementType
  description: string
  trend?: 'up' | 'down' | 'neutral'
}

function StatCard({ name, value, icon: Icon, description, trend = 'neutral' }: StatCardProps) {
  const isPositive = trend === 'up'
  const textColor = isPositive ? 'text-[#C8FF00]' : trend === 'down' ? 'text-red-400' : 'text-gray-400'

  return (
    <Card className="relative overflow-hidden bg-[#1a1325]/70 backdrop-blur-xl border-purple-400/20 hover:border-purple-400/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-300 uppercase tracking-wider">{name}</CardTitle>
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
          isPositive ? "bg-[#C8FF00]/10" : "bg-purple-400/10"
        )}>
          <Icon className={cn("h-5 w-5", isPositive ? "text-[#C8FF00]" : "text-purple-400")} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-extrabold text-gray-100">{value}</div>
        <div className="flex items-center gap-2 mt-2">
          {trend !== 'neutral' && (
            <TrendingUp className={cn(
              "h-3 w-3",
              trend === 'up' ? 'text-[#C8FF00]' : 'text-red-400 rotate-180'
            )} />
          )}
          <p className={cn("text-sm font-medium", textColor)}>{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Action Button with Glassmorphism
interface QuickActionProps {
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
  color?: string
}

function QuickAction({ icon: Icon, title, description, onClick, color = 'purple' }: QuickActionProps) {
  const colorClasses: Record<string, string> = {
    yellow: 'text-[#C8FF00]',
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
  }

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="w-full justify-start h-auto py-4 px-4 group bg-[#2a1d3a]/70 border border-purple-400/20 hover:bg-[#3a2750]/80 hover:border-purple-400/40 transition-all backdrop-blur-xl"
    >
      <div className="flex items-center gap-4 w-full">
        <Icon className={cn("h-6 w-6 flex-shrink-0", colorClasses[color])} strokeWidth={1.75} />
        <div className="flex-1 text-left">
          <div className="font-semibold text-gray-100">{title}</div>
          <div className="text-sm text-gray-400">{description}</div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Button>
  )
}

// Health Status Card with Glassmorphism
interface HealthCardProps {
  title: string
  status: 'healthy' | 'warning' | 'error'
  detail: string
  icon: React.ElementType
}

function HealthCard({ title, status, detail, icon: Icon }: HealthCardProps) {
  const statusConfig = {
    healthy: {
      bg: 'bg-green-500/20 border-green-400/30',
      text: 'text-green-300',
      icon: 'text-green-300',
      label: 'Operational',
    },
    warning: {
      bg: 'bg-yellow-500/20 border-yellow-400/30',
      text: 'text-yellow-300',
      icon: 'text-yellow-300',
      label: 'Degraded',
    },
    error: {
      bg: 'bg-red-500/20 border-red-400/30',
      text: 'text-red-300',
      icon: 'text-red-300',
      label: 'Offline',
    },
  }

  const config = statusConfig[status]

  return (
    <div className="text-center p-5 rounded-2xl bg-[#1a1325]/70 backdrop-blur-xl border border-purple-400/20 shadow-lg flex flex-col items-center justify-center">
      <div className={cn(
        "w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.4)] border",
        config.bg
      )}>
        <Icon className={cn("w-7 h-7", config.icon)} strokeWidth={1.75} />
      </div>
      <div className="font-bold text-lg text-gray-100">{title}</div>
      <div className={cn("text-base font-semibold mt-1", config.text)}>{config.label}</div>
      <div className="text-sm text-gray-400 mt-1">{detail}</div>
    </div>
  )
}

// Loading Skeleton with Glassmorphism
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120c1a] via-[#1a1325] to-[#0d0a12] p-8">
      <div className="space-y-10">
        <div>
          <Skeleton className="h-10 w-48 mb-2 bg-[#2c2038]" />
          <Skeleton className="h-5 w-72 bg-[#2c2038]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-[#1a1325]/70 backdrop-blur-xl border-purple-400/20">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 bg-[#2c2038]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-20 mb-2 bg-[#2c2038]" />
                <Skeleton className="h-3 w-32 bg-[#2c2038]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: workflows, isLoading: workflowsLoading, error: workflowsError } = useWorkflows()
  const { data: registryStats, isLoading: statsLoading } = useRegistryStats()
  const { data: health, isLoading: healthLoading } = useHealth()

  const totalWorkflows = Array.isArray(workflows) ? workflows.length : 0
  const activeWorkflows = Array.isArray(workflows)
    ? workflows.filter((w: any) => w.status === 'active').length
    : 0

  // Loading State
  if (workflowsLoading || statsLoading || healthLoading) {
    return <DashboardSkeleton />
  }

  // Error State
  if (workflowsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#120c1a] via-[#1a1325] to-[#0d0a12] p-8">
        <div className="space-y-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-100">Dashboard</h1>
            <p className="text-lg text-gray-400 mt-2">Overview of your workflows and system performance</p>
          </div>
          <Card className="bg-red-900/30 backdrop-blur-md border-2 border-red-500/40">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="h-10 w-10 text-red-300 shrink-0" />
              <div>
                <CardTitle className="text-red-200">Failed to load dashboard data</CardTitle>
                <CardDescription className="text-red-300">
                  Please check your API connection and refresh the page.
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const stats: StatCardProps[] = [
    {
      name: 'Total Workflows',
      value: totalWorkflows.toString(),
      icon: Zap,
      description: totalWorkflows > 0 ? 'Connected to API' : 'No workflows yet',
      trend: 'up',
    },
    {
      name: 'Active Workflows',
      value: activeWorkflows.toString(),
      icon: BarChart3,
      description: `${(totalWorkflows > 0 ? (activeWorkflows / totalWorkflows) * 100 : 0).toFixed(0)}% active rate`,
      trend: activeWorkflows > 0 ? 'up' : 'neutral',
    },
    {
      name: 'Block Registry',
      value: (registryStats as any)?.total_blocks?.toString() || '0',
      icon: LayoutGrid,
      description: `${(registryStats as any)?.enabled_blocks || 0} blocks available`,
      trend: 'neutral',
    },
    {
      name: 'API Status',
      value: health ? 'Online' : 'Offline',
      icon: Activity,
      description: health ? 'All systems operational' : 'Connection issues',
      trend: health ? 'up' : 'down',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120c1a] via-[#1a1325] to-[#0d0a12] p-8 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />

      <div className="space-y-10 relative z-10">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-extrabold text-gray-100 leading-tight">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-lg text-gray-300 mt-2">
            Your centralized hub for <span className="text-[#C8FF00]">Workflow Automation</span> and AI insights.
          </p>
        </header>

        {/* Welcome Banner */}
        <WelcomeBanner userName={user?.full_name} workflowCount={totalWorkflows} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.name} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1 bg-[#1a1325]/70 backdrop-blur-xl border-purple-400/20">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-100">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickAction
                icon={PlusCircle}
                title="Create Workflow"
                description="Start a new automation"
                onClick={() => navigate('/workflows/create')}
                color="yellow"
              />
              <QuickAction
                icon={ListChecks}
                title="View Workflows"
                description="Manage existing workflows"
                onClick={() => navigate('/workflows')}
                color="purple"
              />
              <QuickAction
                icon={LayoutGrid}
                title="Browse Blocks"
                description="Explore AI-powered blocks"
                onClick={() => navigate('/blocks')}
                color="blue"
              />
              <QuickAction
                icon={Clock}
                title="Executions"
                description="Monitor workflow runs"
                onClick={() => navigate('/executions')}
                color="green"
              />
            </CardContent>
          </Card>

          {/* Recent Workflows */}
          <Card className="lg:col-span-2 bg-[#1a1325]/70 backdrop-blur-xl border-purple-400/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-gray-100">Recent Workflows</CardTitle>
                <CardDescription className="text-gray-400">Your latest workflow automations</CardDescription>
              </div>
              {totalWorkflows > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/workflows')}
                  className="text-[#C8FF00] hover:text-[#C8FF00]/80 hover:bg-[#C8FF00]/10"
                >
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {Array.isArray(workflows) && workflows.length > 0 ? (
                <div className="space-y-3">
                  {workflows.slice(0, 5).map((workflow: any, index: number) => (
                    <button
                      key={workflow._id || workflow.id || `workflow-${index}`}
                      onClick={() => navigate(`/workflows/${workflow._id || workflow.id}`)}
                      className="flex items-center justify-between w-full p-4 rounded-xl bg-[#2a1d3a]/70 hover:bg-[#3a2750]/80 border border-purple-400/20 hover:border-purple-400/40 transition-all group text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-[#C8FF00]/10 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-[#C8FF00]" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-100 group-hover:text-[#C8FF00] transition-colors">
                            {workflow.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {workflow.created_at
                              ? new Date(workflow.created_at).toLocaleDateString()
                              : 'Unknown date'}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs px-3 py-1 font-medium rounded-full",
                          workflow.status === 'active'
                            ? 'bg-green-500/20 text-green-300 border-green-400/30'
                            : 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                        )}
                      >
                        {workflow.status || 'draft'}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-purple-400/40 rounded-2xl bg-[#2a1d3a]/40">
                  <Zap className="h-14 w-14 mx-auto text-[#C8FF00]/60 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-100 mb-1">No workflows yet</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Create your first workflow to get started
                  </p>
                  <Button
                    onClick={() => navigate('/workflows/create')}
                    className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create Workflow
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card className="bg-[#1a1325]/70 backdrop-blur-xl border-purple-400/20">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-100">System Health Monitor</CardTitle>
            <CardDescription className="text-gray-400">Real-time status of your infrastructure</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HealthCard
              title="API Gateway"
              status={health ? 'healthy' : 'error'}
              detail={health ? 'All endpoints responding' : 'Connection failed'}
              icon={Settings}
            />
            <HealthCard
              title="Block Registry"
              status={registryStats ? 'healthy' : 'warning'}
              detail={registryStats ? `${(registryStats as any).enabled_blocks || 0} blocks ready` : 'Loading...'}
              icon={LayoutGrid}
            />
            <HealthCard
              title="Workflow Engine"
              status="healthy"
              detail="Processing jobs normally"
              icon={Activity}
            />
          </CardContent>
        </Card>

        {/* AI Assistant */}
        <AIAssistant
          context={`Dashboard overview: ${totalWorkflows} workflows, ${activeWorkflows} active. ${(registryStats as any)?.enabled_blocks || 0} blocks enabled. API Health: ${health ? 'Online' : 'Offline'}`}
          contextType="general"
          suggestions={[
            'Create a new AI-powered workflow',
            'How do I integrate a custom block?',
            'Show me top performing workflows',
            "What's new in the block registry?",
            'Explain system health metrics',
          ]}
        />
      </div>
    </div>
  )
}
