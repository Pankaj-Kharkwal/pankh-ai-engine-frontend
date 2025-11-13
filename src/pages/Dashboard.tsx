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
//       <div className="flex relative z-10 justify-between items-start">
//         <div>
//           <p className="text-sm font-medium tracking-wider text-gray-500 uppercase">{name}</p>
//           <p className="mt-2 text-5xl font-extrabold text-gray-900">
//             {value}
//           </p>
//           <p className={`mt-3 text-sm font-semibold ${textColor}`}>
//             {change}
//           </p>
//         </div>
//         <div className={`p-4 rounded-xl shadow-md ${iconBg}`}>
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
//     <Icon className={`flex-shrink-0 mr-5 w-7 h-7 text-${color}-600`} strokeWidth={1.75} />
//     <div className="text-left">
//       <div className="text-lg font-semibold text-gray-900">{title}</div>
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
//       <div className="overflow-hidden relative p-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
//         {/* Subtle Network Tree Background (Conceptual - would need a real image/SVG/animation) */}
//         <div className="absolute inset-0 bg-[url('/path/to/ai-network-tree-bg.svg')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>
//         <div className="relative z-10 space-y-12">
//           <header className="mb-8">
//             <h1 className="text-5xl font-extrabold leading-tight text-gray-900">Dashboard</h1>
//             <p className="mt-3 text-lg text-gray-600">Loading system overview...</p>
//           </header>

//           <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="p-6 bg-white rounded-2xl border border-purple-100 shadow-xl animate-pulse">
//                 <div className="flex justify-between items-start">
//                   <div className="space-y-4">
//                     <div className="w-28 h-5 bg-gray-200 rounded"></div>
//                     <div className="w-24 h-12 bg-gray-200 rounded"></div>
//                     <div className="w-32 h-4 bg-gray-200 rounded"></div>
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
//       <div className="overflow-hidden relative p-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
//         <div className="absolute inset-0 bg-[url('/path/to/ai-network-tree-bg.svg')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>
//         <div className="relative z-10 space-y-12">
//           <header className="mb-8">
//             <h1 className="text-5xl font-extrabold leading-tight text-gray-900">Dashboard</h1>
//             <p className="mt-3 text-lg text-gray-600">
//               Overview of your workflows and system performance
//             </p>
//           </header>
//           <div className="p-8 bg-red-50 rounded-2xl border-2 border-red-300 shadow-xl">
//             <div className="flex items-center space-x-5 text-red-700">
//               <AlertCircle className="flex-shrink-0 w-10 h-10" strokeWidth={2} />
//               <div>
//                 <div className="text-xl font-bold">Failed to load dashboard data</div>
//                 <div className="mt-1 text-base text-red-600">
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
//     <div className="overflow-hidden relative p-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
//       {/* Subtle Network Tree Background (Conceptual) */}
//       {/* Replace `/path/to/ai-network-tree-bg.svg` with your actual image path */}
//       {/* For accessibility, this background is purely decorative and low contrast */}
//       <div className="absolute inset-0 bg-[url('/path/to/ai-network-tree-bg.svg')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>

//       <div className="relative z-10 space-y-12">
//         {/* Header */}
//         <header className="mb-8">
//           <h1 className="text-5xl font-extrabold leading-tight text-gray-900">Dashboard</h1>
//           <p className="mt-3 text-lg text-gray-700">
//             Your centralized hub for workflow automation and AI insights.
//           </p>
//         </header>

//         {/* Stats */}
//         <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
//           {stats.map((stat) => (
//             <StatCard key={stat.name} {...stat} />
//           ))}
//         </div>

//         <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
//           {/* Quick Actions */}
//           <div className="p-7 bg-white rounded-2xl border border-purple-100 shadow-xl lg:col-span-1">
//             <h2 className="mb-7 text-2xl font-bold text-gray-900">Quick Actions</h2>
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
//           <div className="p-7 bg-white rounded-2xl border border-purple-100 shadow-xl lg:col-span-2">
//             <h2 className="mb-7 text-2xl font-bold text-gray-900">
//               Recent Workflows
//             </h2>
//             {Array.isArray(workflows) && workflows.length > 0 ? (
//               <div className="space-y-4">
//                 {workflows.slice(0, 5).map((workflow: any, index: number) => (
//                   <button
//                     key={workflow._id || workflow.id || `workflow-${index}`}
//                     className="flex justify-between items-center p-4 w-full bg-gray-50 rounded-xl transition-colors cursor-pointer hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
//                     onClick={() => navigate(`/workflows/${workflow._id || workflow.id}`)}
//                   >
//                     <div className="flex items-center">
//                       <Zap className="flex-shrink-0 mr-5 w-6 h-6 text-purple-600" strokeWidth={1.5} />
//                       <div className="text-left">
//                         <div className="text-lg font-semibold text-gray-900">
//                           {workflow.name}
//                         </div>
//                         <div className="mt-1 text-sm text-gray-600">
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
//                     className="py-3 mt-6 w-full text-base font-medium text-center text-purple-600 rounded-lg hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
//                   >
//                     View All Workflows ({workflows.length})
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <div className="py-16 text-center text-gray-500 bg-purple-50 rounded-2xl border-2 border-purple-300 border-dashed">
//                 <Zap className="mx-auto mb-5 w-16 h-16 text-purple-400 opacity-60" strokeWidth={1.5} />
//                 <p className="text-xl font-semibold text-gray-800">No workflows found</p>
//                 <p className="mt-2 text-base text-gray-600">
//                   Click **Create New Workflow** to begin your automation journey!
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* System Health */}
//         <div className="p-7 bg-white rounded-2xl border border-purple-100 shadow-xl">
//           <h2 className="mb-7 text-2xl font-bold text-gray-900">
//             System Health Monitor
//           </h2>
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
//     <div className="flex flex-col justify-center items-center p-6 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
//       <div className={`flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full shadow-md ${statusBgColor}`}>
//         <Icon className={`w-8 h-8 ${iconColor}`} strokeWidth={1.75} />
//       </div>
//       <div className="text-xl font-bold text-gray-900">{title}</div>
//       <div className={`mt-2 text-base font-semibold ${statusTextColor}`}>{status}</div>
//       <div className="mt-2 text-sm text-gray-600">{detail}</div>
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
    <div className="relative p-6 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 bg-white/30 border-white/50 hover:border-purple-300/70 group">
      <div className="flex relative z-10 justify-between items-start">
        <div>
          <p className="text-base font-medium tracking-wider text-gray-700 uppercase">{name}</p>
          <p className="mt-1 text-4xl font-extrabold text-gray-900">{value}</p>
          <p className={`mt-3 text-sm font-semibold ${textColor}`}>{change}</p>
        </div>
        <div className={`p-3 rounded-xl border shadow-lg ${iconBg} border-white/70`}>
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
    <Icon className={`flex-shrink-0 mr-4 w-6 h-6 text-${color}-600`} strokeWidth={1.75} />
    <div className="text-left">
      <div className="text-base font-semibold text-gray-900">{title}</div>
      <div className="text-sm text-gray-700">{subtitle}</div>
    </div>
  </button>
)

export default function Dashboard() {
  const navigate = useNavigate()
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
      <div className="overflow-hidden relative p-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-100 to-purple-100">
        <div className="absolute inset-0 bg-[url('/path/to/ai-network-tree-bg.svg')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>
        <div className="relative z-10 space-y-10">
          <header className="mb-6">
            <h1 className="text-4xl font-extrabold leading-tight text-gray-900">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-700">Loading system overview...</p>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border shadow-lg backdrop-blur-sm animate-pulse bg-white/50 border-white/70"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="w-28 h-4 bg-gray-200 rounded"></div>
                    <div className="w-20 h-10 bg-gray-200 rounded"></div>
                    <div className="w-32 h-3 bg-gray-200 rounded"></div>
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
      <div className="overflow-hidden relative p-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-100 to-purple-100">
        <div className="absolute inset-0 bg-[url('/path/to/ai-network-tree-bg.svg')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>
        <div className="relative z-10 space-y-10">
          <header className="mb-6">
            <h1 className="text-4xl font-extrabold leading-tight text-gray-900">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-700">
              Overview of your workflows and system performance
            </p>
          </header>
          <div className="p-6 rounded-2xl border-2 border-red-400 shadow-xl backdrop-blur-sm bg-red-50/70">
            <div className="flex items-center space-x-4 text-red-700">
              <AlertCircle className="flex-shrink-0 w-8 h-8" strokeWidth={2} />
              <div>
                <div className="text-xl font-bold">Failed to load dashboard data</div>
                <div className="mt-1 text-base text-red-600">
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
    <div className="overflow-hidden relative p-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-100 to-purple-100">
      {/* Subtle Network Tree Background (Conceptual) */}
      <div className="absolute inset-0 bg-[url('/path/to/ai-network-tree-bg.svg')] bg-cover bg-center opacity-10 blur-sm pointer-events-none"></div>

      <div className="relative z-10 space-y-10">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-4xl font-extrabold leading-tight text-gray-900">Dashboard</h1>
          <p className="mt-2 text-lg text-gray-700">
            Your centralized hub for workflow automation and AI insights.
          </p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => (
            <StatCard key={stat.name} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="p-6 rounded-2xl border shadow-xl backdrop-blur-md bg-white/30 lg:col-span-1 border-white/50">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick Actions</h2>
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
          <div className="p-6 rounded-2xl border shadow-xl backdrop-blur-md bg-white/30 lg:col-span-2 border-white/50">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Recent Workflows</h2>
            {Array.isArray(workflows) && workflows.length > 0 ? (
              <div className="space-y-3">
                {workflows.slice(0, 5).map((workflow: any, index: number) => (
                  <button
                    key={workflow._id || workflow.id || `workflow-${index}`}
                    className="flex justify-between items-center p-3 w-full rounded-xl transition-colors cursor-pointer bg-white/70 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    onClick={() => navigate(`/workflows/${workflow._id || workflow.id}`)}
                  >
                    <div className="flex items-center">
                      <Zap
                        className="flex-shrink-0 mr-4 w-5 h-5 text-purple-600"
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
                    className="py-2 mt-4 w-full text-base font-medium text-center text-purple-600 rounded-lg hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  >
                    View All Workflows ({workflows.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 rounded-2xl border-2 border-dashed border-purple-400/70 bg-white/50">
                <Zap className="mx-auto mb-4 w-14 h-14 text-purple-500/70" strokeWidth={1.5} />
                <p className="text-lg font-semibold text-gray-800">No workflows found</p>
                <p className="mt-1 text-base text-gray-700">
                  Click **Create New Workflow** to begin your automation journey!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="p-6 rounded-2xl border shadow-xl backdrop-blur-md bg-white/30 border-white/50">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">System Health Monitor</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                  ? `${(registryStats as any).enabled_blocks} of ${(registryStats as any).total_blocks} blocks available`
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
    <div className="flex flex-col justify-center items-center p-5 text-center rounded-2xl border shadow-md backdrop-blur-sm border-white/70 bg-white/50">
      <div
        className={`flex justify-center items-center mx-auto mb-3 w-14 h-14 rounded-full border shadow-lg ${statusBgColor} border-white/80`}
      >
        <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={1.75} />
      </div>
      <div className="text-lg font-bold text-gray-900">{title}</div>
      <div className={`mt-1 text-base font-semibold ${statusTextColor}`}>{status}</div>
      <div className="mt-1 text-sm text-gray-700">{detail}</div>
    </div>
  )
}
