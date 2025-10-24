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
import AIAssistant from '../components/ai/AIAssistant'

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
  const [generateDescription, setGenerateDescription] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<any>(null)

  const { data: blocks, isLoading, error, refetch } = useBlocks(selectedCategory)
  const { data: categories } = useBlockCategories()
  const { data: registryStats } = useRegistryStats()
  const generateBlockMutation = useGenerateBlock()
  const enableBlockMutation = useEnableBlock()
  const disableBlockMutation = useDisableBlock()

  // Filter blocks based on search term
  const filteredBlocks = Array.isArray(blocks)
    ? blocks.filter(
        (block: any) =>
          block.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.manifest?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          block.manifest?.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const handleGenerateBlock = async () => {
    if (!generateDescription.trim()) return

    try {
      await generateBlockMutation.mutateAsync({
        description: generateDescription,
        autoDeploy: true,
      })
      setGenerateDescription('')
      setShowGenerateModal(false)
      refetch()
    } catch (error) {
      console.error('Failed to generate block:', error)
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

  /* --- IMPROVED ERROR STATE --- */
  if (error) {
    return (
      <div className="min-h-screen p-10 bg-gray-50 flex items-start justify-center">
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-8 shadow-2xl mt-20 max-w-lg">
          <div className="flex items-start space-x-4 text-red-800">
            <AlertCircle className="w-8 h-8 flex-shrink-0 mt-1" />
            <div>
              <div className="text-xl font-bold">Failed to Load Registry</div>
              <div className="text-base text-red-700 mt-2">
                Could not connect to the block API. Please ensure the backend service is running and
                accessible.
              </div>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
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
            onClick={() => setShowGenerateModal(true)}
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
          {filteredBlocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredBlocks.map((block: any) => {
                const BlockIcon = getBlockIcon(block.type)
                const category = block.manifest?.category || block.type.split('_')[0] || 'general'
                const color = getCategoryColor(category)
                const bgColor = color.replace('text-', 'bg-').replace('-600', '-50')

                return (
                  <div
                    key={block.type}
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
                        {block.manifest?.name || block.type.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-3">
                        {block.manifest?.summary ||
                          `Block type: ${block.type}. No summary provided in manifest.`}
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
          ) : (
            /* Improved Empty State */
            <div className="text-center py-20 px-4 bg-gray-50 border-4 border-dashed border-gray-200 rounded-2xl">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold mb-2 text-gray-800">No Blocks Found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                We couldn't find any blocks matching your search or filter criteria. Try adjusting
                your search term or category, or create a new block.
              </p>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center space-x-2 mx-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-200 transform hover:scale-[1.02]"
              >
                <Plus className="w-5 h-5" />
                <span>Generate a Custom Block</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Generate Block Modal (Frosted Glass Style) */}
      {showGenerateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4"
          onClick={() => setShowGenerateModal(false)}
        >
          <div
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-lg w-full mx-auto transform transition-all duration-300 scale-100 border border-white/50"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-3 flex items-center">
              <Zap className="w-6 h-6 mr-3 text-indigo-600" />
              AI Block Generator
            </h3>
            <div className="space-y-6">
              {/* Description Input Area */}
              <div>
                <label
                  htmlFor="block-description"
                  className="block text-base font-semibold text-gray-800 mb-3"
                >
                  Describe the block's function in detail:
                </label>
                <textarea
                  id="block-description"
                  value={generateDescription}
                  onChange={e => setGenerateDescription(e.target.value)}
                  placeholder="e.g., 'A block that fetches the current stock price for a given ticker, then uses a pre-trained sentiment model to classify the latest 10 news headlines about the company as positive, negative, or neutral.'"
                  className="w-full h-40 resize-none p-4 border border-gray-300 rounded-xl bg-white text-gray-800 
                                                focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-inner text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  The more detail you provide, the better the generated block will be.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                {/* Secondary Button: Cancel */}
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-xl 
                                                hover:bg-gray-200 transition-colors shadow-md"
                >
                  Cancel
                </button>

                {/* Primary Button: Generate */}
                <button
                  onClick={handleGenerateBlock}
                  disabled={!generateDescription.trim() || generateBlockMutation.isPending}
                  className={`px-6 py-3 text-base font-medium text-white rounded-xl shadow-lg transition-all duration-300
                                        ${
                                          !generateDescription.trim() ||
                                          generateBlockMutation.isPending
                                            ? 'bg-indigo-400 cursor-not-allowed opacity-80'
                                            : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl shadow-indigo-300'
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

      {/* AI Assistant - Keep this as a floating element */}
      <AIAssistant
        context={
          selectedBlock
            ? `Currently viewing ${selectedBlock.type} block`
            : 'Block management and configuration'
        }
        contextType="block"
        suggestions={[
          'How do I configure this block?',
          'What parameters does this block need?',
          'Generate a new custom block',
          'Explain how this block works',
        ]}
      />
    </div>
  )
}
