/**
 * ChatInterface - Real-time Chat UI with SSE Streaming
 * Displays conversation, handles streaming responses, shows block execution status
 */

import { useState, useEffect, useRef } from 'react'
import { Send, Loader, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { ChatMessage, ChatStream, createSession, sendMessage } from '../../services/chatService'

interface ChatInterfaceProps {
  chatbotId: string
  chatbotName?: string
  greetingMessage?: string
  onSessionCreated?: (sessionId: string) => void
  className?: string
}

export default function ChatInterface({
  chatbotId,
  chatbotName = 'AI Assistant',
  greetingMessage = 'Hello! How can I help you today?',
  onSessionCreated,
  className = '',
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [streamingResponse, setStreamingResponse] = useState('')
  const [currentBlockStatus, setCurrentBlockStatus] = useState<{
    blockId: string
    blockType: string
    status: 'running' | 'completed' | 'failed'
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatStreamRef = useRef<ChatStream | null>(null)

  // Initialize session and add greeting
  useEffect(() => {
    initializeSession()
    return () => {
      // Cleanup: disconnect stream on unmount
      if (chatStreamRef.current) {
        chatStreamRef.current.disconnect()
      }
    }
  }, [chatbotId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingResponse])

  async function initializeSession() {
    try {
      const session = await createSession(chatbotId, {
        source: 'web_ui',
        user_agent: navigator.userAgent,
      })

      setSessionId(session.session_id)

      if (onSessionCreated) {
        onSessionCreated(session.session_id)
      }

      // Add greeting message
      setMessages([
        {
          role: 'assistant',
          content: greetingMessage,
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (err) {
      console.error('Failed to create session:', err)
      setError('Failed to initialize chat session')
    }
  }

  async function handleSendMessage() {
    if (!inputMessage.trim() || !sessionId || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    }

    // Add user message to UI
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)
    setStreamingResponse('')
    setCurrentBlockStatus(null)

    try {
      // Setup SSE streaming
      const stream = new ChatStream(chatbotId, sessionId)
      chatStreamRef.current = stream

      // Setup event handlers
      stream.on('connected', () => {
        console.log('Connected to chat stream')
      })

      stream.on('message_received', event => {
        console.log('Message received by server:', event.data)
      })

      stream.on('block_started', event => {
        setCurrentBlockStatus({
          blockId: event.data.block_id,
          blockType: event.data.block_type,
          status: 'running',
        })
      })

      stream.on('block_completed', event => {
        setCurrentBlockStatus(prev =>
          prev?.blockId === event.data.block_id
            ? { ...prev, status: event.data.status === 'completed' ? 'completed' : 'failed' }
            : prev
        )
      })

      stream.on('token', event => {
        setStreamingResponse(prev => prev + event.data.token)
      })

      stream.on('response_complete', event => {
        // Finalize streaming response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: event.data.message || streamingResponse,
          timestamp: new Date().toISOString(),
        }

        setMessages(prev => [...prev, assistantMessage])
        setStreamingResponse('')
        setCurrentBlockStatus(null)
        setIsLoading(false)

        // Disconnect stream
        stream.disconnect()
      })

      stream.on('error', event => {
        console.error('Stream error:', event.data)
        setError(event.data.error || 'An error occurred')
        setIsLoading(false)
        setStreamingResponse('')
        stream.disconnect()
      })

      stream.on('timeout', () => {
        setError('Request timed out')
        setIsLoading(false)
        stream.disconnect()
      })

      // Connect to stream
      await stream.connect()

      // Send message to trigger workflow execution
      await sendMessage(chatbotId, sessionId, inputMessage)
    } catch (err: any) {
      console.error('Failed to send message:', err)
      setError(err.message || 'Failed to send message')
      setIsLoading(false)

      if (chatStreamRef.current) {
        chatStreamRef.current.disconnect()
      }
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="glass-card p-4 border-b border-glass-300">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{chatbotName}</h3>
            <p className="text-xs text-gray-400">{sessionId ? 'Connected' : 'Connecting...'}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-glass-300 text-white'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
              <div
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                }`}
              >
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming Response */}
        {streamingResponse && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-lg p-3 bg-glass-300 text-white">
              <div className="whitespace-pre-wrap break-words">{streamingResponse}</div>
              <div className="flex items-center mt-2">
                <Loader className="w-3 h-3 animate-spin mr-1" />
                <span className="text-xs text-gray-400">Typing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Block Execution Status */}
        {currentBlockStatus && (
          <div className="flex justify-center">
            <div className="glass-card px-4 py-2 inline-flex items-center space-x-2 text-sm">
              {currentBlockStatus.status === 'running' && (
                <>
                  <Loader className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-gray-300">Executing {currentBlockStatus.blockType}...</span>
                </>
              )}
              {currentBlockStatus.status === 'completed' && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">{currentBlockStatus.blockType} completed</span>
                </>
              )}
              {currentBlockStatus.status === 'failed' && (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-gray-300">{currentBlockStatus.blockType} failed</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-center">
            <div className="glass-card px-4 py-2 bg-red-900/20 border border-red-500/30 inline-flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass-card p-4 border-t border-glass-300">
        <div className="flex items-end space-x-2">
          <textarea
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="glass-input flex-1 resize-none min-h-[44px] max-h-[120px]"
            rows={1}
            disabled={isLoading || !sessionId}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim() || !sessionId}
            className={`glass-button px-4 py-3 ${
              isLoading || !inputMessage.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:animate-glow'
            }`}
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {/* Input Hint */}
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  )
}
