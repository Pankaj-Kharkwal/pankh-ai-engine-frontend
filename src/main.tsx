import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { ReactPlugin } from '@microsoft/applicationinsights-react-js'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { Toaster } from '@/components/ui/sonner'
import LoginPage from './pages/auth/LoginPage.tsx'
import SignupPage from './pages/auth/SignupPage.tsx'
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage.tsx'

// Initialize Application Insights only if connection string is provided
let reactPlugin: ReactPlugin | undefined
let appInsights: ApplicationInsights | undefined

const connectionString = import.meta.env.VITE_APPINSIGHTS_CONN_STRING
if (connectionString) {
  reactPlugin = new ReactPlugin()
  appInsights = new ApplicationInsights({
    config: {
      connectionString,
      extensions: [reactPlugin],
      extensionConfig: {
        [reactPlugin.identifier]: {},
      },
    },
  })
  appInsights.loadAppInsights()
  appInsights.addTelemetryInitializer(envelope => {
    envelope.tags['ai.cloud.role'] = 'webui'
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          <Route
            path="/*"
            element={reactPlugin ? reactPlugin.withAITracking(App, undefined) : <App />}
          />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </AuthProvider>
  </StrictMode>
)
