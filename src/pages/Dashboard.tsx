// import { BarChart3, Zap, Clock, CheckCircle, AlertCircle, PlusCircle, LayoutGrid, Settings, ListChecks } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useWorkflows, useRegistryStats, useHealth } from "../hooks/useApi";
// import AIAssistant from "../components/ai/AIAssistant"; // Assuming this component exists

// // --- ACCESSIBLE COLOR PALETTE ---
// // Using a palette that ensures good contrast.
// // Main: text-gray-900, text-gray-700, text-gray-500
// // Accent: purple-600, purple-500, purple-400 (for borders, icons)
// // Success: green-600, green-500
// // Danger: red-600, red-500
// // Backgrounds: white, gray-50, gray-100, purple-50 (for light accents)

// // Helper component for Stat Cards
// const StatCard = ({ name, value, icon: Icon, change, changeType }: any) => {
//   const isHealthy = changeType === "positive";
//   const textColor = isHealthy ? "text-green-500" : "text-red-500";
//   const iconBg = isHealthy ? "bg-purple-100" : "bg-red-100";
//   const iconColor = isHealthy ? "text-purple-600" : "text-red-600";

//   return (
//     <div className="relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-100 group overflow-hidden
//                     after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-br after:from-purple-50 after:to-transparent after:opacity-0 group-hover:after:opacity-100 after:transition-opacity after:duration-300">
//       <div className="flex items-start justify-between relative z-10">
//         <div>
//           <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{name}</p>
//           <p className="text-5xl font-extrabold text-gray-900 mt-2">
//             {value}
//           </p>
//           <p className={`text-sm mt-3 font-semibold ${textColor}`}>
//             {change}
//           </p>
//         </div>
//         <div className={`p-4 ${iconBg} rounded-xl shadow-md`}>
//           <Icon className={`w-8 h-8 ${iconColor}`} strokeWidth={1.75} />
//         </div>
//       </div>
//     </div>
//   );
// };

// // Helper component for Quick Action Buttons
// const QuickActionButton = ({ icon: Icon, title, subtitle, color, onClick }: any) => (
//   <button
//     onClick={onClick}
//     className={`w-full relative flex items-center p-5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-${color}-300 focus:ring-opacity-70
//                 bg-${color}-50 border border-${color}-200 hover:bg-${color}-100`}
//   >
//     <Icon className={`w-7 h-7 text-${color}-600 mr-5 flex-shrink-0`} strokeWidth={1.75} />
//     <div className="text-left">
//       <div className="font-semibold text-lg text-gray-900">{title}</div>
//       <div className="text-sm text-gray-700">{subtitle}</div>
//     </div>
//   </button>
// );

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const {
//     data: workflows,
//     isLoading: workflowsLoading,
//     error: workflowsError,
//   } = useWorkflows();
//   const { data: registryStats, isLoading: statsLoading } = useRegistryStats();
//   const { data: health, isLoading: healthLoading } = useHealth();

//   // Calculate stats from real data
//   const totalWorkflows = Array.isArray(workflows) ? workflows.length : 0;
//   const activeWorkflows = Array.isArray(workflows)
//     ? workflows.filter((w: any) => w.status === "active").length
//     : 0;

//   // --- Loading State Improvement ---
//   if (workflowsLoading || statsLoading || healthLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-8 relative overflow-hidden">
//         {/* Subtle Network Tree Background (Conceptual - would need a real image/SVG/animation) */}
//         <div className="absolute inset-0 bg-[url('/path/to/ai-network-tree-bg.svg')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>
//         <div className="space-y-12 relative z-10">
//           <header className="mb-8">
//             <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">Dashboard</h1>
//             <p className="text-lg text-gray-600 mt-3">Loading system overview...</p>
//           </header>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="bg-white rounded-2xl p-6 shadow-xl animate-pulse border border-purple-100">
//                 <div className="flex items-start justify-between">
//                   <div className="space-y-4">
//                     <div className="h-5 bg-gray-200 rounded w-28"></div>
//                     <div className="h-12 bg-gray-200 rounded w-24"></div>
//                     <div className="h-4 bg-gray-200 rounded w-32"></div>
//                   </div>
//                   <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // --- Error State Improvement ---
//   if (workflowsError) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-8 relative overflow-hidden">
//         <div className="absolute inset-0 bg-[url('/path/to/ai-network-tree-bg.svg')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>
//         <div className="space-y-12 relative z-10">
//           <header className="mb-8">
//             <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">Dashboard</h1>
//             <p className="text-lg text-gray-600 mt-3">
//               Overview of your workflows and system performance
//             </p>
//           </header>
//           <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 shadow-xl">
//             <div className="flex items-center space-x-5 text-red-700">
//               <AlertCircle className="w-10 h-10 flex-shrink-0" strokeWidth={2} />
//               <div>
//                 <div className="font-bold text-xl">Failed to load dashboard data</div>
//                 <div className="text-base text-red-600 mt-1">
//                   Please check your API connection and refresh the page.
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const stats = [
//     {
//       name: "Total Workflows",
//       value: totalWorkflows.toString(),
//       icon: Zap,
//       change: totalWorkflows > 0 ? "Connected to API" : "No workflows found",
//       changeType: "positive",
//     },
//     {
//       name: "Active Workflows",
//       value: activeWorkflows.toString(),
//       icon: BarChart3,
//       change: `${(totalWorkflows > 0 ? (activeWorkflows / totalWorkflows) * 100 : 0).toFixed(0)}% Active`,
//       changeType: "positive",
//     },
//     {
//       name: "Block Registry",
//       value: (registryStats as any)?.total_blocks?.toString() || "0",
//       icon: LayoutGrid,
//       change: `${(registryStats as any)?.enabled_blocks || 0} enabled blocks`,
//       changeType: "positive",
//     },
//     {
//       name: "API Status",
//       value: health ? "Online" : "Offline",
//       icon: Clock,
//       change: health ? "System healthy" : "Connection error",
//       changeType: health ? "positive" : "negative",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-8 relative overflow-hidden">
//       {/* Subtle Network Tree Background (Conceptual) */}
//       {/* Replace `/path/to/ai-network-tree-bg.svg` with your actual image path */}
//       {/* For accessibility, this background is purely decorative and low contrast */}
//       <div className="absolute inset-0 bg-[url('/path/to/ai-network-tree-bg.svg')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>

//       <div className="space-y-12 relative z-10">
//         {/* Header */}
//         <header className="mb-8">
//           <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">Dashboard</h1>
//           <p className="text-lg text-gray-700 mt-3">
//             Your centralized hub for workflow automation and AI insights.
//           </p>
//         </header>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//           {stats.map((stat) => (
//             <StatCard key={stat.name} {...stat} />
//           ))}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Quick Actions */}
//           <div className="bg-white rounded-2xl p-7 shadow-xl lg:col-span-1 border border-purple-100">
//             <h2 className="text-2xl font-bold mb-7 text-gray-900">Quick Actions</h2>
//             <div className="space-y-4">
//               <QuickActionButton
//                 title="Create New Workflow"
//                 subtitle="Start building a new automation with AI"
//                 icon={PlusCircle}
//                 color="purple"
//                 onClick={() => navigate("/workflows/create")}
//               />
//               <QuickActionButton
//                 title="View All Workflows"
//                 subtitle="Manage, edit, and monitor your existing flows"
//                 icon={ListChecks}
//                 color="indigo"
//                 onClick={() => navigate("/workflows")}
//               />
//               <QuickActionButton
//                 title="Browse AI Blocks"
//                 subtitle="Explore powerful AI-driven building blocks"
//                 icon={LayoutGrid}
//                 color="blue"
//                 onClick={() => navigate("/blocks")}
//               />
//               <QuickActionButton
//                 title="Monitor Executions"
//                 subtitle="Review recent workflow runs and logs"
//                 icon={Clock}
//                 color="green"
//                 onClick={() => navigate("/executions")}
//               />
//             </div>
//           </div>

//           {/* Recent Workflows */}
//           <div className="bg-white rounded-2xl p-7 shadow-xl lg:col-span-2 border border-purple-100">
//             <h2 className="text-2xl font-bold mb-7 text-gray-900">
//               Recent Workflows
//             </h2>
//             {Array.isArray(workflows) && workflows.length > 0 ? (
//               <div className="space-y-4">
//                 {workflows.slice(0, 5).map((workflow: any, index: number) => (
//                   <button
//                     key={workflow._id || workflow.id || `workflow-${index}`}
//                     className="flex w-full items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-300"
//                     onClick={() => navigate(`/workflows/${workflow._id || workflow.id}`)}
//                   >
//                     <div className="flex items-center">
//                       <Zap className="w-6 h-6 text-purple-600 mr-5 flex-shrink-0" strokeWidth={1.5} />
//                       <div className="text-left">
//                         <div className="text-lg font-semibold text-gray-900">
//                           {workflow.name}
//                         </div>
//                         <div className="text-sm text-gray-600 mt-1">
//                           Created:{" "}
//                           {workflow.created_at
//                             ? new Date(workflow.created_at).toLocaleDateString()
//                             : "Unknown date"}
//                         </div>
//                       </div>
//                     </div>
//                     <span className={`text-sm px-4 py-2 font-medium rounded-full
//                                     ${workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
//                       {workflow.status || 'draft'}
//                     </span>
//                   </button>
//                 ))}
//                 {workflows.length > 5 && (
//                   <button
//                     onClick={() => navigate("/workflows")}
//                     className="w-full text-center text-purple-600 hover:text-purple-700 mt-6 font-medium text-base py-3 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded-lg"
//                   >
//                     View All Workflows ({workflows.length})
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <div className="text-center text-gray-500 py-16 border-2 border-dashed border-purple-300 rounded-2xl bg-purple-50">
//                 <Zap className="w-16 h-16 mx-auto mb-5 text-purple-400 opacity-60" strokeWidth={1.5} />
//                 <p className="text-xl font-semibold text-gray-800">No workflows found</p>
//                 <p className="text-base mt-2 text-gray-600">
//                   Click **Create New Workflow** to begin your automation journey!
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* System Health */}
//         <div className="bg-white rounded-2xl p-7 shadow-xl border border-purple-100">
//           <h2 className="text-2xl font-bold mb-7 text-gray-900">
//             System Health Monitor
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <HealthPillar
//               title="API Gateway"
//               status={health ? "Operational" : "Offline"}
//               detail={health ? "All core services active" : "Connection failed"}
//               isHealthy={!!health}
//               Icon={Settings}
//             />
//             <HealthPillar
//               title="Block Registry"
//               status="Online"
//               detail={registryStats
//                 ? `${(registryStats as any).enabled_blocks} of ${(registryStats as any).total_blocks} blocks available`
//                 : "Loading..."}
//               isHealthy={!!registryStats}
//               Icon={LayoutGrid}
//             />
//             <HealthPillar
//               title="Workflow Engine"
//               status="Running"
//               detail="Processing jobs normally"
//               isHealthy={true}
//               Icon={Clock}
//             />
//           </div>
//         </div>

//         {/* AI Assistant */}
//         <AIAssistant
//           context={`Dashboard overview: ${totalWorkflows} workflows, ${activeWorkflows} active. ${(registryStats as any)?.enabled_blocks || 0} blocks enabled. API Health: ${health ? 'Online' : 'Offline'}`}
//           contextType="general"
//           suggestions={[
//             "Create a new AI-powered workflow",
//             "How do I integrate a custom block?",
//             "Show me top performing workflows",
//             "What's new in the block registry?",
//             "Explain system health metrics"
//           ]}
//         />
//       </div>
//     </div>
//   );
// }

// // Custom Health Pillar component
// const HealthPillar = ({ title, status, detail, isHealthy, Icon }: any) => {
//   const statusBgColor = isHealthy ? "bg-green-50" : "bg-red-50";
//   const statusTextColor = isHealthy ? "text-green-700" : "text-red-700";
//   const iconColor = isHealthy ? "text-green-600" : "text-red-600";

//   return (
//     <div className="text-center p-6 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center">
//       <div className={`w-16 h-16 mx-auto mb-4 ${statusBgColor} rounded-full flex items-center justify-center shadow-md`}>
//         <Icon className={`w-8 h-8 ${iconColor}`} strokeWidth={1.75} />
//       </div>
//       <div className="font-bold text-xl text-gray-900">{title}</div>
//       <div className={`text-base font-semibold mt-2 ${statusTextColor}`}>{status}</div>
//       <div className="text-sm text-gray-600 mt-2">{detail}</div>
//     </div>
//   );
// };

// glass effect
import {
  BarChart3,
  Zap,
  Clock,
  CheckCircle,
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
  const textColor = isHealthy ? 'text-green-600' : 'text-red-600'
  const iconBg = isHealthy ? 'bg-purple-200/50 backdrop-blur-sm' : 'bg-red-200/50 backdrop-blur-sm'
  const iconColor = isHealthy ? 'text-purple-700' : 'text-red-700'

  return (
    <div className="relative bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl transition-all duration-300 border border-white/50 hover:border-purple-300/70 group">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-base font-medium text-gray-700 uppercase tracking-wider">{name}</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-3 font-semibold ${textColor}`}>{change}</p>
        </div>
        <div className={`p-3 ${iconBg} rounded-xl shadow-lg border border-white/70`}>
          <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

// Helper component for Quick Action Buttons
const QuickActionButton = ({ icon: Icon, title, subtitle, color, onClick }: any) => (
  <button
    onClick={onClick}
    // Subtle glass effect for buttons
    className={`w-full relative flex items-center p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-${color}-400/50
                bg-white/40 border border-white/70 hover:bg-white/60 backdrop-blur-sm shadow-md`}
  >
    <Icon className={`w-6 h-6 text-${color}-600 mr-4 flex-shrink-0`} strokeWidth={1.75} />
    <div className="text-left">
      <div className="font-semibold text-base text-gray-900">{title}</div>
      <div className="text-sm text-gray-700">{subtitle}</div>
    </div>
  </button>
)

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: workflows, isLoading: workflowsLoading, error: workflowsError } = useWorkflows()
  const { data: registryStats, isLoading: statsLoading } = useRegistryStats()
  const { data: health, isLoading: healthLoading } = useHealth()

  // Calculate stats from real data
  const totalWorkflows = Array.isArray(workflows) ? workflows.length : 0
  const activeWorkflows = Array.isArray(workflows)
    ? workflows.filter((w: any) => w.status === 'active').length
    : 0

  // --- Loading State Improvement ---
  if (workflowsLoading || statsLoading || healthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-100 to-purple-100 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path/to/ai-network-tree-bg.svg')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>
        <div className="space-y-10 relative z-10">
          <header className="mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">Dashboard</h1>
            <p className="text-lg text-gray-700 mt-2">Loading system overview...</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg animate-pulse border border-white/70"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --- Error State Improvement ---
  if (workflowsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-100 to-purple-100 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path/to/ai-network-tree-bg.svg')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>
        <div className="space-y-10 relative z-10">
          <header className="mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">Dashboard</h1>
            <p className="text-lg text-gray-700 mt-2">
              Overview of your workflows and system performance
            </p>
          </header>
          <div className="bg-red-50/70 backdrop-blur-sm border-2 border-red-400 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-4 text-red-700">
              <AlertCircle className="w-8 h-8 flex-shrink-0" strokeWidth={2} />
              <div>
                <div className="font-bold text-xl">Failed to load dashboard data</div>
                <div className="text-base text-red-600 mt-1">
                  Please check your API connection and refresh the page.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Workflows',
      value: totalWorkflows.toString(),
      icon: Zap,
      change: totalWorkflows > 0 ? 'Connected to API' : 'No workflows found',
      changeType: 'positive',
    },
    {
      name: 'Active Workflows',
      value: activeWorkflows.toString(),
      icon: BarChart3,
      change: `${(totalWorkflows > 0 ? (activeWorkflows / totalWorkflows) * 100 : 0).toFixed(0)}% Active`,
      changeType: 'positive',
    },
    {
      name: 'Block Registry',
      value: (registryStats as any)?.total_blocks?.toString() || '0',
      icon: LayoutGrid,
      change: `${(registryStats as any)?.enabled_blocks || 0} blocks available`,
      changeType: 'positive',
    },
    {
      name: 'API Status',
      value: health ? 'Online' : 'Offline',
      icon: Clock,
      change: health ? 'System healthy' : 'Connection error',
      changeType: health ? 'positive' : 'negative',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-100 to-purple-100 p-8 relative overflow-hidden">
      {/* Subtle Network Tree Background (Conceptual) */}
      <div className="absolute inset-0 bg-[url('/path/to/ai-network-tree-bg.svg')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>

      <div className="space-y-10 relative z-10">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">Dashboard</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
            Your centralized hub for workflow automation and AI insights.
          </p>
        </header>

        {/* Welcome Banner */}
        <WelcomeBanner userName={user?.full_name} workflowCount={totalWorkflows} />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(stat => (
            <StatCard key={stat.name} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl lg:col-span-1 border border-white/50">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Quick Actions</h2>
            <div className="space-y-4">
              <QuickActionButton
                title="Create New Workflow"
                subtitle="Start building a new automation with AI"
                icon={PlusCircle}
                color="purple"
                onClick={() => navigate('/workflows/create')}
              />
              <QuickActionButton
                title="View All Workflows"
                subtitle="Manage, edit, and monitor your existing flows"
                icon={ListChecks}
                color="indigo"
                onClick={() => navigate('/workflows')}
              />
              <QuickActionButton
                title="Browse AI Blocks"
                subtitle="Explore powerful AI-driven building blocks"
                icon={LayoutGrid}
                color="blue"
                onClick={() => navigate('/blocks')}
              />
              <QuickActionButton
                title="Monitor Executions"
                subtitle="Review recent workflow runs and logs"
                icon={Clock}
                color="green"
                onClick={() => navigate('/executions')}
              />
            </div>
          </div>

          {/* Recent Workflows */}
          <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl lg:col-span-2 border border-white/50">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Recent Workflows</h2>
            {Array.isArray(workflows) && workflows.length > 0 ? (
              <div className="space-y-3">
                {workflows.slice(0, 5).map((workflow: any, index: number) => (
                  <button
                    key={workflow._id || workflow.id || `workflow-${index}`}
                    className="flex w-full items-center justify-between p-3 bg-white/70 rounded-xl hover:bg-white/90 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    onClick={() => navigate(`/workflows/${workflow._id || workflow.id}`)}
                  >
                    <div className="flex items-center">
                      <Zap
                        className="w-5 h-5 text-purple-600 mr-4 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                      <div className="text-left">
                        <div className="text-base font-semibold text-gray-900">{workflow.name}</div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          Created:{' '}
                          {workflow.created_at
                            ? new Date(workflow.created_at).toLocaleDateString()
                            : 'Unknown date'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 font-medium rounded-full
                                    ${workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {workflow.status || 'draft'}
                    </span>
                  </button>
                ))}
                {workflows.length > 5 && (
                  <button
                    onClick={() => navigate('/workflows')}
                    className="w-full text-center text-purple-600 hover:text-purple-700 mt-4 font-medium text-base py-2 focus:outline-none focus:ring-2 focus:ring-purple-400/50 rounded-lg"
                  >
                    View All Workflows ({workflows.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12 border-2 border-dashed border-purple-400/70 rounded-2xl bg-white/50">
                <Zap className="w-14 h-14 mx-auto mb-4 text-purple-500/70" strokeWidth={1.5} />
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-900">Ready to create your first workflow?</p>
                <p className="text-base mt-1 text-gray-700 dark:text-gray-800 mb-4">
                  Use the <strong>Create New Workflow</strong> button to start building!
                </p>
                <button
                  onClick={() => navigate('/workflows/create')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PlusCircle className="w-5 h-5" />
                  Create Your First Workflow
                </button>
              </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">System Health Monitor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HealthPillar
              title="API Gateway"
              status={health ? 'Operational' : 'Offline'}
              detail={health ? 'All core services active' : 'Connection failed'}
              isHealthy={!!health}
              Icon={Settings}
            />
            <HealthPillar
              title="Block Registry"
              status="Online"
              detail={
                registryStats
                  ? `${(registryStats as any).enabled_blocks || 0} of ${(registryStats as any).total_blocks || 0} blocks available`
                  : 'Loading...'
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

// Custom Health Pillar component
const HealthPillar = ({ title, status, detail, isHealthy, Icon }: any) => {
  const statusBgColor = isHealthy
    ? 'bg-green-200/50 backdrop-blur-sm'
    : 'bg-red-200/50 backdrop-blur-sm'
  const statusTextColor = isHealthy ? 'text-green-700' : 'text-red-700'
  const iconColor = isHealthy ? 'text-green-600' : 'text-red-600'

  return (
    <div className="text-center p-5 border border-white/70 rounded-2xl bg-white/50 backdrop-blur-sm shadow-md flex flex-col items-center justify-center">
      <div
        className={`w-14 h-14 mx-auto mb-3 ${statusBgColor} rounded-full flex items-center justify-center shadow-lg border border-white/80`}
      >
        <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={1.75} />
      </div>
      <div className="font-bold text-lg text-gray-900">{title}</div>
      <div className={`text-base font-semibold mt-1 ${statusTextColor}`}>{status}</div>
      <div className="text-sm text-gray-700 mt-1">{detail}</div>
    </div>
  )
}
