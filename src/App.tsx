import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import WorkflowBuilder from './pages/WorkflowBuilder'
import Workflows from './pages/Workflows'
import Marketplace from './pages/Marketplace'
import BYOChatbot from './pages/BYOChatbot'
import WorkflowDemo from './pages/WorkflowDemo'
import Blocks from './pages/Blocks'
import BlockTestLab from './pages/BlockTestLab'
import Executions from './pages/Executions'
import Debug from './pages/Debug'
import Analytics from './pages/Analytics'
import WorkflowManager from './pages/WorkflowManager'
import Admin from './pages/Admin'
import Settings from './pages/Settings'
import WorkflowBuilderRedesignPage from './pages/WorkflowBuilderRedesignPage'
import { useAuth } from './contexts/AuthContext'
import DashboardRedesign from './pages/DashboardRedesign'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      onError: error => {
        console.error('Query error:', error)
      },
    },
    mutations: {
      retry: 1,
      onError: error => {
        console.error('Mutation error:', error)
      },
    },
  },
})

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  return <>{children}</>
}

function App() {
  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Full-page workflow redesign route (outside Layout) */}
          {/* <Route
            path="/workflows/redesign"
            element={
              <ProtectedRoute>
                <WorkflowBuilderRedesignPage />
              </ProtectedRoute>
            }
          /> */}
            <Route path="workflows/create" element={<ProtectedRoute>
                <WorkflowBuilderRedesignPage />
              </ProtectedRoute> }/>
            <Route path="workflows/:id" element={<ProtectedRoute>
                <WorkflowBuilderRedesignPage />
              </ProtectedRoute>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardRedesign />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="workflows/old" element={<WorkflowBuilder />} />
            <Route path="workflows/demo" element={<WorkflowDemo />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="chatbot" element={<BYOChatbot />} />
            <Route path="blocks" element={<Blocks />} />
            <Route path="blocks/test-lab" element={<BlockTestLab />} />
            <Route path="executions" element={<Executions />} />
            <Route path="debug" element={<Debug />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="workflow-manager" element={<WorkflowManager />} />
            <Route path="admin" element={<Admin />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
