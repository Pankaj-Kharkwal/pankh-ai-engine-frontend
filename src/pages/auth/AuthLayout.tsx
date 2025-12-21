import React from 'react'
import { Zap } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, description }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,hsl(var(--accent)/0.1),transparent_50%)]" />

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center neon-border">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">PankhAI</h1>
              <p className="text-sm text-muted-foreground">Workflow Engine</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Build intelligent workflows with{' '}
            <span className="gradient-text">AI-powered</span> automation
          </h2>

          <p className="text-lg text-muted-foreground mb-8">
            Create, deploy, and manage complex automation workflows using our visual
            builder and AI-assisted tools.
          </p>

          <div className="space-y-4">
            <Feature
              title="Visual Workflow Builder"
              description="Drag and drop nodes to create complex automations"
            />
            <Feature
              title="AI Block Generation"
              description="Generate custom blocks using natural language"
            />
            <Feature
              title="Real-time Execution"
              description="Monitor your workflows as they run"
            />
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center neon-border">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold gradient-text">PankhAI</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <div className="h-2 w-2 rounded-full bg-primary" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export default AuthLayout
