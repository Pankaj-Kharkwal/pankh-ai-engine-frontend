import { useState } from 'react'
import { Plus, Zap, AlertCircle, Loader2, Search, Sparkles, RefreshCw } from 'lucide-react'
import AIAssistantEnhanced from '../ai/AIAssistantEnhanced'

// shadcn components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface NoBlocksFoundPanelProps {
  hasError: boolean
  errorMessage?: string
  onRetry: () => void
  onGenerateBlock: (description: string, autoDeploy?: boolean) => Promise<any>
  isGeneratingBlock: boolean
  onGenerationStart?: () => void
  onStageChange?: (stage: string) => void
  organizationId?: string
}

export default function NoBlocksFoundPanel({
  hasError,
  errorMessage,
  onRetry,
  onGenerateBlock,
  isGeneratingBlock,
  onGenerationStart,
  onStageChange,
  organizationId,
}: NoBlocksFoundPanelProps) {
  const [generateDescription, setGenerateDescription] = useState('')

  const handleGenerateClick = async () => {
    if (!generateDescription.trim()) return
    await onGenerateBlock(generateDescription, true)
    setGenerateDescription('')
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      {hasError ? (
        <Card className="max-w-lg border-red-500/30 bg-red-500/5">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-400">Failed to Load Registry</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {errorMessage ||
                    'Could not connect to the block API. Please ensure the backend service is running and accessible.'}
                </p>
                <Button
                  onClick={onRetry}
                  variant="destructive"
                  className="mt-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full max-w-3xl space-y-8">
          {/* Empty State Header */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-3xl font-bold mb-3">
              <span className="gradient-text">No Blocks Found Yet!</span>
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              It looks like you haven't created any blocks, or the registry is empty.
              Let our AI assistant help you generate your first custom block!
            </p>
          </div>

          {/* AI Block Generator Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <div className="p-2 rounded-lg bg-primary/10 mr-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                AI Block Generator
              </CardTitle>
              <CardDescription>
                Describe what you want and let AI create it for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={generateDescription}
                onChange={e => setGenerateDescription(e.target.value)}
                placeholder="Describe the block you want to create (e.g., 'A block that fetches weather data for a city and returns the temperature in Celsius')."
                rows={4}
                className="resize-none bg-background/50 border-border/50 focus:border-primary/50"
              />
              <Button
                onClick={handleGenerateClick}
                disabled={!generateDescription.trim() || isGeneratingBlock}
                className={cn(
                  "w-full h-12 text-base glow-effect-hover",
                  isGeneratingBlock && "opacity-80"
                )}
              >
                {isGeneratingBlock ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Block...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Custom Block
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Start Suggestions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Quick Start Ideas</CardTitle>
              <CardDescription>Click any suggestion to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'HTTP Request Block', description: 'Fetch data from APIs' },
                  { label: 'JSON Transformer', description: 'Parse and transform data' },
                  { label: 'Condition Checker', description: 'Add branching logic' },
                  { label: 'LLM Chat Block', description: 'AI-powered responses' },
                ].map((suggestion) => (
                  <Button
                    key={suggestion.label}
                    variant="outline"
                    className="h-auto py-3 px-4 flex flex-col items-start text-left border-border/50 hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => setGenerateDescription(`Create a ${suggestion.label.toLowerCase()}: ${suggestion.description}`)}
                  >
                    <span className="font-medium">{suggestion.label}</span>
                    <span className="text-xs text-muted-foreground">{suggestion.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant for more complex generation */}
          <AIAssistantEnhanced
            context="No blocks found in the registry. User might need help generating their first block."
            contextType="block_generation"
            organizationId={organizationId}
            suggestions={[
              'Create an HTTP request block',
              'Make a JSON data transformer',
              'Build a condition checker',
              'Create an LLM chat block',
            ]}
            onGenerationStart={onGenerationStart}
            onStageChange={onStageChange}
            onBlockGenerated={(block, blockId) => {
              console.log('Block generated:', block, blockId)
            }}
          />
        </div>
      )}
    </div>
  )
}
