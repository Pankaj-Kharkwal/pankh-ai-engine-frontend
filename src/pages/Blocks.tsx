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
  AlertCircle,
  Power,
  PowerOff,
  Layers,
  Grid,
  BarChart3,
  Settings,
  CheckCircle,
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
import NoBlocksFoundPanel from '../components/blocks/NoBlocksFoundPanel' // Import the new component

// Icon mapping for different block types - ADDED ICONS FOR DIVERSITY
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

// Color mapping for categories
const getCategoryColor = (category: string) => {
  const colorMap: { [key: string]: string } = {
    data: 'text-blue-600',
    ai: 'text-purple-600',
    communication: 'text-yellow-600',
    processing: 'text-green-600',
    input: 'text-cyan-600', // Added new color for input
    output: 'text-orange-600',
  }
  return colorMap[category?.toLowerCase()] || 'text-gray-600'
}

export default function Blocks() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedBlock, setSelectedBlock] = useState<any>(null)

  // Generation progress state
  const [generationProgress, setGenerationProgress] = useState<{
    isGenerating: boolean
    stage: string
    blockName?: string
  } | null>(null)

  // Success notification state
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [generatedBlockInfo, setGeneratedBlockInfo] = useState<{
    name: string
    type: string
    blockId?: string
  } | null>(null)

  const { data: blocks, isLoading, error, refetch } = useBlocks(selectedCategory)
  const { data: categories, error: categoriesError } = useBlockCategories() // Get error for categories
  const { data: registryStats, error: registryStatsError } = useRegistryStats() // Get error for registry stats
  const generateBlockMutation = useGenerateBlock()
  const enableBlockMutation = useEnableBlock()
  const disableBlockMutation = useDisableBlock()

  // Get organization ID from environment
  const organizationId = import.meta.env.VITE_ORG_ID || '692544df47f2d43416429b38'

  // Debug: Monitor generationProgress state changes
  useEffect(() => {
    console.log('🎯 [Blocks] generationProgress state changed:', generationProgress)
  }, [generationProgress])

  // Determine if there's any error related to blocks or registry stats
  const hasApiError = !!error || !!categoriesError || !!registryStatsError

  // Auto-hide success notification after 5 seconds
  useEffect(() => {
    if (showSuccessNotification) {
      const timer = setTimeout(() => {
        setShowSuccessNotification(false)
        setGeneratedBlockInfo(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessNotification])

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
      refetch() // Refetch blocks after successful generation
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
      refetch()
    } catch (error) {
      console.error('Failed to save block configuration:', error)
    }
  }

  // Toggle block enabled state
  const handleToggleBlock = async (block: any) => {
    const mutation = block.enabled ? disableBlockMutation : enableBlockMutation
    try {
      await mutation.mutateAsync(block.type)
      refetch()
    } catch (error) {
      console.error(`Failed to ${block.enabled ? 'disable' : 'enable'} block:`, error)
    }
  }

  const closeBlockModal = () => {
    setSelectedBlock(null)
  }

  /* --- IMPROVED LOADING STATE --- */
  if (isLoading) {
    return (
      <div className="min-h-screen p-10 bg-gray-50 flex items-start justify-center">
        <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-200 mt-20">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Loading Block Registry</h2>
            <p className="text-sm text-gray-500 mt-1">Fetching all available workflow blocks...</p>
          </div>
        </div>
      </div>
    )
  }

  // --- Graceful Fallback for No Blocks or API Error ---
  if (
    hasApiError ||
    (Array.isArray(blocks) && blocks.length === 0 && searchTerm === '' && selectedCategory === '')
  ) {
    return (
      <>
        {/* Generation Progress Banner */}
        {(() => {
          console.log('🎯 [Blocks] Rendering NoBlocks - checking banner condition:', {
            generationProgress,
            shouldShow: generationProgress?.isGenerating
          })
          return generationProgress?.isGenerating
        })() && (
          <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200 px-8 py-4 z-50 shadow-lg animate-fadeIn">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <div>
                  <p className="font-bold text-gray-900">Generating AI Block...</p>
                  <p className="text-sm text-blue-700">
                    {generationProgress.stage === 'planning' && '🤔 Analyzing your description and planning...'}
                    {generationProgress.stage === 'generation' && '⚡ Creating block specification...'}
                    {generationProgress.stage === 'verification' && '✅ Validating block quality...'}
                    {generationProgress.stage === 'healing' && '🔧 Fixing issues...'}
                    {generationProgress.stage === 'persistence' && '💾 Saving to database...'}
                    {!generationProgress.stage && 'Processing...'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {/* AI assistant is always visible as floating button */}}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                View Details →
              </button>
            </div>
          </div>
        )}

        <div className="min-h-screen bg-gray-50 p-8">
          <NoBlocksFoundPanel
          hasError={hasApiError}
          errorMessage={error?.message || categoriesError?.message || registryStatsError?.message}
          onRetry={() => {
            refetch()
            // Also refetch categories and registry stats if they had errors
            if (categoriesError) useBlockCategories().refetch()
            if (registryStatsError) useRegistryStats().refetch()
          }}
          onGenerateBlock={handleGenerateBlock}
          isGeneratingBlock={generateBlockMutation.isPending}
          organizationId={organizationId}
          onGenerationStart={() => {
            console.log('🎯 [Blocks→NoBlocksPanel] onGenerationStart callback invoked!')
            setGenerationProgress({
              isGenerating: true,
              stage: 'planning',
            })
          }}
          onStageChange={(stage) => {
            console.log('🎯 [Blocks→NoBlocksPanel] onStageChange callback invoked with stage:', stage)
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
    <div className="min-h-screen bg-gray-50">
      {/* --- 1. Enhanced Header & Action Bar --- */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-5 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Left Side: Title and Stats */}
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Block Manager <span className="text-indigo-600">🚀</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage & extend your workflow library.
              {registryStats && (
                <span className="ml-2 font-medium text-gray-700">
                  (
                  <span className="font-bold text-green-600">
                    {(registryStats as any).enabled_blocks}
                  </span>{' '}
                  / {(registryStats as any).total_blocks} Active)
                </span>
              )}
            </p>
          </div>

          {/* Right Side: Primary Action Button */}
          <button
            onClick={() => {
              /* This button will now be handled by the NoBlocksFoundPanel or a dedicated AI Assistant */
            }}
            className="
                            flex items-center space-x-2 
                            px-6 py-2.5 
                            bg-indigo-600 text-white font-semibold 
                            rounded-xl 
                            shadow-xl shadow-indigo-200 hover:shadow-2xl 
                            hover:bg-indigo-700 
                            transition duration-300 ease-in-out 
                            transform hover:scale-[1.03]
                        "
            title="Open modal to generate a new AI-powered workflow block"
          >
            <Plus className="w-5 h-5" />
            <span>Generate AI Block</span>
          </button>
        </div>
      </header>

      <main className="p-8 space-y-8">
        {/* --- 2. Registry Stats Cards --- */}
        {registryStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Total Blocks */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 transform hover:translate-y-[-2px] transition duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Total Blocks
                  </p>
                  <p className="text-4xl font-extrabold text-gray-900 mt-2">
                    {(registryStats as any).total_blocks}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shadow-inner">
                  <Layers className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Card 2: Enabled Blocks */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 transform hover:translate-y-[-2px] transition duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Active Status
                  </p>
                  <p className="text-4xl font-extrabold text-green-600 mt-2">
                    {(registryStats as any).enabled_blocks}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-50 text-green-600 shadow-inner">
                  <Power className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Card 3: Categories */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 transform hover:translate-y-[-2px] transition duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Categories
                  </p>
                  <p className="text-4xl font-extrabold text-gray-900 mt-2">
                    {Array.isArray(categories) ? categories.length : 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shadow-inner">
                  <Grid className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Card 4: Plugins */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 transform hover:translate-y-[-2px] transition duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Plugins
                  </p>
                  <p className="text-4xl font-extrabold text-gray-900 mt-2">
                    {(registryStats as any)?.plugins_loaded || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600 shadow-inner">
                  <Code className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. Main Block Content Area --- */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
          {/* Modern Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search blocks by name, type, or summary..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 
                                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-inner"
              />
            </div>

            {/* Category Select */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto pl-12 pr-5 py-3.5 border border-gray-300 rounded-xl bg-white text-gray-700 
                                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer transition duration-150 shadow-inner"
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) &&
                  categories.map((category: string) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
              {/* Custom dropdown arrow to replace default appearance-none */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Block Grid Display */}
          {filteredBlocks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredBlocks.map((block: any) => {
                const BlockIcon = getBlockIcon(block.type)
                const category = block.metadata?.category || block.manifest?.category || block.type || 'general'
                const color = getCategoryColor(category)
                const bgColor = color.replace('text-', 'bg-').replace('-600', '-50')

                return (
                  <div
                    key={block.id}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col justify-between"
                  >
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        {/* Icon with a distinct, larger background */}
                        <div className={`p-3 rounded-xl ${bgColor} shadow-lg shadow-gray-100`}>
                          <BlockIcon className={`w-8 h-8 ${color}`} />
                        </div>

                        {/* Status Tag and Toggle */}
                        <div className="flex space-x-2 items-center">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              handleToggleBlock(block)
                            }}
                            disabled={
                              enableBlockMutation.isPending || disableBlockMutation.isPending
                            }
                            className={`p-2 rounded-full transition-colors duration-200 ${
                              block.enabled
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                            title={block.enabled ? 'Disable Block' : 'Enable Block'}
                          >
                            {block.enabled ? (
                              <PowerOff className="w-5 h-5" />
                            ) : (
                              <Power className="w-5 h-5" />
                            )}
                          </button>

                          <div
                            className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-widest ${block.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {block.enabled ? 'Active' : 'Disabled'}
                          </div>
                        </div>
                      </div>

                      {/* Block Title and Summary */}
                      <h3 className="text-xl font-extrabold mb-2 text-gray-900 leading-snug">
                        {block.name || block.manifest?.name || block.type.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-3">
                        {block.metadata?.description || block.manifest?.summary ||
                          `Block type: ${block.type}. No summary provided.`}
                      </p>
                    </div>

                    {/* Footer: Category Tag and Action Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span
                        className={`text-xs ${color} bg-gray-100 px-3 py-1 rounded-full font-bold uppercase`}
                      >
                        {category}
                      </span>
                      <button
                        onClick={() => setSelectedBlock(block)}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white font-semibold hover:bg-indigo-700 rounded-lg transition-colors shadow-md"
                      >
                        Details & Config
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Block Modal */}
      {/* Note: I'm assuming BlockDetails handles its own modal/overlay logic, if not,
                you might need to wrap it in a similar div as the generate modal for a consistent look. */}
      <BlockDetails
        block={selectedBlock}
        onClose={closeBlockModal}
        onSave={handleSaveBlockConfig}
        // Pass mutations for the component to handle its own toggle state and visual feedback
        enableBlockMutation={enableBlockMutation}
        disableBlockMutation={disableBlockMutation}
      />

      {/* Generation Progress Banner */}
      {(() => {
        console.log('🎯 [Blocks] Rendering - checking banner condition:', {
          generationProgress,
          shouldShow: generationProgress?.isGenerating
        })
        return generationProgress?.isGenerating
      })() && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200 px-8 py-4 z-50 shadow-lg animate-fadeIn">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <div>
                <p className="font-bold text-gray-900">Generating AI Block...</p>
                <p className="text-sm text-blue-700">
                  {generationProgress.stage === 'planning' && '🤔 Analyzing your description and planning...'}
                  {generationProgress.stage === 'generation' && '⚡ Creating block specification...'}
                  {generationProgress.stage === 'verification' && '✅ Validating block quality...'}
                  {generationProgress.stage === 'healing' && '🔧 Fixing issues...'}
                  {generationProgress.stage === 'persistence' && '💾 Saving to database...'}
                  {!generationProgress.stage && 'Processing...'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {/* AI assistant is always visible as floating button */}}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View Details →
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessNotification && generatedBlockInfo && (
        <div className="fixed top-20 right-8 bg-green-50 border-2 border-green-500 rounded-xl shadow-2xl px-6 py-4 z-50 animate-slideInRight max-w-md">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-green-900 mb-1">Block Generated Successfully!</h4>
              <p className="text-sm text-green-700 mb-2">
                <span className="font-semibold">{generatedBlockInfo.name}</span> ({generatedBlockInfo.type})
              </p>
              {generatedBlockInfo.blockId && (
                <button
                  onClick={() => {
                    // Find and open the generated block
                    const block = blocks?.find((b: any) => b.id === generatedBlockInfo.blockId || b._id === generatedBlockInfo.blockId)
                    if (block) {
                      setSelectedBlock(block)
                      setShowSuccessNotification(false)
                    }
                  }}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  Open Block Details →
                </button>
              )}
            </div>
            <button
              onClick={() => setShowSuccessNotification(false)}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* AI Assistant - Enhanced with Block Generation Mode */}
      <AIAssistantEnhanced
        context={
          selectedBlock
            ? `Currently viewing ${selectedBlock.type} block`
            : 'Block management and configuration'
        }
        contextType="block_generation"
        organizationId={organizationId}
        suggestions={[
          'Create an HTTP request block',
          'Make a JSON data transformer',
          'Build a condition checker',
          'Create an LLM chat block',
        ]}
        onGenerationStart={() => {
          console.log('🎯 [Blocks] onGenerationStart callback invoked!')
          console.log('🎯 [Blocks] Setting generationProgress state:', { isGenerating: true, stage: 'planning' })
          setGenerationProgress({
            isGenerating: true,
            stage: 'planning',
          })
          console.log('🎯 [Blocks] State setter called')
        }}
        onStageChange={(stage) => {
          console.log('🎯 [Blocks] onStageChange callback invoked with stage:', stage)
          setGenerationProgress(prev => {
            console.log('🎯 [Blocks] Previous state:', prev)
            const newState = {
              ...prev,
              isGenerating: true,
              stage: stage,
            }
            console.log('🎯 [Blocks] New state:', newState)
            return newState
          })
        }}
        onBlockGenerated={(block, blockId) => {
          console.log('Block generated:', block)

          // Stop generation progress
          setGenerationProgress(null)

          // Show success notification
          setGeneratedBlockInfo({
            name: block.name || 'New Block',
            type: block.type || 'utility',
            blockId: blockId,
          })
          setShowSuccessNotification(true)

          if (blockId) {
            // Refetch blocks to show the new one
            refetch()

            // Auto-open block details after brief delay for refetch
            setTimeout(() => {
              const updatedBlock = blocks?.find((b: any) => b.id === blockId || b._id === blockId)
              if (updatedBlock) {
                setSelectedBlock(updatedBlock)
              } else {
                // If block not found in list yet, use the generated block data
                setSelectedBlock({ ...block, id: blockId })
              }
            }, 1000)
          }
        }}
      />
    </div>
  )
}
