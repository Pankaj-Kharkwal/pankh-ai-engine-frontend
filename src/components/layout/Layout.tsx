import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  Store,
  Blocks,
  Play,
  Bug,
  Settings,
  Users,
  BarChart3,
  Activity,
  MessageSquare,
  Menu,
  X,
  Zap, // Added Zap for a dynamic look
} from "lucide-react";

// Separating primary and secondary navigation for better visual grouping
const primaryNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Workflow Builder", href: "/workflows/create", icon: GitBranch },
  { name: "Workflows", href: "/workflows", icon: Play },
{ name: "BYOChatbot", href: "/chatbot", icon: MessageSquare },
  { name: "Blocks", href: "/blocks", icon: Blocks },
];

const secondaryNavigation = [
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "Executions", href: "/executions", icon: Activity },
  { name: "Debug Console", href: "/debug", icon: Bug },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Admin", href: "/admin", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Combine manual toggle and hover for desktop sidebar width
  const isSidebarExpanded = sidebarOpen || isHovering;

  // --- HOVER LOGIC for DESKTOP (lg and up) ---
  // Check if we are on a large screen to enable hover
  const isLargeScreen = typeof window !== 'undefined' && window.innerWidth >= 1024; // lg: 1024px

  const handleMouseEnter = () => {
    if (isLargeScreen) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (isLargeScreen) setIsHovering(false);
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const hamburger = document.getElementById("hamburger-button");
      if (
        sidebar &&
        hamburger &&
        !sidebar.contains(event.target as Node) &&
        !hamburger.contains(event.target as Node) &&
        sidebarOpen // Only run logic if sidebar is open
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // Keyboard shortcut for sidebar toggle (Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "b") {
        event.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []); // Empty dependency array, state update is functional

  return (
    <div className="min-h-screen bg-gray-50"> 
      {/* Top Navbar - Enhanced */}
      <nav className="bg-white/95 backdrop-blur-md border-b-2 border-transparent border-t-2 border-t-indigo-500/50 shadow-lg fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Hamburger Button */}
              <button
                id="hamburger-button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-300 ease-in-out lg:hidden" // Hide on lg+
                title={
                  sidebarOpen
                    ? "Close sidebar"
                    : "Open sidebar"
                }
              >
                <div className="relative w-6 h-6">
                  <Menu
                    className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                      sidebarOpen
                        ? "opacity-0 rotate-180 scale-75"
                        : "opacity-100 rotate-0 scale-100"
                    }`}
                  />
                  <X
                    className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                      sidebarOpen
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 -rotate-180 scale-75"
                    }`}
                  />
                </div>
              </button>
              
              {/* Logo - Adjusted for header */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12  shadow-md"> 
                 <img src = '/logo.png' /> {/* Changed icon to Zap for a sharper look */}
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
                    PankhAI
                  </h1>
                  <span className="text-xs text-indigo-500 hidden sm:block font-medium">
                    Workflow Engine
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Status and actions */}
            <div className="flex items-center space-x-4">
              {/* Status Indicator - Enhanced */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-300 rounded-full shadow-sm">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping-slow"></div>
                <span className="text-xs font-semibold text-green-700 hidden sm:block">
                  API Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar - Desktop (lg+) */}
      <div
        id="sidebar"
        className={`fixed top-16 left-0 z-40 bg-white border-r border-gray-200 shadow-xl transform transition-all duration-300 ease-in-out ${
          isSidebarExpanded
            ? "w-64 h-[calc(100vh-4rem)] translate-x-0 overflow-y-auto"
            : "w-20 h-[calc(100vh-4rem)] translate-x-0 overflow-hidden" // Changed width to w-20 for better small icons
        } hidden lg:block`}
        onMouseEnter={handleMouseEnter} // Hover logic
        onMouseLeave={handleMouseLeave} // Hover logic
      >
        <div className="flex flex-col h-full">

          {/* Navigation */}
          <nav
            className={`flex-1 transition-all duration-300 p-3 space-y-1.5 ${isSidebarExpanded ? 'overflow-y-auto' : 'overflow-visible'}`}
          >
            {/* Primary Links */}
            <div className="space-y-1.5">
              {primaryNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/"} // Only end on the root path for dashboard
                  title={!isSidebarExpanded ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl transition-all duration-200 group ${
                      isSidebarExpanded
                        ? `px-4 py-3 text-sm font-semibold ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700 shadow-sm"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          }`
                        : `justify-center p-3.5 ${ // Increased padding for better hover target
                            isActive
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          }`
                    }`
                  }
                >
                  <item.icon
                    className={`${
                      isSidebarExpanded ? "w-5 h-5 mr-3" : "w-6 h-6"
                    } transition-all duration-200`}
                  />
                  {isSidebarExpanded && (
                    <span className="transition-opacity duration-200">{item.name}</span>
                  )}
                  {!isSidebarExpanded && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100] whitespace-nowrap shadow-lg">
                      {item.name}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-800 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>

            {isSidebarExpanded && (
              <div className="text-xs font-semibold text-gray-500 uppercase px-4 pt-4 pb-2 mt-4 border-t border-gray-200">
                Administration
              </div>
            )}

            {/* Secondary Links */}
            <div className="space-y-1.5">
              {secondaryNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/workflows"}
                  title={!isSidebarExpanded ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl transition-all duration-200 group ${
                      isSidebarExpanded
                        ? `px-4 py-3 text-sm font-semibold ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700 shadow-sm"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          }`
                        : `justify-center p-3.5 ${
                            isActive
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          }`
                    }`
                  }
                >
                  <item.icon
                    className={`${
                      isSidebarExpanded ? "w-5 h-5 mr-3" : "w-6 h-6"
                    } transition-all duration-200`}
                  />
                  {isSidebarExpanded && (
                    <span className="transition-opacity duration-200">{item.name}</span>
                  )}
                  {!isSidebarExpanded && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100] whitespace-nowrap shadow-lg">
                      {item.name}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-800 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Status indicator (Moved to bottom of sidebar) - Enhanced */}
          <div className={`border-t border-gray-200 p-3 transition-all duration-300`}>
            <div className={`flex items-center ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`}>
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse" title="API Status"></div>
              {isSidebarExpanded && (
                <span className="text-sm font-medium text-gray-700">API Connected</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar (No change in logic, just consistent styling) */}
      <div
        className={`fixed top-16 left-0 z-50 bg-white w-64 h-[calc(100vh-4rem)] transform transition-transform duration-300 ease-in-out lg:hidden border-r border-gray-200 shadow-2xl overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Logo (Keep it for context) */}
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-800">🧬 PankhAI</h1>
            <p className="text-sm text-gray-600 mt-1">Workflow Engine</p>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            <div className="space-y-1.5">
              {primaryNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
            
            <div className="text-xs font-semibold text-gray-500 uppercase px-4 pt-4 pb-2 mt-4 border-t border-gray-200">
              Administration
            </div>

            <div className="space-y-1.5">
              {secondaryNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/workflows"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Mobile Status */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              API Connected
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content padding adjustment */}
      <div className="pt-16 min-h-screen">
        <main
          className={`transition-all duration-300 ease-in-out p-4 sm:p-6 lg:p-8 ${
            isSidebarExpanded ? 'lg:pl-72' : 'lg:pl-28' // Adjusted padding for w-20 sidebar
          }`}
        >
          <div className="mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}