/**
 * WebSocket Service for Pankh AI Engine
 * Provides real-time updates for workflow execution, block status, and system events
 */

type WebSocketEventType =
  | 'workflow.started'
  | 'workflow.node.started'
  | 'workflow.node.completed'
  | 'workflow.node.failed'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'workflow.error'
  | 'block.execution.started'
  | 'block.execution.completed'
  | 'block.execution.failed'
  | 'gluon.performance'
  | 'system.health'
  | 'connection.established'
  | 'connection.error'

interface WebSocketMessage {
  type: WebSocketEventType
  payload: any
  timestamp: string
  workflow_id?: string
  execution_id?: string
  node_id?: string
}

type MessageHandler = (message: WebSocketMessage) => void
type ConnectionHandler = (status: 'connected' | 'disconnected' | 'reconnecting') => void

const WS_BASE_URL = (import.meta.env.VITE_WS_URL || 'ws://localhost:8001/ws').replace(/\/$/, '')

class WebSocketService {
  private socket: WebSocket | null = null
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map()
  private connectionHandlers: Set<ConnectionHandler> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000 // Start with 1 second
  private maxReconnectDelay = 30000 // Max 30 seconds
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  private messageBuffer: WebSocketMessage[] = []
  private isConnecting = false
  private currentWorkflowId: string | null = null

  /**
   * Connect to WebSocket server
   */
  connect(workflowId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkConnection = setInterval(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection)
            resolve()
          }
        }, 100)
        return
      }

      this.isConnecting = true
      this.currentWorkflowId = workflowId || null

      // Build WebSocket URL
      let wsUrl = WS_BASE_URL
      if (workflowId) {
        wsUrl = `${WS_BASE_URL}/workflow/${workflowId}`
      }

      try {
        this.socket = new WebSocket(wsUrl)

        this.socket.onopen = () => {
          console.log('[WebSocket] Connected to:', wsUrl)
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.reconnectDelay = 1000
          this.notifyConnectionHandlers('connected')
          this.startHeartbeat()
          this.flushMessageBuffer()
          resolve()
        }

        this.socket.onmessage = event => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error)
          }
        }

        this.socket.onerror = error => {
          console.error('[WebSocket] Error:', error)
          this.isConnecting = false
          this.notifyConnectionHandlers('disconnected')
        }

        this.socket.onclose = event => {
          console.log('[WebSocket] Closed:', event.code, event.reason)
          this.isConnecting = false
          this.stopHeartbeat()
          this.notifyConnectionHandlers('disconnected')

          // Attempt reconnection if not intentionally closed
          if (event.code !== 1000) {
            this.scheduleReconnect()
          }
        }
      } catch (error) {
        this.isConnecting = false
        console.error('[WebSocket] Connection failed:', error)
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat()
    this.clearReconnectTimeout()

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect')
      this.socket = null
    }

    this.currentWorkflowId = null
    this.reconnectAttempts = 0
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe(eventType: WebSocketEventType | '*', handler: MessageHandler): () => void {
    const key = eventType === '*' ? '*' : eventType

    if (!this.messageHandlers.has(key)) {
      this.messageHandlers.set(key, new Set())
    }

    this.messageHandlers.get(key)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(key)?.delete(handler)
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler)
    return () => {
      this.connectionHandlers.delete(handler)
    }
  }

  /**
   * Send a message through WebSocket
   */
  send(message: object): void {
    const wsMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(wsMessage))
    } else {
      // Buffer message for later
      this.messageBuffer.push(wsMessage as WebSocketMessage)
      console.warn('[WebSocket] Buffering message, socket not open')
    }
  }

  /**
   * Subscribe to workflow execution events
   */
  subscribeToWorkflow(
    workflowId: string,
    handlers: {
      onStarted?: (payload: any) => void
      onNodeStarted?: (nodeId: string, payload: any) => void
      onNodeCompleted?: (nodeId: string, payload: any) => void
      onNodeFailed?: (nodeId: string, error: any) => void
      onCompleted?: (payload: any) => void
      onFailed?: (error: any) => void
    }
  ): () => void {
    const unsubscribers: (() => void)[] = []

    if (handlers.onStarted) {
      unsubscribers.push(
        this.subscribe('workflow.started', msg => {
          if (msg.workflow_id === workflowId) handlers.onStarted!(msg.payload)
        })
      )
    }

    if (handlers.onNodeStarted) {
      unsubscribers.push(
        this.subscribe('workflow.node.started', msg => {
          if (msg.workflow_id === workflowId && msg.node_id) {
            handlers.onNodeStarted!(msg.node_id, msg.payload)
          }
        })
      )
    }

    if (handlers.onNodeCompleted) {
      unsubscribers.push(
        this.subscribe('workflow.node.completed', msg => {
          if (msg.workflow_id === workflowId && msg.node_id) {
            handlers.onNodeCompleted!(msg.node_id, msg.payload)
          }
        })
      )
    }

    if (handlers.onNodeFailed) {
      unsubscribers.push(
        this.subscribe('workflow.node.failed', msg => {
          if (msg.workflow_id === workflowId && msg.node_id) {
            handlers.onNodeFailed!(msg.node_id, msg.payload)
          }
        })
      )
    }

    if (handlers.onCompleted) {
      unsubscribers.push(
        this.subscribe('workflow.completed', msg => {
          if (msg.workflow_id === workflowId) handlers.onCompleted!(msg.payload)
        })
      )
    }

    if (handlers.onFailed) {
      unsubscribers.push(
        this.subscribe('workflow.failed', msg => {
          if (msg.workflow_id === workflowId) handlers.onFailed!(msg.payload)
        })
      )
    }

    // Return cleanup function
    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }

  /**
   * Get current connection status
   */
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  /**
   * Get current connection state
   */
  get connectionState(): 'connecting' | 'open' | 'closing' | 'closed' {
    switch (this.socket?.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'open'
      case WebSocket.CLOSING:
        return 'closing'
      default:
        return 'closed'
    }
  }

  // Private methods

  private handleMessage(message: WebSocketMessage): void {
    // Notify specific handlers
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message)
        } catch (error) {
          console.error('[WebSocket] Handler error:', error)
        }
      })
    }

    // Notify wildcard handlers
    const wildcardHandlers = this.messageHandlers.get('*')
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(message)
        } catch (error) {
          console.error('[WebSocket] Wildcard handler error:', error)
        }
      })
    }
  }

  private notifyConnectionHandlers(status: 'connected' | 'disconnected' | 'reconnecting'): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(status)
      } catch (error) {
        console.error('[WebSocket] Connection handler error:', error)
      }
    })
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached')
      return
    }

    this.clearReconnectTimeout()
    this.notifyConnectionHandlers('reconnecting')

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    )

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`)

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++
      this.connect(this.currentWorkflowId || undefined).catch(error => {
        console.error('[WebSocket] Reconnection failed:', error)
        this.scheduleReconnect()
      })
    }, delay)
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
      }
    }, 30000) // Ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private flushMessageBuffer(): void {
    while (this.messageBuffer.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
      const message = this.messageBuffer.shift()
      if (message) {
        this.socket.send(JSON.stringify(message))
      }
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService()

// Export types
export type { WebSocketEventType, WebSocketMessage, MessageHandler, ConnectionHandler }
