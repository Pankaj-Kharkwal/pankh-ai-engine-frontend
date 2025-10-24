/**
 * Chat Service - SSE Client for Real-time Chat
 * Manages chatbot sessions, messaging, and SSE streaming
 */

import { EventSourcePolyfill } from 'event-source-polyfill'

const API_BASE = import.meta.env.VITE_API_URL || 'http://backend-dev.pankh.ai/api'
const API_KEY = import.meta.env.VITE_API_KEY || 'dev-key-change-me'

// ==================== Types ====================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface ChatSession {
  session_id: string
  chatbot_id: string
  workflow_id: string
  user_id: string
  created_at: string
  last_activity: string
  message_count: number
  is_active: boolean
  messages?: ChatMessage[]
}

export interface ChatbotConfig {
  system_prompt?: string
  greeting_message?: string
  model?: string
  temperature?: number
  max_tokens?: number
  stream_tokens?: boolean
  enable_context_compression?: boolean
  max_messages?: number
}

export interface Chatbot {
  chatbot_id: string
  name: string
  description: string
  workflow_id: string
  organization_id: string
  created_by: string
  created_at: string
  updated_at: string
  config: ChatbotConfig
  tags: string[]
  is_published: boolean
  is_public: boolean
  version: number
  stats: {
    total_sessions: number
    total_messages: number
    avg_session_duration: number
  }
}

export interface CreateChatbotRequest {
  name: string
  description?: string
  workflow_id: string
  config?: ChatbotConfig
  tags?: string[]
  is_public?: boolean
}

export interface SSEEvent {
  type:
    | 'connected'
    | 'message_received'
    | 'block_started'
    | 'block_completed'
    | 'token'
    | 'response_complete'
    | 'error'
    | 'heartbeat'
    | 'timeout'
  data: any
}

export type SSEEventHandler = (event: SSEEvent) => void

// ==================== Chatbot Management ====================

export async function createChatbot(request: CreateChatbotRequest): Promise<Chatbot> {
  const response = await fetch(`${API_BASE}/chatbots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Failed to create chatbot: ${response.statusText}`)
  }

  return response.json()
}

export async function listChatbots(params?: {
  tags?: string
  published_only?: boolean
}): Promise<{ chatbots: Chatbot[]; total: number }> {
  const queryParams = new URLSearchParams()

  if (params?.tags) {
    queryParams.append('tags', params.tags)
  }
  if (params?.published_only) {
    queryParams.append('published_only', 'true')
  }

  const response = await fetch(`${API_BASE}/chatbots?${queryParams}`, {
    headers: {
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to list chatbots: ${response.statusText}`)
  }

  return response.json()
}

export async function getChatbot(chatbotId: string): Promise<Chatbot> {
  const response = await fetch(`${API_BASE}/chatbots/${chatbotId}`, {
    headers: {
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get chatbot: ${response.statusText}`)
  }

  return response.json()
}

export async function updateChatbot(
  chatbotId: string,
  updates: Partial<CreateChatbotRequest>
): Promise<Chatbot> {
  const response = await fetch(`${API_BASE}/chatbots/${chatbotId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error(`Failed to update chatbot: ${response.statusText}`)
  }

  return response.json()
}

export async function publishChatbot(chatbotId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/chatbots/${chatbotId}/publish`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to publish chatbot: ${response.statusText}`)
  }
}

export async function unpublishChatbot(chatbotId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/chatbots/${chatbotId}/unpublish`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to unpublish chatbot: ${response.statusText}`)
  }
}

export async function deleteChatbot(chatbotId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/chatbots/${chatbotId}`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete chatbot: ${response.statusText}`)
  }
}

export async function duplicateChatbot(
  chatbotId: string,
  newName: string
): Promise<{ chatbot_id: string; name: string }> {
  const response = await fetch(`${API_BASE}/chatbots/${chatbotId}/duplicate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ name: newName }),
  })

  if (!response.ok) {
    throw new Error(`Failed to duplicate chatbot: ${response.statusText}`)
  }

  return response.json()
}

// ==================== Chat Session Management ====================

export async function createSession(
  chatbotId: string,
  metadata?: Record<string, any>
): Promise<ChatSession> {
  const response = await fetch(`${API_BASE}/chat/${chatbotId}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ metadata }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`)
  }

  return response.json()
}

export async function sendMessage(
  chatbotId: string,
  sessionId: string,
  message: string
): Promise<{ session_id: string; status: string; response: string; blocks_executed: number }> {
  const response = await fetch(`${API_BASE}/chat/${chatbotId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      session_id: sessionId,
      message,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`)
  }

  return response.json()
}

export async function getSession(chatbotId: string, sessionId: string): Promise<ChatSession> {
  const response = await fetch(`${API_BASE}/chat/${chatbotId}/sessions/${sessionId}`, {
    headers: {
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get session: ${response.statusText}`)
  }

  return response.json()
}

export async function getSessionHistory(
  chatbotId: string,
  sessionId: string,
  limit?: number
): Promise<{ session_id: string; messages: ChatMessage[] }> {
  const queryParams = limit ? `?limit=${limit}` : ''

  const response = await fetch(
    `${API_BASE}/chat/${chatbotId}/sessions/${sessionId}/history${queryParams}`,
    {
      headers: {
        'X-API-Key': API_KEY,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to get session history: ${response.statusText}`)
  }

  return response.json()
}

export async function deleteSession(chatbotId: string, sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/chat/${chatbotId}/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete session: ${response.statusText}`)
  }
}

// ==================== SSE Streaming ====================

export class ChatStream {
  private eventSource: EventSourcePolyfill | null = null
  private handlers: Map<string, SSEEventHandler[]> = new Map()
  private chatbotId: string
  private sessionId: string

  constructor(chatbotId: string, sessionId: string) {
    this.chatbotId = chatbotId
    this.sessionId = sessionId
  }

  /**
   * Connect to SSE stream
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${API_BASE}/chat/${this.chatbotId}/stream/${this.sessionId}`

      this.eventSource = new EventSourcePolyfill(url, {
        headers: {
          'X-API-Key': API_KEY,
        },
        heartbeatTimeout: 120000, // 2 minutes
      })

      this.eventSource.addEventListener('connected', () => {
        resolve()
      })

      this.eventSource.addEventListener('error', (event: any) => {
        console.error('SSE error:', event)
        reject(new Error('Failed to connect to chat stream'))
      })

      // Register event handlers
      ;[
        'message_received',
        'block_started',
        'block_completed',
        'token',
        'response_complete',
        'error',
        'heartbeat',
        'timeout',
      ].forEach(eventType => {
        this.eventSource!.addEventListener(eventType, (event: any) => {
          const data = JSON.parse(event.data)
          this.emit(eventType as any, data)
        })
      })
    })
  }

  /**
   * Register event handler
   */
  on(eventType: SSEEvent['type'], handler: SSEEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, [])
    }
    this.handlers.get(eventType)!.push(handler)
  }

  /**
   * Unregister event handler
   */
  off(eventType: SSEEvent['type'], handler: SSEEventHandler): void {
    const handlers = this.handlers.get(eventType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * Emit event to registered handlers
   */
  private emit(eventType: SSEEvent['type'], data: any): void {
    const event: SSEEvent = { type: eventType, data }
    const handlers = this.handlers.get(eventType)
    if (handlers) {
      handlers.forEach(handler => handler(event))
    }
  }

  /**
   * Disconnect from stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this.handlers.clear()
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSourcePolyfill.OPEN
  }
}

// ==================== Analytics ====================

export async function getChatbotAnalytics(chatbotId: string, days: number = 7): Promise<any> {
  const response = await fetch(`${API_BASE}/chatbots/${chatbotId}/analytics?days=${days}`, {
    headers: {
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get analytics: ${response.statusText}`)
  }

  return response.json()
}

export async function getSessionAnalytics(chatbotId: string, sessionId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/chat/${chatbotId}/sessions/${sessionId}/analytics`, {
    headers: {
      'X-API-Key': API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get session analytics: ${response.statusText}`)
  }

  return response.json()
}

export async function getUserSessions(
  userId: string,
  activeOnly: boolean = true
): Promise<{ user_id: string; sessions: ChatSession[] }> {
  const response = await fetch(
    `${API_BASE}/chat/users/${userId}/sessions?active_only=${activeOnly}`,
    {
      headers: {
        'X-API-Key': API_KEY,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to get user sessions: ${response.statusText}`)
  }

  return response.json()
}
