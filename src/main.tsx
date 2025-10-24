import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { ReactPlugin } from '@microsoft/applicationinsights-react-js'

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
    {reactPlugin ? reactPlugin.withAITracking(App, undefined) : <App />}
  </StrictMode>,
)
