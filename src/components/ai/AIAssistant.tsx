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
} from 'lucide-react'
import { apiClient } from '../../services/api'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  loading?: boolean
  error?: string
}

interface AIAssistantProps {
  context?: string
  contextType?: 'workflow' | 'block' | 'general'
  suggestions?: string[]
  onSuggestionApplied?: (suggestion: string) => void
}

export default function AIAssistant({
  context,
  contextType = 'general',
  suggestions = [],
  onSuggestionApplied,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const addMessage = (content: string, type: 'user' | 'ai', loading = false, error?: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      loading,
      error,
    }
    setMessages(prev => [...prev, message])
    return message.id
  }

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => (msg.id === id ? { ...msg, ...updates } : msg)))
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')

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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group animate-pulse"
        title="AI Assistant"
      >
        <div className="relative">
          <Sparkles className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">AI Assistant</h3>
            {!isMinimized && (
              <p className="text-xs text-gray-500">
                {contextType === 'workflow'
                  ? 'Workflow help'
                  : contextType === 'block'
                    ? 'Block assistance'
                    : 'General help'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-medium text-gray-600">Quick suggestions:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => applySuggestion(suggestion)}
                    className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Wand2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Ask me anything about workflow automation!</p>
                <div className="mt-2 text-xs text-gray-400">
                  Try: "How do I connect these blocks?" or "Explain this parameter"
                </div>
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
                    message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className={`flex-1 max-w-xs ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.loading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    {message.error && (
                      <p className="text-xs text-red-400 mt-1">Error: {message.error}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about workflows, blocks, or automation..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="text-xs text-gray-500 hover:text-gray-700 mt-2 underline"
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
