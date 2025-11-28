import AnimatedBlobs from "../components/background.AnimatedBlob";
import { useState } from 'react'
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
const Blocks = () => {
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedBlock, setSelectedBlock] = useState<any>(null)

  const { data: blocks, isLoading, error, refetch } = useBlocks(selectedCategory)
  const { data: categories, error: categoriesError } = useBlockCategories() // Get error for categories
  const { data: registryStats, error: registryStatsError } = useRegistryStats() // Get error for registry stats
  const generateBlockMutation = useGenerateBlock()
  const enableBlockMutation = useEnableBlock()
  const disableBlockMutation = useDisableBlock()

  // Determine if there's any error related to blocks or registry stats
  const hasApiError = !!error || !!categoriesError || !!registryStatsError

  // Filter blocks based on search term
  const filteredBlocks = Array.isArray(blocks)
    ? blocks.filter(
      (block: any) =>
        block.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div className="flex items-start justify-center min-h-screen p-10 bg-gray-50">
        <div className="p-8 mt-20 bg-white border border-gray-200 shadow-xl rounded-2xl">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 mb-4 text-indigo-600 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-800">Loading Block Registry</h2>
            <p className="mt-1 text-sm text-gray-500">Fetching all available workflow blocks...</p>
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
      <div className="min-h-screen p-8 bg-gray-50">
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
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen  bg-gray-950">

      <AnimatedBlobs />
      {/* --- 1. Enhanced Header & Action Bar --- */}
      <header className="top-0 z-10 px-8 py-5 shadow-lg ">
        <div className="flex items-center justify-between">
          {/* Left Side: Title and Stats */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-100">
              Block Manager
            </h1>
            <p className="mt-1 text-sm text-gray-300">
              Manage & extend your workflow library.
              {registryStats && (
                <span className="ml-2 font-medium text-gray-200">
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
                            bg-[#D4AF37] text-white font-semibold 
                            rounded-xl 
                            shadow-l shadow-[#d4af3770] hover:shadow-2xl 
                            hover:bg-[#d4a037] 
                            transition duration-300 ease-in-out 
                            transform hover:scale-[1.01]
                        "
            title="Open modal to generate a new AI-powered workflow block"
          >
            <Plus className="w-5 h-5" />
            <span>Generate AI Block</span>
          </button>
        </div>
      </header>



      <main className="p-8 space-y-8">
        <div className="px-4 mb-8 text-gray-200 border bg-neutral-800 rounded-xl sm:p-0 lg:px-4 sm:px-4 lg:p-0 border-neutral-700 max-h-52">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-8">
            {/* Left Image */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <img
                src="/BlocksHeader1.svg"
                alt="blocks header"
                className="object-contain w-full h-32 mx-auto sm:w-auto sm:h-36 lg:h-44"
              />
            </div>

            {/* Center Text */}
            <div className="text-center lg:text-left">
              <h2 className="mb-1 text-xl sm:text-2xl lg:text-3xl sm:mb-2">
                Explore{" "}
                <span className="text-yellow-500">templates</span>{" "}
                or
              </h2>
              <h2 className="text-xl sm:text-2xl lg:text-3xl">
                <span className="text-yellow-500">customize</span>{" "}
                them
              </h2>
            </div>

            {/* Right Image */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <img
                src="/BlocksHeader2.svg"
                alt="blocks header"
                className="object-contain w-full h-32 mx-auto sm:w-auto sm:h-40 lg:h-52"
              />
            </div>
          </div>
        </div>
        {/* --- 2. Registry Stats Cards --- */}
        {registryStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ">
            {/* Card 1: Total Blocks */}
            <div className="p-6 transition duration-300 transform border border-gray-100 shadow-xl  rounded-s-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium tracking-wider text-gray-100 uppercase">
                    Total Blocks
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-gray-200">
                    {(registryStats as any).total_blocks}
                  </p>
                </div>
                <div className="p-3 text-blue-600 shadow-inner rounded-xl bg-blue-50">
                  <Layers className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Card 2: Enabled Blocks */}
            <div className="p-6 transition duration-300 transform border border-gray-100 shadow-xl ">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium tracking-wider text-gray-100 uppercase">
                    Active Status
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-gray-200">
                    {(registryStats as any).enabled_blocks}
                  </p>
                </div>
                <div className="p-3 text-green-600 shadow-inner rounded-xl bg-green-50">
                  <Power className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Card 3: Categories */}
            <div className="p-6 transition duration-300 transform border border-gray-100 shadow-xl ">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium tracking-wider text-gray-100 uppercase">
                    Categories
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-gray-200">
                    {Array.isArray(categories) ? categories.length : 0}
                  </p>
                </div>
                <div className="p-3 text-purple-600 shadow-inner rounded-xl bg-purple-50">
                  <Grid className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Card 4: Plugins */}
            <div className="p-6 transition duration-300 transform border border-gray-100 shadow-xl  rounded-e-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium tracking-wider text-gray-100 uppercase">
                    Plugins
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-gray-200">
                    {(registryStats as any)?.plugins_loaded || 0}
                  </p>
                </div>
                <div className="p-3 text-yellow-600 shadow-inner rounded-xl bg-yellow-50">
                  <Code className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {/* {filters.map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === "All"
                  ? "bg-neutral-700 text-white"
                  : "bg-transparent border border-neutral-700 text-neutral-400 hover:text-white"
                  }`}
              >
                {filter}
              </button>
            ))} */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center w-full px-4 py-3 bg-transparent border sm:w-auto border-neutral-700 rounded-xl text-neutral-300"
              >
                <Filter className="mr-2 text-neutral-500" size={18} />
                {selectedCategory || "All Categories"}
              </button>

              {categoryOpen && (
                <>
                  {/* Overlay to close dropdown */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCategoryOpen(false)}
                  />

                  {/* Dropdown - horizontal scrollable */}
                  <div
                    className="absolute left-0 z-50 p-3 mt-2 border shadow-lg bg-black/70 backdrop-blur-md border-neutral-700 rounded-xl"
                  >
                    <div className="flex flex-row gap-2 overflow-x-auto max-w-[90vw]">
                      <button
                        onClick={() => {
                          setSelectedCategory("");
                          setCategoryOpen(false);
                        }}
                        className={`px-4 py-2 rounded-lg border border-neutral-600 flex-shrink-0 whitespace-nowrap ${selectedCategory === ""
                          ? "bg-neutral-700 text-white"
                          : "bg-neutral-900 text-neutral-300"
                          }`}
                      >
                        All
                      </button>

                      {Array.isArray(categories) &&
                        categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setCategoryOpen(false);
                            }}
                            className={`px-4 py-2 rounded-lg border border-neutral-600 flex-shrink-0 whitespace-nowrap ${selectedCategory === cat
                              ? "bg-neutral-700 text-white"
                              : "bg-neutral-900 text-neutral-300"
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search blocks by name, type, or summary..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-4 pr-10 text-sm bg-transparent border rounded-lg w-52 border-neutral-700 text-neutral-400 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
            />
            <Search className="absolute w-4 h-4 -translate-y-1/2 text-neutral-500 right-3 top-1/2" />
          </div>
        </div>


        {/* --- 3. Main Block Content Area --- */}
        <div className="p-8 border border-gray-100 shadow-2xl  rounded-2xl">

          {/* Block Grid Display */}
          {filteredBlocks.length > 0 && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredBlocks.map((block: any) => {
                // const BlockIcon = getBlockIcon(block.type)
                const category = block.manifest?.category || block.type.split('_')[0] || 'general'
                const color = getCategoryColor(category)
                // const bgColor = color.replace('text-', 'bg-').replace('-600', '-50')

                return (
                  <div
                    key={block.type}
                    className="flex flex-col p-4 transition-all duration-300 border shadow-lg bg-neutral-900/90 backdrop-blur-md border-neutral-700 rounded-2xl hover:shadow-2xl hover:border-neutral-600"
                  >
                    {/* Preview Image */}
                    <div className="flex items-center justify-center w-full h-40 mb-4 overflow-hidden bg-neutral-800 rounded-xl">
                      <img
                        src="/blocks.svg"
                        alt="block preview"
                        className="object-contain w-28 h-28"
                      />
                    </div>

                    {/* Title + Views */}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-100">
                        {block.manifest?.name || block.type.replace(/_/g, ' ')}
                      </h3>

                      <div className="flex items-center text-sm text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="w-4 h-4 mr-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 
                               4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>3.7k</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="mb-4 text-sm text-gray-400 line-clamp-2">
                      {block.manifest?.summary ||
                        `Block type: ${block.type}. No summary provided.`}
                    </p>

                    {/* Footer — Category + Button */}
                    <div className="flex items-center justify-between pt-3 mt-auto border-t border-neutral-700">
                      <span
                        className={`text-xs ${color} bg-neutral-800 px-3 py-1 rounded-full font-bold uppercase`}
                      >
                        {category}
                      </span>

                      <button
                        onClick={() => setSelectedBlock(block)}
                        className="px-3 py-1.5 text-xs bg-yellow-600 text-black font-semibold 
                                   hover:bg-yellow-500 rounded-lg transition shadow"
                      >
                        Details & config
                      </button>
                    </div>
                  </div>
                );

              })}
            </div>
          )}
        </div>
      </main>

      {/* Generate Block Modal (Frosted Glass Style) */}
      {showGenerateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 bg-black/50 backdrop-blur-md"
          onClick={() => setShowGenerateModal(false)}
        >
          <div
            className="w-full max-w-lg p-6 mx-auto transition-all duration-300 transform scale-100 border shadow-2xl bg-gray-900/50 backdrop-blur-xl rounded-2xl border-white/20"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="flex items-center pb-3 mb-6 text-3xl font-extrabold text-gray-100 border-b">
              <Zap className="w-6 h-6 mr-3 text-gray-100" />
              AI Block Generator
            </h3>
            <div className="space-y-6">
              {/* Description Input Area */}
              <div>
                <label
                  htmlFor="block-description"
                  className="block mb-3 text-base font-semibold text-gray-300"
                >
                  Describe the block's function in detail:
                </label>
                <textarea
                  id="block-description"
                  value={generateDescription}
                  onChange={e => setGenerateDescription(e.target.value)}
                  placeholder="e.g., 'A block that fetches the current stock price for a given ticker, then uses a pre-trained sentiment model to classify the latest 10 news headlines about the company as positive, negative, or neutral.'"
                  className="w-full h-40 p-4 text-sm text-gray-300 transition duration-150 border border-gray-800 shadow-inner resize-none rounded-xl bg-black/10 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-2 text-xs text-gray-500">
                  The more detail you provide, the better the generated block will be.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-4 space-x-3">
                {/* Secondary Button: Cancel */}
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-6 py-3 text-base font-medium text-gray-700 transition-colors bg-gray-100 shadow-md rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>

                {/* Primary Button: Generate */}
                <button
                  onClick={handleGenerateBlock}
                  disabled={!generateDescription.trim() || generateBlockMutation.isPending}
                  className={`px-6 py-3 text-base font-medium text-white rounded-xl  transition-all duration-300
                                        ${!generateDescription.trim() ||
                      generateBlockMutation.isPending
                      ? 'bg-[#D4AF37]/55 cursor-not-allowed opacity-80'
                      : 'bg-[#D4AF37] hover:bg-[#D4AF37]/90 hover:shadow-xl shadow-indigo-300'
                    }
                                        flex items-center justify-center space-x-2`}
                >
                  {generateBlockMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Code...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Generate Block</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* AI Assistant - Enhanced with Block Generation Mode */}
      <AIAssistantEnhanced
        context={
          selectedBlock
            ? `Currently viewing ${selectedBlock.type} block`
            : 'Block management and configuration'
        }
        contextType="block_generation"
        organizationId={currentOrganization?.id || 'default_org'}
        suggestions={[
          'Create an HTTP request block',
          'Make a JSON data transformer',
          'Build a condition checker',
          'Create an LLM chat block',
        ]}
        onBlockGenerated={(block, blockId) => {
          console.log('Block generated:', block)
          if (blockId) {
            // Refetch blocks to show the new one
            refetch()
          }
        }}
      />
    </div>
  )
}
export default Blocks;