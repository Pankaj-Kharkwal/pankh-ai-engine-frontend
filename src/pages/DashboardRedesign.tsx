import {
  BarChart3,
  Zap,
  Clock,
  AlertCircle,
  PlusCircle,
  LayoutGrid,
  Settings,
  ListChecks,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWorkflows, useRegistryStats, useHealth } from '../hooks/useApi'
import AIAssistant from '../components/ai/AIAssistant'
import { WelcomeBanner } from '../components/common/WelcomeBanner'
import { useAuth } from '../contexts/AuthContext'

// --- Glassmorphism Styles (Conceptual via Tailwind classes) ---
// The 'glass-card' class would typically involve:
// 1. A semi-transparent background (e.g., bg-white/60 or bg-gray-100/30)
// 2. A backdrop blur (e.g., backdrop-blur-md)
// 3. A light border.
// Since Tailwind doesn't include 'backdrop-filter' by default, I'll use a class
// that implies it, relying on a custom Tailwind config to implement 'glass-effect'.
// For this example, I'll use a strong background with border and shadow to mimic the feel.

// Helper component for Stat Cards
const StatCard = ({ name, value, icon: Icon, change, changeType }: any) => {
const isHealthy = changeType === 'positive'
const textColor = isHealthy ? 'text-yellow-300' : 'text-red-400'
const iconBg = isHealthy
  ? 'bg-yellow-300/10 backdrop-blur-sm'
  : 'bg-red-300/10 backdrop-blur-sm'
const iconColor = isHealthy ? 'text-yellow-400' : 'text-red-400'


  return (
  <div className="relative  bg-[#1a1325]/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl transition-all duration-300 border border-purple-400/20  hover:border-purple-400/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] group
  ">
    <div className="flex items-start justify-between relative z-10">

      <div>
        <p className="text-sm font-medium text-gray-300 uppercase tracking-wider">
          {name}
        </p>

        <p className="text-4xl font-extrabold text-gray-100 mt-1">
          {value}
        </p>

        <p className={`text-sm mt-3 font-semibold ${textColor}`}>
          {change}
        </p>
      </div>

      <div className={`p-3 rounded-xl shadow-lg ${iconBg}`}>
        <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={2} />
      </div>

    </div>
  </div>
);
}

// Helper component for Quick Action Buttons
const QuickActionButton = ({ icon: Icon, title, subtitle, color, onClick }: any) => (
  <button
    onClick={onClick}
    className={`
      w-full relative flex items-center p-4  
      transition-all duration-200 transform hover:scale-[1.02]
      focus:outline-none focus:ring-4 focus:ring-${color}-400/30
      
      bg-[#2a1d3a]/70 
      border border-purple-400/20 
      hover:bg-[#3a2750]/80
      backdrop-blur-xl 
      shadow-[0_0_12px_rgba(0,0,0,0.3)]
    `}
  >
    <Icon 
      className={`w-6 h-6 text-${color}-300 mr-4 flex-shrink-0 drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]`} 
      strokeWidth={1.75} 
    />

    <div className="text-left">
      <div className="font-semibold text-base text-gray-100">{title}</div>
      <div className="text-sm text-gray-300">{subtitle}</div>
    </div>
  </button>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: workflows, isLoading: workflowsLoading, error: workflowsError } = useWorkflows();
  const { data: registryStats, isLoading: statsLoading } = useRegistryStats();
  const { data: health, isLoading: healthLoading } = useHealth();

  const totalWorkflows = Array.isArray(workflows) ? workflows.length : 0;
  const activeWorkflows = Array.isArray(workflows)
    ? workflows.filter((w: any) => w.status === "active").length
    : 0;

  // ------------------------------------------------------
  // DARK MODE LOADING STATE
  // ------------------------------------------------------
  if (workflowsLoading || statsLoading || healthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#120c1a] via-[#1a1325] to-[#0d0a12] p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <img
            src="/path/to/ai-network-tree-bg.svg"
            className="w-full h-full object-cover blur-sm"
          />
        </div>

        <div className="space-y-10 relative z-10">
          <header className="mb-6">
            <h1 className="text-4xl font-extrabold text-gray-100 leading-tight">
              Dashboard
            </h1>
            <p className="text-lg text-gray-400 mt-2">Loading system overview...</p>
          </header>

          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-[#1a1325]/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl animate-pulse
                           border border-purple-400/20"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-[#2c2038] rounded w-28"></div>
                    <div className="h-10 bg-[#2c2038] rounded w-20"></div>
                    <div className="h-3 bg-[#2c2038] rounded w-32"></div>
                  </div>
                  <div className="w-12 h-12 bg-[#2c2038] rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------
  // ERROR STATE (Dark Mode)
  // ------------------------------------------------------
  if (workflowsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#120c1a] via-[#1a1325] to-[#0d0a12] p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <img
            src="/path/to/ai-network-tree-bg.svg"
            className="w-full h-full object-cover blur-sm"
          />
        </div>

        <div className="space-y-10 relative z-10">
          <header className="mb-6">
            <h1 className="text-4xl font-extrabold text-gray-100 leading-tight">
              Dashboard
            </h1>
            <p className="text-lg text-gray-400 mt-2">
              Overview of your workflows and system performance
            </p>
          </header>

          <div className="bg-red-900/30 backdrop-blur-md border-2 border-red-500/40 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-4 text-red-300">
              <AlertCircle className="w-8 h-8 flex-shrink-0" strokeWidth={2} />
              <div>
                <div className="font-bold text-xl text-red-200">
                  Failed to load dashboard data
                </div>
                <div className="text-base mt-1 text-red-300">
                  Please check your API connection and refresh the page.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Workflows",
      value: totalWorkflows.toString(),
      icon: Zap,
      change: totalWorkflows > 0 ? "Connected to API" : "No workflows found",
      changeType: "positive"
    },
    {
      name: "Active Workflows",
      value: activeWorkflows.toString(),
      icon: BarChart3,
      change: `${(
        totalWorkflows > 0 ? (activeWorkflows / totalWorkflows) * 100 : 0
      ).toFixed(0)}% Active`,
      changeType: "positive"
    },
    {
      name: "Block Registry",
      value: (registryStats as any)?.total_blocks?.toString() || "0",
      icon: LayoutGrid,
      change: `${(registryStats as any)?.enabled_blocks || 0} blocks available`,
      changeType: "positive"
    },
    {
      name: "API Status",
      value: health ? "Online" : "Offline",
      icon: Clock,
      change: health ? "System healthy" : "Connection error",
      changeType: health ? "positive" : "negative"
    }
  ];

  // ------------------------------------------------------
  // MAIN DASHBOARD — DARK MODE
  // ------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120c1a] via-[#1a1325] to-[#0d0a12] p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <img
          src="/path/to/ai-network-tree-bg.svg"
          className="w-full h-full object-cover blur-sm"
        />
      </div>

      <div className="space-y-10 relative z-10">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-4xl font-extrabold text-gray-100 leading-tight">
            Dashboard
          </h1>
          <p className="text-lg text-gray-300 mt-2">
            Your centralized hub for <span className='text-yellow-500'>Workflow Automation</span> and AI insights.
          </p>
        </header>

        {/* Welcome Banner */}
        <WelcomeBanner userName={user?.full_name} workflowCount={totalWorkflows} />

        {/* Stats Cards (already dark-mode converted component) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.name} {...stat} />
          ))}
        </div>

        <div className="flex flex-col">
          {/* Quick Actions */}
          <div className="bg-[#1a1325]/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-400/20">
            <h2 className="text-2xl font-bold mb-6 text-gray-100">Quick Actions</h2>

            <div className="grid grid-cols-2 gap-2">
              <QuickActionButton
                title="Create New Workflow"
                subtitle="Start building a new automation with AI"
                icon={PlusCircle}
                color="yellow"
                onClick={() => navigate("/workflows/create")}
              />
              <QuickActionButton
                title="View All Workflows"
                subtitle="Manage, edit, and monitor your existing flows"
                icon={ListChecks}
                color="purple"
                onClick={() => navigate("/workflows")}
              />
              <QuickActionButton
                title="Browse AI Blocks"
                subtitle="Explore powerful AI-driven building blocks"
                icon={LayoutGrid}
                color="blue"
                onClick={() => navigate("/blocks")}
              />
              <QuickActionButton
                title="Monitor Executions"
                subtitle="Review recent workflow runs and logs"
                icon={Clock}
                color="green"
                onClick={() => navigate("/executions")}
              />
            </div>
          </div>

          {/* Recent Workflows */}
          <div className="bg-[#1a1325]/70 backdrop-blur-xl rounded-2xl mt-8 p-6 shadow-xl lg:col-span-2 border border-purple-400/20">
            <h2 className="text-2xl font-bold mb-6 text-gray-100">Recent Workflows</h2>

            {Array.isArray(workflows) && workflows.length > 0 ? (
              <div className="space-y-3">
                {workflows.slice(0, 5).map((workflow: any, index: number) => (
                  <button
                    key={workflow._id || workflow.id || `workflow-${index}`}
                    className="flex w-full items-center justify-between p-3 bg-[#2a1d3a]/70 
                               border border-purple-400/20 hover:bg-[#3a2750]/80 
                               transition-colors cursor-pointer focus:outline-none 
                               focus:ring-2 focus:ring-purple-500/50"
                    onClick={() =>
                      navigate(`/workflows/${workflow._id || workflow.id}`)
                    }
                  >
                    <div className="flex items-center">
                      <Zap
                        className="w-5 h-5 text-yellow-400 mr-4 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                      <div className="text-left">
                        <div className="text-base font-semibold text-gray-100">
                          {workflow.name}
                        </div>
                        <div className="text-sm text-gray-400 mt-0.5">
                          Created:{" "}
                          {workflow.created_at
                            ? new Date(workflow.created_at).toLocaleDateString()
                            : "Unknown date"}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 font-medium rounded-full
                        ${
                          workflow.status === "active"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-yellow-600/20 text-yellow-300"
                        }`}
                    >
                      {workflow.status || "draft"}
                    </span>
                  </button>
                ))}

                {workflows.length > 5 && (
                  <button
                    onClick={() => navigate("/workflows")}
                    className="w-full text-center text-yellow-300 hover:text-yellow-200 mt-4 font-medium text-base py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/40 rounded-lg"
                  >
                    View All Workflows ({workflows.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12 border-2 border-dashed border-purple-400/40 rounded-2xl bg-[#2a1d3a]/40">
                <Zap className="w-14 h-14 mx-auto mb-4 text-yellow-300/60" strokeWidth={1.5} />
                <p className="text-lg font-semibold text-gray-100">
                  Ready to create your first workflow?
                </p>
                <p className="text-base mt-1 text-gray-300 mb-4">
                  Use the <strong>Create New Workflow</strong> button to start building!
                </p>

                <button
                  onClick={() => navigate("/workflows/create")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PlusCircle className="w-5 h-5" />
                  Create Your First Workflow
                </button>
              </div>
            )}
          </div>
        </div>

        {/* System Health Monitor */}
        <div className="bg-[#1a1325]/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-400/20">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">
            System Health Monitor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HealthPillar
              title="API Gateway"
              status={health ? "Operational" : "Offline"}
              detail={health ? "All core services active" : "Connection failed"}
              isHealthy={!!health}
              Icon={Settings}
            />

            <HealthPillar
              title="Block Registry"
              status="Online"
              detail={
                registryStats
                  ? `${(registryStats as any).enabled_blocks || 0} of ${(registryStats as any)
                      .total_blocks || 0} blocks available`
                  : "Loading..."
              }
              isHealthy={!!registryStats}
              Icon={LayoutGrid}
            />

            <HealthPillar
              title="Workflow Engine"
              status="Running"
              detail="Processing jobs normally"
              isHealthy={true}
              Icon={Clock}
            />
          </div>
        </div>

        {/* AI Assistant */}
        <AIAssistant
          context={`Dashboard overview: ${totalWorkflows} workflows, ${activeWorkflows} active. ${(registryStats as any)?.enabled_blocks || 0
            } blocks enabled. API Health: ${health ? "Online" : "Offline"}`}
          contextType="general"
          suggestions={[
            "Create a new AI-powered workflow",
            "How do I integrate a custom block?",
            "Show me top performing workflows",
            "What's new in the block registry?",
            "Explain system health metrics"
          ]}
        />
      </div>
    </div>
  );
}

// Custom Health Pillar component
const HealthPillar = ({ title, status, detail, isHealthy, Icon }: any) => {
  const statusBgColor = isHealthy
    ? "bg-green-500/20 border-green-400/30"
    : "bg-red-500/20 border-red-400/30";

  const statusTextColor = isHealthy ? "text-green-300" : "text-red-300";
  const iconColor = isHealthy ? "text-green-300" : "text-red-300";

  return (
    <div className="
      text-center p-5 rounded-2xl 
      bg-[#1a1325]/70 backdrop-blur-xl 
      border border-purple-400/20 
      shadow-lg flex flex-col items-center justify-center
    ">
      <div
        className={`
          w-16 h-16 mx-auto mb-3 rounded-full 
          flex items-center justify-center 
          shadow-[0_0_15px_rgba(0,0,0,0.4)]
          ${statusBgColor}
        `}
      >
        <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={1.75} />
      </div>

      <div className="font-bold text-lg text-gray-100">{title}</div>

      <div className={`text-base font-semibold mt-1 ${statusTextColor}`}>
        {status}
      </div>

      <div className="text-sm text-gray-300 mt-1">{detail}</div>
    </div>
  );
};

