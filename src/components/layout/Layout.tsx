import { NavLink, Outlet, useLocation } from 'react-router-dom'
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
  MessageSquare,
  Zap,
  ChevronRight,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Navigation items
const primaryNavigation = [
  { name: 'Dashboard', href: '/', end: true, icon: LayoutDashboard },
  { name: 'Workflow Builder', href: '/workflows/create', icon: GitBranch },
  { name: 'Workflows', href: '/workflows', end: true, icon: Play },
  { name: 'BYOChatbot', href: '/chatbot', icon: MessageSquare },
  { name: 'Blocks', href: '/blocks', icon: Blocks },
]

const secondaryNavigation = [
  { name: 'Marketplace', href: '/marketplace', icon: Store },
  { name: 'Debug Console', href: '/debug', icon: Bug },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Workflow Manager', href: '/workflow-manager', icon: Zap },
  { name: 'Admin', href: '/admin', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

// Navigation Menu Component
function NavMenu({
  items,
  label,
}: {
  items: typeof primaryNavigation
  label?: string
}) {
  const location = useLocation()

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => {
            const isActive = item.end
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href)

            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                  className={cn(
                    'transition-all duration-200',
                    isActive &&
                      'bg-primary/10 text-primary border-l-2 border-primary glow-effect'
                  )}
                >
                  <NavLink to={item.href} end={item.end}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

// Status Indicator Component
function StatusIndicator() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg p-2 bg-green-500/10 border border-green-500/20',
        isCollapsed && 'justify-center'
      )}
    >
      <div className="relative">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-500 animate-ping" />
      </div>
      {!isCollapsed && (
        <span className="text-xs font-medium text-green-500">API Connected</span>
      )}
    </div>
  )
}

// Main App Sidebar
function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50">
        <div
          className={cn(
            'flex items-center gap-3 px-2 py-2',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 neon-border">
            <img src="/logo.png" alt="Logo" className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold gradient-text">PankhAI</span>
              <span className="text-xs text-muted-foreground">
                Workflow Engine
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <NavMenu items={primaryNavigation} label="Main" />
        <Separator className="my-2 bg-border/50" />
        <NavMenu items={secondaryNavigation} label="Administration" />
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-3">
        <StatusIndicator />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

// Header Component
function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1" />
      <div className="flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1">
        <div className="relative">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-500 animate-ping" />
        </div>
        <span className="text-xs font-medium text-green-500 hidden sm:inline">
          API Connected
        </span>
      </div>
    </header>
  )
}

// Main Layout Export
export default function Layout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
