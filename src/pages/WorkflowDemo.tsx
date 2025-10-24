import { useState } from 'react'
import {
  Play,
  Code,
  Download,
  Loader,
  CheckCircle,
  AlertCircle,
  Search,
  Globe,
  MessageSquare,
  Volume2,
} from 'lucide-react'
import { useCreateWorkflow, useRunWorkflow } from '../hooks/useApi'

const demoWorkflows = [
  {
    id: 'simple_search',
    name: 'Simple Search Demo',
    description: 'Basic SearXNG search with result display',
    icon: '🔍',
    category: 'Basic',
    complexity: 'Beginner',
    estimatedTime: '10-15s',
    blocks: ['SearXNG Search', 'Echo Display'],
    workflow: {
      name: 'Simple Search Demo',
      graph: {
        nodes: [
          {
            id: 'search_demo',
            type: 'searxng_search',
            parameters: {
              query: 'machine learning tutorials 2025',
              limit: 5,
              timeout_sec: 15,
            },
          },
          {
            id: 'display_results',
            type: 'echo',
            parameters: {
              message:
                'Search Results: {{search_demo.searxng_search | map(attribute="title") | join(", ")}}',
            },
          },
        ],
        edges: [{ from_node: 'search_demo', to_node: 'display_results' }],
      },
    },
  },
  {
    id: 'ai_research',
    name: 'AI Research Pipeline',
    description: 'Search AI news, scrape articles, and analyze with GPT',
    icon: '🤖',
    category: 'Advanced',
    complexity: 'Intermediate',
    estimatedTime: '45-60s',
    blocks: ['SearXNG Search', 'URL Scraping', 'Azure Chat AI'],
    workflow: {
      name: 'AI Research Pipeline',
      graph: {
        nodes: [
          {
            id: 'search_ai_news',
            type: 'searxng_search',
            parameters: {
              query: 'artificial intelligence news 2025 latest developments',
              categories: ['news', 'general'],
              limit: 6,
              timeout_sec: 20,
            },
          },
          {
            id: 'scrape_articles',
            type: 'scrape_urls',
            parameters: {
              top_n_from_searx: 4,
              max_chars_per_doc: 4000,
              timeout_sec: 25,
            },
          },
          {
            id: 'analyze_trends',
            type: 'azure_chat',
            parameters: {
              system:
                'You are an AI research analyst. Analyze the provided news articles and extract key trends, developments, and insights.',
              prompt:
                'Based on the following AI news articles, provide a comprehensive analysis covering: 1) Key developments and breakthroughs, 2) Industry trends and market impacts, 3) Technical innovations mentioned. Context: {context}',
              temperature: 0.3,
              timeout_sec: 60,
            },
          },
        ],
        edges: [
          { from_node: 'search_ai_news', to_node: 'scrape_articles' },
          { from_node: 'scrape_articles', to_node: 'analyze_trends' },
        ],
      },
    },
  },
  {
    id: 'tech_analysis',
    name: 'Tech Company Analysis',
    description: 'Research specific companies and analyze their market position',
    icon: '📊',
    category: 'Business',
    complexity: 'Intermediate',
    estimatedTime: '30-45s',
    blocks: ['SearXNG Search', 'Content Scraping', 'Business Analysis AI'],
    workflow: {
      name: 'Tech Company Analysis',
      graph: {
        nodes: [
          {
            id: 'search_company',
            type: 'searxng_search',
            parameters: {
              query: 'OpenAI Microsoft partnership 2025 business strategy',
              categories: ['news', 'general'],
              limit: 6,
              timeout_sec: 15,
            },
          },
          {
            id: 'get_content',
            type: 'scrape_urls',
            parameters: {
              top_n_from_searx: 3,
              max_chars_per_doc: 3500,
              timeout_sec: 20,
            },
          },
          {
            id: 'business_analysis',
            type: 'azure_chat',
            parameters: {
              system:
                'You are a business analyst specializing in technology companies. Analyze competitive positioning, partnerships, and strategic moves.',
              prompt:
                'Analyze the business strategy and competitive position based on this information: {context}. Provide insights on: 1) Strategic partnerships, 2) Competitive advantages, 3) Market positioning, 4) Future outlook',
              temperature: 0.2,
            },
          },
        ],
        edges: [
          { from_node: 'search_company', to_node: 'get_content' },
          { from_node: 'get_content', to_node: 'business_analysis' },
        ],
      },
    },
  },
  {
    id: 'quantum_research',
    name: 'Quantum Computing Research',
    description: 'Deep dive into quantum computing developments with expert analysis',
    icon: '⚛️',
    category: 'Research',
    complexity: 'Advanced',
    estimatedTime: '60-90s',
    blocks: ['SearXNG Search', 'Content Extraction', 'Expert Analysis AI', 'Executive Summary AI'],
    workflow: {
      name: 'Quantum Computing Research',
      graph: {
        nodes: [
          {
            id: 'quantum_search',
            type: 'searxng_search',
            parameters: {
              query: 'quantum computing breakthrough 2025 IBM Google quantum advantage',
              categories: ['news', 'science'],
              limit: 8,
              timeout_sec: 20,
            },
          },
          {
            id: 'extract_content',
            type: 'scrape_urls',
            parameters: {
              top_n_from_searx: 4,
              max_chars_per_doc: 4500,
              timeout_sec: 30,
            },
          },
          {
            id: 'technical_analysis',
            type: 'azure_chat',
            parameters: {
              system:
                'You are a quantum computing expert and technology analyst. Provide detailed technical analysis of quantum developments.',
              prompt:
                'Analyze these quantum computing developments: {context}. Focus on: 1) Technical breakthroughs and innovations, 2) Commercial applications and potential, 3) Competitive landscape, 4) Timeline for practical applications',
              temperature: 0.25,
              timeout_sec: 90,
            },
          },
          {
            id: 'executive_summary',
            type: 'azure_chat',
            parameters: {
              system:
                'You are a business executive summary writer. Create concise, actionable summaries for leadership.',
              prompt:
                'Create an executive summary of this quantum computing analysis: {{technical_analysis.azure_chat.text}}. Keep it to 3 bullet points focusing on business impact.',
              temperature: 0.2,
              timeout_sec: 45,
            },
          },
        ],
        edges: [
          { from_node: 'quantum_search', to_node: 'extract_content' },
          { from_node: 'extract_content', to_node: 'technical_analysis' },
          { from_node: 'technical_analysis', to_node: 'executive_summary' },
        ],
      },
    },
  },
]

export default function WorkflowDemo() {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createWorkflowMutation = useCreateWorkflow()
  const runWorkflowMutation = useRunWorkflow()

  const selectedWorkflow = demoWorkflows.find(w => w.id === selectedDemo)

  const runDemo = async (demoId: string) => {
    const demo = demoWorkflows.find(d => d.id === demoId)
    if (!demo) return

    setIsRunning(demoId)
    setErrors(prev => ({ ...prev, [demoId]: '' }))

    try {
      // Create workflow
      const workflow = await createWorkflowMutation.mutateAsync(demo.workflow)

      // Run workflow
      const execution = await runWorkflowMutation.mutateAsync(workflow.id)

      // Store basic execution info
      setResults(prev => ({
        ...prev,
        [demoId]: {
          executionId: execution.id,
          status: 'running',
          startTime: new Date().toISOString(),
        },
      }))

      // Simulate completion (in real app, you'd poll the execution endpoint)
      setTimeout(() => {
        setResults(prev => ({
          ...prev,
          [demoId]: {
            ...prev[demoId],
            status: 'completed',
            endTime: new Date().toISOString(),
            message:
              'Workflow completed successfully! Check the execution monitor for detailed results.',
          },
        }))
        setIsRunning(null)
      }, 3000)
    } catch (error) {
      console.error('Demo execution failed:', error)
      setErrors(prev => ({
        ...prev,
        [demoId]: `Failed to run demo: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }))
      setIsRunning(null)
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Beginner':
        return 'text-green-400 bg-green-900/20 border-green-600'
      case 'Intermediate':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-600'
      case 'Advanced':
        return 'text-red-400 bg-red-900/20 border-red-600'
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-600'
    }
  }

  const getBlockIcon = (blockName: string) => {
    if (blockName.includes('Search')) return <Search className="w-4 h-4" />
    if (blockName.includes('Scrap') || blockName.includes('Extract'))
      return <Globe className="w-4 h-4" />
    if (blockName.includes('AI') || blockName.includes('Chat') || blockName.includes('Analysis'))
      return <MessageSquare className="w-4 h-4" />
    if (blockName.includes('Echo') || blockName.includes('Display'))
      return <Volume2 className="w-4 h-4" />
    return <Code className="w-4 h-4" />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Workflow Demonstrations</h1>
        <p className="text-gray-400 mt-2">
          Try these pre-built workflows to see Pankh AI Engine in action with real SearXNG
          integration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Demo Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoWorkflows.map(demo => (
              <div
                key={demo.id}
                className={`glass-card p-6 cursor-pointer transition-all duration-300 ${
                  selectedDemo === demo.id
                    ? 'ring-2 ring-blue-500 bg-blue-900/10'
                    : 'hover:animate-glow'
                }`}
                onClick={() => setSelectedDemo(demo.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{demo.icon}</div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs border ${getComplexityColor(demo.complexity)}`}
                  >
                    {demo.complexity}
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{demo.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{demo.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">⏱️</span>
                    <span>~{demo.estimatedTime}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {demo.blocks.map((block, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-1 px-2 py-1 bg-glass-200 rounded text-xs"
                      >
                        {getBlockIcon(block)}
                        <span>{block}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        runDemo(demo.id)
                      }}
                      disabled={isRunning === demo.id}
                      className="w-full glass-button py-2 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isRunning === demo.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>{isRunning === demo.id ? 'Running...' : 'Run Demo'}</span>
                    </button>
                  </div>

                  {/* Results */}
                  {results[demo.id] && (
                    <div className="mt-3 p-3 bg-green-900/20 border border-green-600 rounded">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Demo Executed</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Execution ID: {results[demo.id].executionId}
                      </div>
                      <div className="text-xs text-gray-300 mt-1">{results[demo.id].message}</div>
                    </div>
                  )}

                  {/* Errors */}
                  {errors[demo.id] && (
                    <div className="mt-3 p-3 bg-red-900/20 border border-red-600 rounded">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">Demo Failed</span>
                      </div>
                      <div className="text-xs text-gray-300">{errors[demo.id]}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Details */}
        <div className="space-y-6">
          {selectedWorkflow ? (
            <>
              {/* Workflow Details */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">{selectedWorkflow.icon}</span>
                  {selectedWorkflow.name}
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Category</div>
                    <div className="text-sm">{selectedWorkflow.category}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Complexity</div>
                    <div
                      className={`inline-block px-2 py-1 rounded-full text-xs border ${getComplexityColor(selectedWorkflow.complexity)}`}
                    >
                      {selectedWorkflow.complexity}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Estimated Time</div>
                    <div className="text-sm">{selectedWorkflow.estimatedTime}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Description</div>
                    <div className="text-sm">{selectedWorkflow.description}</div>
                  </div>
                </div>
              </div>

              {/* Workflow Structure */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Workflow Structure</h3>
                <div className="space-y-3">
                  {selectedWorkflow.workflow.graph.nodes.map((node, index) => (
                    <div
                      key={node.id}
                      className="flex items-center space-x-3 p-3 bg-glass-200 rounded"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{node.id}</div>
                        <div className="text-xs text-gray-400">{node.type}</div>
                      </div>
                      {getBlockIcon(node.type)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => runDemo(selectedWorkflow.id)}
                    disabled={isRunning === selectedWorkflow.id}
                    className="w-full glass-button p-3 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isRunning === selectedWorkflow.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span>
                      {isRunning === selectedWorkflow.id ? 'Running Demo...' : 'Run Demo'}
                    </span>
                  </button>

                  <button className="w-full glass-button p-3 flex items-center justify-center space-x-2 hover:animate-glow">
                    <Code className="w-4 h-4" />
                    <span>View Workflow JSON</span>
                  </button>

                  <button className="w-full glass-button p-3 flex items-center justify-center space-x-2 hover:animate-glow">
                    <Download className="w-4 h-4" />
                    <span>Import to Builder</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-8 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-medium mb-2">Select a Demo</h3>
              <p className="text-gray-400 text-sm">
                Choose a workflow demo from the left to see details and run it
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">💡 Tips for Success</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-sm">
            <div className="font-medium mb-2">🔍 SearXNG Setup</div>
            <div className="text-gray-400">
              Ensure your SearXNG instance is configured and accessible. Check the SEARXNG_URL
              environment variable.
            </div>
          </div>
          <div className="text-sm">
            <div className="font-medium mb-2">🤖 Azure OpenAI</div>
            <div className="text-gray-400">
              Configure Azure OpenAI credentials for AI analysis workflows. Set AZURE_OPENAI_*
              environment variables.
            </div>
          </div>
          <div className="text-sm">
            <div className="font-medium mb-2">⚡ Performance</div>
            <div className="text-gray-400">
              Execution times vary based on network conditions and content availability. Monitor via
              the Executions page.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
