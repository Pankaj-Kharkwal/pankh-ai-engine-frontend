import { useState, useEffect } from 'react'
import {
  Plus,
  Code,
  Database,
  Zap,
  Mail,
  Search,
  Filter,
  Loader2,
  Power,
  PowerOff,
  Layers,
  Grid,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import {
  useBlocks,
  useBlockCategories,
  useRegistryStats,
  useGenerateBlock,
  useEnableBlock,
  useDisableBlock,
} from '../hooks/useApi'
import BlockDetails from '../components/blocks/BlockDetails'
import { apiClient } from '../services/api'
import AIAssistantEnhanced from '../components/ai/AIAssistantEnhanced'
import NoBlocksFoundPanel from '../components/blocks/NoBlocksFoundPanel'
import { toast } from 'sonner'

// shadcn components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Icon mapping for different block types
const getBlockIcon = (blockType: string) => {
  if (blockType.toLowerCase().includes('data') || blockType.toLowerCase().includes('input'))
    return Database
  if (blockType.toLowerCase().includes('ai') || blockType.toLowerCase().includes('llm')) return Zap
  if (blockType.toLowerCase().includes('email') || blockType.toLowerCase().includes('mail'))
    return Mail
  if (blockType.toLowerCase().includes('process') || blockType.toLowerCase().includes('filter'))
    return Settings
  if (blockType.toLowerCase().includes('log') || blockType.toLowerCase().includes('report'))
    return BarChart3
  return Code
}

// Color mapping for categories (dark theme compatible)
const getCategoryConfig = (category: string): { color: string; bgColor: string; borderColor: string } => {
  const colorMap: { [key: string]: { color: string; bgColor: string; borderColor: string } } = {
    data: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
    ai: { color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
    communication: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30' },
    processing: { color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' },
    input: { color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
    output: { color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
  }
  return colorMap[category?.toLowerCase()] || { color: 'text-muted-foreground', bgColor: 'bg-muted/50', borderColor: 'border-border' }
}

// Stats card component
interface StatCardProps {
  label: string
  value: number | string
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'yellow'
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colorStyles = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30 text-yellow-400',
  }

  return (
    <Card className={cn(
      "relative overflow-hidden border bg-gradient-to-br transition-all duration-300 hover:scale-[1.02]",
      colorStyles[color]
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={cn("p-3 rounded-xl", colorStyles[color].split(' ')[0].replace('from-', 'bg-'))}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Block card skeleton for loading state
function BlockCardSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4 mt-4" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </CardHeader>
      <CardFooter className="pt-3 border-t border-border/50">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </CardFooter>
    </Card>
  )
}

// Loading skeleton component
function BlocksLoadingSkeleton() {
  return (
    <div className="min-h-screen p-8 space-y-8">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search skeleton */}
      <Card className="border-border/50">
        <CardContent className="p-8">
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-48 rounded-xl" />
          </div>

          {/* Block cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlockCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Blocks() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBlock, setSelectedBlock] = useState<any>(null)

  // Generation progress state
  const [generationProgress, setGenerationProgress] = useState<{
    isGenerating: boolean
    stage: string
    blockName?: string
  } | null>(null)

  const { data: blocks, isLoading, error, refetch } = useBlocks(selectedCategory === 'all' ? '' : selectedCategory)
  const { data: categories, error: categoriesError } = useBlockCategories()
  const { data: registryStats, error: registryStatsError } = useRegistryStats()
  const generateBlockMutation = useGenerateBlock()
  const enableBlockMutation = useEnableBlock()
  const disableBlockMutation = useDisableBlock()

  // Determine if there's any error related to blocks or registry stats
  const hasApiError = !!error || !!categoriesError || !!registryStatsError

  // Filter blocks based on search term
  const filteredBlocks = Array.isArray(blocks)
    ? blocks.filter(
        (block: any) =>
          block.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.metadata?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.manifest?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.manifest?.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const handleGenerateBlock = async (description: string, autoDeploy?: boolean) => {
    try {
      await generateBlockMutation.mutateAsync({
        description: description,
        autoDeploy: autoDeploy,
      })
      refetch()
      return { success: true }
    } catch (err) {
      console.error('Failed to generate block:', err)
      return { success: false, error: err }
    }
  }

  const handleSaveBlockConfig = async (parameters: any) => {
    if (!selectedBlock) return

    try {
      await apiClient.setBlockConfig(selectedBlock.type, parameters)
      toast.success('Block configuration saved')
      refetch()
    } catch (error) {
      console.error('Failed to save block configuration:', error)
      toast.error('Failed to save configuration')
    }
  }

  // Toggle block enabled state
  const handleToggleBlock = async (block: any) => {
    const mutation = block.enabled ? disableBlockMutation : enableBlockMutation
    try {
      await mutation.mutateAsync(block.type)
      toast.success(`Block ${block.enabled ? 'disabled' : 'enabled'} successfully`)
      refetch()
    } catch (error) {
      console.error(`Failed to ${block.enabled ? 'disable' : 'enable'} block:`, error)
      toast.error(`Failed to ${block.enabled ? 'disable' : 'enable'} block`)
    }
  }

  const closeBlockModal = () => {
    setSelectedBlock(null)
  }

  // Loading state
  if (isLoading) {
    return <BlocksLoadingSkeleton />
  }

  // Graceful Fallback for No Blocks or API Error
  if (
    hasApiError ||
    (Array.isArray(blocks) && blocks.length === 0 && searchTerm === '' && selectedCategory === 'all')
  ) {
    return (
      <>
        {/* Generation Progress Banner */}
        {generationProgress?.isGenerating && (
          <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 border-b border-primary/30 px-8 py-4 z-50 backdrop-blur-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <div className="absolute inset-0 animate-ping">
                    <Sparkles className="w-6 h-6 text-primary/50" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Generating AI Block...</p>
                  <p className="text-sm text-muted-foreground">
                    {generationProgress.stage === 'planning' && 'Analyzing your description and planning...'}
                    {generationProgress.stage === 'generation' && 'Creating block specification...'}
                    {generationProgress.stage === 'verification' && 'Validating block quality...'}
                    {generationProgress.stage === 'healing' && 'Fixing issues...'}
                    {generationProgress.stage === 'persistence' && 'Saving to database...'}
                    {!generationProgress.stage && 'Processing...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="min-h-screen p-8">
          <NoBlocksFoundPanel
            hasError={hasApiError}
            errorMessage={error?.message || categoriesError?.message || registryStatsError?.message}
            onRetry={() => refetch()}
            onGenerateBlock={handleGenerateBlock}
            isGeneratingBlock={generateBlockMutation.isPending}
            onGenerationStart={() => {
              setGenerationProgress({
                isGenerating: true,
                stage: 'planning',
              })
            }}
            onStageChange={(stage) => {
              setGenerationProgress(prev => ({
                ...prev,
                isGenerating: true,
                stage: stage,
              }))
            }}
          />
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Generation Progress Banner */}
      {generationProgress?.isGenerating && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 border-b border-primary/30 px-8 py-4 z-50 backdrop-blur-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="w-6 h-6 text-primary/50" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground">Generating AI Block...</p>
                <p className="text-sm text-muted-foreground">
                  {generationProgress.stage === 'planning' && 'Analyzing your description and planning...'}
                  {generationProgress.stage === 'generation' && 'Creating block specification...'}
                  {generationProgress.stage === 'verification' && 'Validating block quality...'}
                  {generationProgress.stage === 'healing' && 'Fixing issues...'}
                  {generationProgress.stage === 'persistence' && 'Saving to database...'}
                  {!generationProgress.stage && 'Processing...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 px-8 py-6 backdrop-blur-xl bg-background/80">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="gradient-text">Block Manager</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage & extend your workflow library
              {registryStats && (
                <span className="ml-2">
                  (
                  <span className="font-semibold text-green-400">
                    {(registryStats as any).enabled_blocks}
                  </span>{' '}
                  / {(registryStats as any).total_blocks} Active)
                </span>
              )}
            </p>
          </div>

          <Button
            onClick={() => {}}
            className="glow-effect-hover"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate AI Block
          </Button>
        </div>
      </header>

      <main className="p-8 space-y-8">
        {/* Registry Stats Cards */}
        {registryStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Total Blocks"
              value={(registryStats as any).total_blocks}
              icon={Layers}
              color="blue"
            />
            <StatCard
              label="Active Status"
              value={(registryStats as any).enabled_blocks}
              icon={Power}
              color="green"
            />
            <StatCard
              label="Categories"
              value={Array.isArray(categories) ? categories.length : 0}
              icon={Grid}
              color="purple"
            />
            <StatCard
              label="Plugins"
              value={(registryStats as any)?.plugins_loaded || 0}
              icon={Code}
              color="yellow"
            />
          </div>
        )}

        {/* Main Block Content Area */}
        <Card className="border-border/50">
          <CardContent className="p-8">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search blocks by name, type, or summary..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 bg-muted/50 border-border/50 focus:border-primary/50"
                />
              </div>

              {/* Category Select */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[200px] h-12 bg-muted/50 border-border/50">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Array.isArray(categories) &&
                    categories.map((category: string) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Block Grid Display */}
            {filteredBlocks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBlocks.map((block: any) => {
                  const BlockIcon = getBlockIcon(block.type)
                  const category = block.metadata?.category || block.manifest?.category || block.type || 'general'
                  const { color, bgColor, borderColor } = getCategoryConfig(category)

                  return (
                    <Card
                      key={block.id}
                      className={cn(
                        "group relative overflow-hidden border transition-all duration-300",
                        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
                        "hover:scale-[1.02] cursor-pointer",
                        borderColor
                      )}
                      onClick={() => setSelectedBlock(block)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          {/* Icon with background */}
                          <div className={cn("p-3 rounded-xl", bgColor)}>
                            <BlockIcon className={cn("w-6 h-6", color)} />
                          </div>

                          {/* Status and Toggle */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleBlock(block)
                              }}
                              disabled={enableBlockMutation.isPending || disableBlockMutation.isPending}
                              className={cn(
                                "h-8 w-8 rounded-full",
                                block.enabled
                                  ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  : "text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              )}
                            >
                              {block.enabled ? (
                                <PowerOff className="w-4 h-4" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </Button>

                            <Badge
                              variant={block.enabled ? "default" : "secondary"}
                              className={cn(
                                "text-xs font-medium",
                                block.enabled
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                              )}
                            >
                              {block.enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>

                        <CardTitle className="text-lg font-semibold mt-4 group-hover:text-primary transition-colors">
                          {block.name || block.manifest?.name || block.type.replace(/_/g, ' ')}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {block.metadata?.description || block.manifest?.summary ||
                            `Block type: ${block.type}. No summary provided.`}
                        </CardDescription>
                      </CardHeader>

                      <CardFooter className="pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between w-full">
                          <Badge
                            variant="outline"
                            className={cn("text-xs font-medium uppercase", color, borderColor)}
                          >
                            {category}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary group-hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedBlock(block)
                            }}
                          >
                            Details
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </CardFooter>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No blocks found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Block Details Modal */}
      <BlockDetails
        block={selectedBlock}
        onClose={closeBlockModal}
        onSave={handleSaveBlockConfig}
        enableBlockMutation={enableBlockMutation}
        disableBlockMutation={disableBlockMutation}
      />

      {/* AI Assistant - Enhanced with Block Generation Mode */}
      <AIAssistantEnhanced
        context={
          selectedBlock
            ? `Currently viewing ${selectedBlock.type} block`
            : 'Block management and configuration'
        }
        contextType="block_generation"
        suggestions={[
          'Create an HTTP request block',
          'Make a JSON data transformer',
          'Build a condition checker',
          'Create an LLM chat block',
        ]}
        onGenerationStart={() => {
          setGenerationProgress({
            isGenerating: true,
            stage: 'planning',
          })
        }}
        onStageChange={(stage) => {
          setGenerationProgress(prev => ({
            ...prev,
            isGenerating: true,
            stage: stage,
          }))
        }}
        onBlockGenerated={(block, blockId) => {
          // Stop generation progress
          setGenerationProgress(null)

          // Show success toast
          toast.success('Block Generated Successfully', {
            description: `${block.name || 'New Block'} (${block.type || 'utility'})`,
          })

          if (blockId) {
            refetch()
            setTimeout(() => {
              const updatedBlock = blocks?.find((b: any) => b.id === blockId || b._id === blockId)
              if (updatedBlock) {
                setSelectedBlock(updatedBlock)
              } else {
                setSelectedBlock({ ...block, id: blockId })
              }
            }, 1000)
          }
        }}
      />
    </div>
  )
}
