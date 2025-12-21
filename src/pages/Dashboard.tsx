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
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useAuth } from '../contexts/AuthContext'

// Stat Card Component
interface StatCardProps {
  name: string
  value: string
  icon: React.ElementType
  description: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

function StatCard({ name, value, icon: Icon, description, trend = 'neutral', trendValue }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300 glow-effect-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{name}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend !== 'neutral' && (
            <TrendingUp className={cn(
              "h-3 w-3",
              trend === 'up' ? 'text-green-500' : 'text-red-500 rotate-180'
            )} />
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  )
}

// Quick Action Button
interface QuickActionProps {
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
}

function QuickAction({ icon: Icon, title, description, onClick }: QuickActionProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="w-full justify-start h-auto py-3 px-4 group hover:bg-primary/5 hover:border-primary/30 border border-transparent transition-all"
    >
      <div className="flex items-center gap-3 w-full">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Button>
  )
}

// Health Status Card
interface HealthCardProps {
  title: string
  status: 'healthy' | 'warning' | 'error'
  detail: string
  icon: React.ElementType
}

function HealthCard({ title, status, detail, icon: Icon }: HealthCardProps) {
  const statusColors = {
    healthy: 'bg-green-500/10 text-green-500 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  const statusLabels = {
    healthy: 'Operational',
    warning: 'Degraded',
    error: 'Offline',
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/50">
      <div className={cn("h-12 w-12 rounded-full flex items-center justify-center border", statusColors[status])}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{detail}</div>
      </div>
      <Badge variant="outline" className={cn("shrink-0", statusColors[status])}>
        {statusLabels[status]}
      </Badge>
    </div>
  )
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your workflows and system performance</p>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-6">
            <AlertCircle className="h-10 w-10 text-destructive shrink-0" />
            <div>
              <CardTitle className="text-destructive">Failed to load dashboard data</CardTitle>
              <CardDescription className="text-destructive/80">
                Please check your API connection and refresh the page.
              </CardDescription>
            </div>
          </CardContent>
        </Card>
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">
          Your AI workflow automation hub. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              icon={PlusCircle}
              title="Create Workflow"
              description="Start a new automation"
              onClick={() => navigate('/workflows/create')}
            />
            <QuickAction
              icon={ListChecks}
              title="View Workflows"
              description="Manage existing workflows"
              onClick={() => navigate('/workflows')}
            />
            <QuickAction
              icon={LayoutGrid}
              title="Browse Blocks"
              description="Explore AI-powered blocks"
              onClick={() => navigate('/blocks')}
            />
            <QuickAction
              icon={Clock}
              title="Executions"
              description="Monitor workflow runs"
              onClick={() => navigate('/executions')}
            />
          </CardContent>
        </Card>

        {/* Recent Workflows */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Workflows</CardTitle>
              <CardDescription>Your latest workflow automations</CardDescription>
            </div>
            {totalWorkflows > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/workflows')}>
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
                    className="flex items-center justify-between w-full p-3 rounded-lg bg-card/50 hover:bg-accent/50 border border-transparent hover:border-primary/20 transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors">
                          {workflow.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {workflow.created_at
                            ? new Date(workflow.created_at).toLocaleDateString()
                            : 'Unknown date'}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={workflow.status === 'active' ? 'default' : 'secondary'}
                      className={workflow.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                    >
                      {workflow.status || 'draft'}
                    </Badge>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-1">No workflows yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first workflow to get started
                </p>
                <Button onClick={() => navigate('/workflows/create')} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create Workflow
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Real-time status of your infrastructure</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
  )
}
