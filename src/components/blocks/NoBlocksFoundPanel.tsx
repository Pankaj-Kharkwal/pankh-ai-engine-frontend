import { useState } from 'react'
import { Plus, Zap, AlertCircle, Loader2, Search } from 'lucide-react'
import AIAssistantEnhanced from '../ai/AIAssistantEnhanced' // Updated to use Enhanced version

interface NoBlocksFoundPanelProps {
  hasError: boolean
  errorMessage?: string
  onRetry: () => void
  onGenerateBlock: (description: string, autoDeploy?: boolean) => Promise<any>
  isGeneratingBlock: boolean
}

export default function NoBlocksFoundPanel({
  hasError,
  errorMessage,
  onRetry,
  onGenerateBlock,
  isGeneratingBlock,
}: NoBlocksFoundPanelProps) {
  const [generateDescription, setGenerateDescription] = useState('')

  const handleGenerateClick = async () => {
    if (!generateDescription.trim()) return
    await onGenerateBlock(generateDescription, true)
    setGenerateDescription('') // Clear description after generation
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl shadow-xl border border-gray-200 text-center">
      {hasError ? (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-8 shadow-2xl max-w-lg">
          <div className="flex items-start space-x-4 text-red-800">
            <AlertCircle className="w-8 h-8 flex-shrink-0 mt-1" />
            <div>
              <div className="text-xl font-bold">Failed to Load Registry</div>
              <div className="text-base text-red-700 mt-2">
                {errorMessage ||
                  'Could not connect to the block API. Please ensure the backend service is running and accessible.'}
              </div>
              <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Search className="w-16 h-16 mx-auto mb-6 text-gray-400" />
          <h3 className="text-3xl font-extrabold mb-3 text-gray-900">No Blocks Found Yet!</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl">
            It looks like you haven't created any blocks, or the registry is empty. Let our AI
            assistant help you generate your first custom block!
          </p>

          {/* AI Assistant for Block Generation */}
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-indigo-600" /> AI Block Generator
            </h4>
            <textarea
              value={generateDescription}
              onChange={e => setGenerateDescription(e.target.value)}
              placeholder="Describe the block you want to create (e.g., 'A block that fetches weather data for a city and returns the temperature in Celsius')."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 text-sm resize-none"
            />
            <button
              onClick={handleGenerateClick}
              disabled={!generateDescription.trim() || isGeneratingBlock}
              className={`mt-4 w-full flex items-center justify-center space-x-2 px-6 py-3 text-base font-medium text-white rounded-xl shadow-lg transition-all duration-300
                ${
                  !generateDescription.trim() || isGeneratingBlock
                    ? 'bg-indigo-400 cursor-not-allowed opacity-80'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl shadow-indigo-300'
                }`}
            >
              {isGeneratingBlock ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Block...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Generate Custom Block</span>
                </>
              )}
            </button>
          </div>

          {/* Optional: AIAssistantEnhanced as a floating panel for block generation */}
          <AIAssistantEnhanced
            context="No blocks found in the registry. User might need help generating their first block."
            contextType="block_generation"
            suggestions={[
              'Create an HTTP request block',
              'Make a JSON data transformer',
              'Build a condition checker',
              'Create an LLM chat block',
            ]}
            onBlockGenerated={(block, blockId) => {
              console.log('Block generated:', block, blockId)
              // Refresh blocks list would happen here
            }}
          />
        </>
      )}
    </div>
  )
}
