import React, { useState } from 'react'
import {
  Sparkles,
  ArrowRight,
  Copy,
  Download,
  Wand2,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react'
import { apiClient } from '../../services/api'

interface GeneratedWorkflow {
  description: string
  nodes: Array<{
    id: string
    type: string
    label: string
    parameters: Record<string, any>
    position?: { x: number; y: number }
  }>
  connections: Array<{
    from: string
    to: string
    description?: string
  }>
  explanation: string
  estimatedTime?: string
  complexity?: 'simple' | 'medium' | 'complex'
}

interface AIWorkflowGeneratorProps {
  onWorkflowGenerated?: (workflow: GeneratedWorkflow) => void
  onApplyToCanvas?: (workflow: GeneratedWorkflow) => void
  isOpen: boolean
  onClose: () => void
}

export default function AIWorkflowGenerator({
  onWorkflowGenerated,
  onApplyToCanvas,
  isOpen,
  onClose,
}: AIWorkflowGeneratorProps) {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow | null>(null)
  const [error, setError] = useState<string | null>(null)

  const examplePrompts = [
    'Create a workflow that monitors website uptime and sends alerts',
    'Build an automation to process customer feedback and generate reports',
    'Design a workflow that extracts data from PDFs and stores in a database',
    'Create a chatbot that answers questions using web search results',
    'Build a content moderation system using AI analysis',
    'Design a workflow that processes images and generates descriptions',
  ]

  const handleGenerateWorkflow = async () => {
    if (!description.trim()) return

    setIsGenerating(true)
    setError(null)
    setGeneratedWorkflow(null)

    try {
      const response = await apiClient.generateWorkflowSuggestions(description.trim())

      if (response.success && response.result?.azure_chat?.text) {
        const aiResponse = response.result.azure_chat.text

        // Try to parse the AI response to extract workflow structure
        const workflow = parseAIWorkflowResponse(aiResponse, description)
        setGeneratedWorkflow(workflow)

        if (onWorkflowGenerated) {
          onWorkflowGenerated(workflow)
        }
      } else {
        setError('Failed to generate workflow suggestions. Please try again.')
      }
    } catch (err) {
      console.error('Workflow generation error:', err)
      setError(
        err instanceof Error ? err.message : 'An error occurred while generating the workflow.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const parseAIWorkflowResponse = (
    aiResponse: string,
    userDescription: string
  ): GeneratedWorkflow => {
    // Extract JSON if present, otherwise create a structured workflow from the text
    let parsedJson = null

    try {
      // Look for JSON structure in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedJson = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.log('No valid JSON found, creating workflow from text')
    }

    if (parsedJson && parsedJson.nodes) {
      return {
        description: userDescription,
        nodes: parsedJson.nodes.map((node: any, index: number) => ({
          id: node.id || `node_${index}`,
          type: node.type || 'echo',
          label: node.label || node.name || `Node ${index + 1}`,
          parameters: node.parameters || {},
          position: node.position || { x: index * 200, y: 100 },
        })),
        connections: parsedJson.connections || [],
        explanation: aiResponse,
        complexity: parsedJson.complexity || 'medium',
      }
    }

    // Fallback: Create a simple workflow based on common patterns
    const nodes = createDefaultWorkflowNodes(userDescription, aiResponse)

    return {
      description: userDescription,
      nodes,
      connections: generateDefaultConnections(nodes),
      explanation: aiResponse,
      complexity: nodes.length > 5 ? 'complex' : nodes.length > 2 ? 'medium' : 'simple',
    }
  }

  const createDefaultWorkflowNodes = (description: string, aiResponse: string) => {
    const nodes = []
    let nodeId = 1

    // Analyze description and AI response to suggest appropriate blocks
    const lowerDesc = description.toLowerCase()
    const lowerResponse = aiResponse.toLowerCase()

    // Start node
    nodes.push({
      id: `node_${nodeId++}`,
      type: 'echo',
      label: 'Start',
      parameters: { message: 'Workflow started' },
      position: { x: 100, y: 100 },
    })

    // Add AI/search blocks based on content
    if (
      lowerDesc.includes('search') ||
      lowerDesc.includes('web') ||
      lowerResponse.includes('search')
    ) {
      nodes.push({
        id: `node_${nodeId++}`,
        type: 'searxng_search',
        label: 'Web Search',
        parameters: {
          query: 'search query here',
          limit: 5,
        },
        position: { x: 300, y: 100 },
      })
    }

    // Add AI processing if mentioned
    if (
      lowerDesc.includes('ai') ||
      lowerDesc.includes('analyze') ||
      lowerDesc.includes('chat') ||
      lowerResponse.includes('azure_chat') ||
      lowerResponse.includes('ai')
    ) {
      nodes.push({
        id: `node_${nodeId++}`,
        type: 'azure_chat',
        label: 'AI Analysis',
        parameters: {
          system: 'You are a helpful assistant.',
          prompt: 'Analyze the input data and provide insights.',
          temperature: 0.7,
        },
        position: { x: 500, y: 100 },
      })
    }

    // Add HTTP call if API is mentioned
    if (lowerDesc.includes('api') || lowerDesc.includes('http') || lowerDesc.includes('webhook')) {
      nodes.push({
        id: `node_${nodeId++}`,
        type: 'http_get',
        label: 'API Call',
        parameters: {
          url: 'https://api.example.com/data',
        },
        position: { x: 700, y: 100 },
      })
    }

    // Add PDF processing if mentioned
    if (lowerDesc.includes('pdf') || lowerResponse.includes('pdf')) {
      nodes.push({
        id: `node_${nodeId++}`,
        type: 'pdf_extract',
        label: 'PDF Processing',
        parameters: {},
        position: { x: 300, y: 250 },
      })
    }

    // End node
    nodes.push({
      id: `node_${nodeId++}`,
      type: 'echo',
      label: 'Complete',
      parameters: { message: 'Workflow completed successfully' },
      position: { x: nodes.length * 150, y: 100 },
    })

    return nodes
  }

  const generateDefaultConnections = (nodes: any[]) => {
    const connections = []
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        from: nodes[i].id,
        to: nodes[i + 1].id,
        description: `Connect ${nodes[i].label} to ${nodes[i + 1].label}`,
      })
    }
    return connections
  }

  const handleApplyToCanvas = () => {
    if (generatedWorkflow && onApplyToCanvas) {
      onApplyToCanvas(generatedWorkflow)
      onClose()
    }
  }

  const copyWorkflowJSON = () => {
    if (generatedWorkflow) {
      navigator.clipboard.writeText(JSON.stringify(generatedWorkflow, null, 2))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">AI Workflow Generator</h2>
              <p className="text-sm text-gray-600">
                Describe your automation goal and let AI design the workflow
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your workflow goal:
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="E.g., 'Create a workflow that monitors customer feedback, analyzes sentiment using AI, and sends alerts for negative reviews'"
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={isGenerating}
            />

            {/* Example Prompts */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setDescription(prompt)}
                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-blue-100 border border-gray-200 rounded-full transition-colors"
                    disabled={isGenerating}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mb-6">
            <button
              onClick={handleGenerateWorkflow}
              disabled={!description.trim() || isGenerating}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Workflow...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate AI Workflow</span>
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Generated Workflow Display */}
          {generatedWorkflow && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Generated Workflow</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      generatedWorkflow.complexity === 'simple'
                        ? 'bg-green-100 text-green-700'
                        : generatedWorkflow.complexity === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {generatedWorkflow.complexity} complexity
                  </span>
                </div>
              </div>

              {/* Workflow Summary */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Workflow Overview</h4>
                <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                  {generatedWorkflow.explanation}
                </p>
              </div>

              {/* Nodes */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Blocks ({generatedWorkflow.nodes.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generatedWorkflow.nodes.map((node, index) => (
                    <div key={node.id} className="bg-white p-3 rounded border">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-blue-600">{index + 1}.</span>
                        <span className="text-sm font-medium">{node.label}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{node.type}</span>
                      </div>
                      {Object.keys(node.parameters).length > 0 && (
                        <div className="text-xs text-gray-500">
                          {Object.entries(node.parameters)
                            .slice(0, 2)
                            .map(([key, value]) => (
                              <div key={key}>
                                {key}: {String(value).substring(0, 30)}...
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Connections */}
              {generatedWorkflow.connections.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    Connections ({generatedWorkflow.connections.length})
                  </h4>
                  <div className="space-y-2">
                    {generatedWorkflow.connections.map((conn, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm text-gray-600"
                      >
                        <span>{conn.from}</span>
                        <ArrowRight className="w-4 h-4" />
                        <span>{conn.to}</span>
                        {conn.description && (
                          <span className="text-xs text-gray-400">({conn.description})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleApplyToCanvas}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Apply to Canvas</span>
                </button>
                <button
                  onClick={copyWorkflowJSON}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy JSON</span>
                </button>
                <button
                  onClick={() => {
                    setGeneratedWorkflow(null)
                    setError(null)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
