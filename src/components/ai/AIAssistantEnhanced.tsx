import React, { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  Lightbulb,
  Wand2,
  Box,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Play,
} from 'lucide-react'
import { apiClient } from '../../services/api'
import {
  BlockGenerationStream,
  createBlockGenSession,
  type BlockGenerationRequest,
  type BlockGenSSEEvent,
} from '../../services/chatService'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  loading?: boolean
  error?: string
  metadata?: {
    stage?: string
    isBlockGen?: boolean
    generatedBlock?: any
    blockId?: string
  }
}

interface AIAssistantProps {
  context?: string
  contextType?: 'workflow' | 'block' | 'block_generation' | 'general'
  suggestions?: string[]
  onSuggestionApplied?: (suggestion: string) => void
  onBlockGenerated?: (block: any, blockId?: string) => void
  onGenerationStart?: () => void
  onStageChange?: (stage: string) => void
  organizationId?: string
}

export default function AIAssistantEnhanced({
  context,
  contextType = 'general',
  suggestions = [],
  onSuggestionApplied,
  onBlockGenerated,
  onGenerationStart,
  onStageChange,
  organizationId,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [resolvedOrgId, setResolvedOrgId] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStage, setCurrentStage] = useState<string>('')
  const [isGeneratingBlock, setIsGeneratingBlock] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const blockGenStreamRef = useRef<BlockGenerationStream | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  // Fetch organization ID if not provided
  useEffect(() => {
    const fetchOrganization = async () => {
      if (organizationId) {
        setResolvedOrgId(organizationId)
        return
      }

      try {
        const apiKey = import.meta.env.VITE_API_KEY || ''
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        }
        if (apiKey) {
          headers['X-API-Key'] = apiKey
        }
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/users/me/organizations`, {
          credentials: 'include',
          headers
        })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const orgs = await response.json()
        if (orgs && orgs.length > 0) {
          console.log('📋 Using organization:', orgs[0].id, orgs[0].name)
          setResolvedOrgId(orgs[0].id)
        } else {
          console.warn('No organizations found for user')
          setResolvedOrgId(null)
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error)
        setResolvedOrgId(null)
      }
    }

    fetchOrganization()
  }, [organizationId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blockGenStreamRef.current) {
        blockGenStreamRef.current.cancel()
      }
    }
  }, [])

  const addMessage = (
    content: string,
    type: 'user' | 'ai',
    loading = false,
    error?: string,
    metadata?: Message['metadata']
  ) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      loading,
      error,
      metadata,
    }
    setMessages(prev => [...prev, message])
    return message.id
  }

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => (msg.id === id ? { ...msg, ...updates } : msg)))
  }

  const handleGenerateBlock = async (description: string, persist: boolean = true) => {
    setIsGeneratingBlock(true)
    setCurrentStage('Initializing...')

    // Notify parent component that generation started
    if (onGenerationStart) {
      console.log('🚀 [AIAssistant] Calling onGenerationStart callback')
      onGenerationStart()
      console.log('🚀 [AIAssistant] onGenerationStart callback completed')
    } else {
      console.warn('⚠️ [AIAssistant] onGenerationStart callback not provided')
    }

    // Add user message
    addMessage(description, 'user')

    // Add loading AI message
    const aiMessageId = addMessage('', 'ai', true, undefined, { isBlockGen: true })

    try {
      const stream = new BlockGenerationStream()
      blockGenStreamRef.current = stream

      let currentContent = ''
      let currentStageText = ''
      let generatedBlock: any = null
      let blockId: string | undefined

      // Stage handler
      stream.on('stage', (event: BlockGenSSEEvent) => {
        const data = event.data as any
        const { stage, status, message: stageMessage } = data

        const stageEmoji = {
          planning: '🤔',
          generation: '⚡',
          verification: '✅',
          healing: '🔧',
          preview: '👀',
          persistence: '💾',
        }[stage] || '📝'

        const statusEmoji = {
          started: '▶️',
          completed: '✅',
          failed: '❌',
          skipped: '⏭️',
        }[status] || ''

        const stageText = `${stageEmoji} ${stage.charAt(0).toUpperCase() + stage.slice(1)}: ${statusEmoji} ${status}\n`
        currentStageText += stageText
        currentContent += stageText

        if (stageMessage) {
          currentContent += `   ${stageMessage}\n`
        }

        setCurrentStage(`${stage} (${status})`)

        // Notify parent component of stage change
        if (onStageChange && status === 'started') {
          console.log(`🚀 [AIAssistant] Calling onStageChange callback with stage: ${stage}`)
          onStageChange(stage)
          console.log('🚀 [AIAssistant] onStageChange callback completed')
        } else if (!onStageChange) {
          console.warn('⚠️ [AIAssistant] onStageChange callback not provided')
        }

        updateMessage(aiMessageId, {
          content: currentContent,
          metadata: { stage, isBlockGen: true },
        })
      })

      // Token handler
      stream.on('token', (event: BlockGenSSEEvent) => {
        const { token, stage } = event.data as any
        currentContent += token
        updateMessage(aiMessageId, {
          content: currentContent,
          metadata: { stage, isBlockGen: true },
        })
      })

      // Complete handler
      stream.on('complete', (event: BlockGenSSEEvent) => {
        const { block, block_id, verification, persisted } = event.data as any

        generatedBlock = block
        blockId = block_id

        let summaryText = '\n\n' + '='.repeat(50) + '\n'
        summaryText += '✅ Block Generated Successfully!\n'
        summaryText += '='.repeat(50) + '\n\n'

        summaryText += `📦 Block Name: ${block.name}\n`
        summaryText += `🏷️ Type: ${block.type}\n`
        summaryText += `📝 Description: ${block.metadata?.description || 'N/A'}\n\n`

        if (verification) {
          summaryText += `✓ Verification Score: ${verification.score}/100\n`
          if (verification.is_valid) {
            summaryText += `✅ Status: Valid\n`
          } else {
            summaryText += `⚠️ Status: Has Issues (${verification.issues?.length || 0})\n`
          }
        }

        if (persisted && block_id) {
          summaryText += `💾 Saved to Database (ID: ${block_id})\n`
        }

        currentContent += summaryText

        updateMessage(aiMessageId, {
          content: currentContent,
          loading: false,
          metadata: {
            isBlockGen: true,
            generatedBlock: block,
            blockId: block_id,
          },
        })

        if (onBlockGenerated) {
          onBlockGenerated(block, block_id)
        }
      })

      // Error handler
      stream.on('error', (event: BlockGenSSEEvent) => {
        const { message: errorMessage, stage } = event.data as any
        currentContent += `\n\n❌ Error: ${errorMessage}\n`

        updateMessage(aiMessageId, {
          content: currentContent,
          loading: false,
          error: errorMessage,
          metadata: { stage, isBlockGen: true },
        })
      })

      // Start generation
      const effectiveOrgId = resolvedOrgId || organizationId
      if (!effectiveOrgId) {
        throw new Error('No organization ID available. Please log in again.')
      }
      const request: BlockGenerationRequest = {
        description,
        organization_id: effectiveOrgId,
        persist,
        verify: true,
        run_preview: false,
      }

      await stream.generate(request)
    } catch (error) {
      updateMessage(aiMessageId, {
        content: 'Failed to generate block. Please try again.',
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsGeneratingBlock(false)
      setCurrentStage('')
      blockGenStreamRef.current = null
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')

    // Check if we're in block generation mode
    if (contextType === 'block_generation') {
      await handleGenerateBlock(userMessage, true)  // Persist blocks by default
      return
    }

    // Add user message
    addMessage(userMessage, 'user')

    // Add loading AI message
    const aiMessageId = addMessage('', 'ai', true)
    setIsLoading(true)

    try {
      // Get AI response based on context
      let response
      const systemPrompt = getSystemPrompt(contextType)

      response = await apiClient.chatWithAI(userMessage, context, systemPrompt)

      if (response.success && response.result?.azure_chat?.text) {
        updateMessage(aiMessageId, {
          content: response.result.azure_chat.text,
          loading: false,
        })
      } else {
        updateMessage(aiMessageId, {
          content: "I'm sorry, I couldn't process your request right now. Please try again.",
          loading: false,
          error: 'Failed to get AI response',
        })
      }
    } catch (error) {
      updateMessage(aiMessageId, {
        content: 'I encountered an error while processing your request. Please try again.',
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSystemPrompt = (type: string) => {
    switch (type) {
      case 'workflow':
        return `You are an AI assistant specialized in workflow automation. Help users create, optimize, and troubleshoot workflows.
        Focus on practical advice about connecting blocks, setting parameters, and achieving automation goals.
        Keep responses concise but helpful.`
      case 'block':
        return `You are an AI assistant specialized in workflow blocks. Help users understand how blocks work,
        configure parameters correctly, and use blocks effectively in their workflows.
        Provide clear, actionable guidance.`
      case 'block_generation':
        return `You are an AI assistant specialized in generating workflow blocks. Help users describe what they want to build,
        and guide them through the block generation process. Ask clarifying questions if needed.`
      default:
        return `You are a helpful AI assistant for PankhAI workflow automation platform.
        Help users with workflow creation, block configuration, and automation best practices.
        Be concise, practical, and friendly.`
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const applySuggestion = (suggestion: string) => {
    setInputValue(suggestion)
    if (onSuggestionApplied) {
      onSuggestionApplied(suggestion)
    }
  }

  const clearConversation = () => {
    setMessages([])
  }

  const handleSaveGeneratedBlock = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message?.metadata?.generatedBlock) return

    try {
      await handleGenerateBlock(message.metadata.generatedBlock.metadata?.description || 'Generated block', true)
    } catch (error) {
      console.error('Failed to save block:', error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group animate-pulse"
        title="AI Assistant"
      >
        <div className="relative">
          {contextType === 'block_generation' ? (
            <Box className="w-6 h-6" />
          ) : (
            <Sparkles className="w-6 h-6" />
          )}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            {contextType === 'block_generation' ? (
              <Box className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {contextType === 'block_generation' ? 'Block Generator' : 'AI Assistant'}
            </h3>
            {!isMinimized && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {contextType === 'workflow'
                  ? 'Workflow help'
                  : contextType === 'block'
                    ? 'Block assistance'
                    : contextType === 'block_generation'
                      ? 'Generate blocks with AI'
                      : 'General help'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {isGeneratingBlock && currentStage && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{currentStage}</span>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Quick suggestions:
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => applySuggestion(suggestion)}
                    className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '420px' }}>
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                {contextType === 'block_generation' ? (
                  <>
                    <Box className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Describe the block you want to create!</p>
                    <div className="mt-2 text-xs text-gray-400">
                      Try: "Create a block that fetches data from an API" or "Make a JSON transformer"
                    </div>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Ask me anything about workflow automation!</p>
                    <div className="mt-2 text-xs text-gray-400">
                      Try: "How do I connect these blocks?" or "Explain this parameter"
                    </div>
                  </>
                )}
              </div>
            )}

            {messages.map(message => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                  }`}
                >
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                    }`}
                  >
                    {message.loading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">
                          {message.metadata?.isBlockGen ? 'Generating block...' : 'Thinking...'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap font-mono">{message.content}</p>
                        {message.metadata?.generatedBlock && !message.metadata.blockId && (
                          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 flex gap-2">
                            <button
                              onClick={() => handleSaveGeneratedBlock(message.id)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors"
                            >
                              <Save className="w-3 h-3" />
                              Save Block
                            </button>
                            <button
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              Test
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {message.error && (
                      <p className="text-xs text-red-400 mt-1">Error: {message.error}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  contextType === 'block_generation'
                    ? 'Describe the block you want to create...'
                    : 'Ask about workflows, blocks, or automation...'
                }
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isLoading || isGeneratingBlock}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || isGeneratingBlock}
                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isLoading || isGeneratingBlock ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mt-2 underline"
              >
                Clear conversation
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
