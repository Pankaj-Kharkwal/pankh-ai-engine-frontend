/**
 * React hook for WebSocket integration
 * Provides easy access to real-time updates in components
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  websocketService,
  WebSocketEventType,
  WebSocketMessage,
} from '../services/websocketService'

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'

interface UseWebSocketOptions {
  autoConnect?: boolean
  workflowId?: string
}

interface UseWebSocketReturn {
  isConnected: boolean
  connectionStatus: ConnectionStatus
  connect: (workflowId?: string) => Promise<void>
  disconnect: () => void
  subscribe: (eventType: WebSocketEventType | '*', handler: (msg: WebSocketMessage) => void) => void
  send: (message: object) => void
  lastMessage: WebSocketMessage | null
}

/**
 * Hook for WebSocket connection and messaging
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = false, workflowId } = options
  const [isConnected, setIsConnected] = useState(websocketService.isConnected)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const subscriptionsRef = useRef<(() => void)[]>([])

  // Handle connection status changes
  useEffect(() => {
    const unsubscribe = websocketService.onConnectionChange(status => {
      setConnectionStatus(status)
      setIsConnected(status === 'connected')
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect) {
      websocketService.connect(workflowId).catch(console.error)
    }

    return () => {
      // Cleanup subscriptions on unmount
      subscriptionsRef.current.forEach(unsub => unsub())
      subscriptionsRef.current = []
    }
  }, [autoConnect, workflowId])

  const connect = useCallback(async (wfId?: string) => {
    await websocketService.connect(wfId)
  }, [])

  const disconnect = useCallback(() => {
    websocketService.disconnect()
  }, [])

  const subscribe = useCallback(
    (eventType: WebSocketEventType | '*', handler: (msg: WebSocketMessage) => void) => {
      const wrappedHandler = (msg: WebSocketMessage) => {
        setLastMessage(msg)
        handler(msg)
      }
      const unsubscribe = websocketService.subscribe(eventType, wrappedHandler)
      subscriptionsRef.current.push(unsubscribe)
    },
    []
  )

  const send = useCallback((message: object) => {
    websocketService.send(message)
  }, [])

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    subscribe,
    send,
    lastMessage,
  }
}

/**
 * Hook for subscribing to workflow execution events
 */
export function useWorkflowExecution(
  workflowId: string | null,
  handlers: {
    onStarted?: (payload: any) => void
    onNodeStarted?: (nodeId: string, payload: any) => void
    onNodeCompleted?: (nodeId: string, payload: any) => void
    onNodeFailed?: (nodeId: string, error: any) => void
    onCompleted?: (payload: any) => void
    onFailed?: (error: any) => void
  }
) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState<{
    completedNodes: string[]
    failedNodes: string[]
    currentNode: string | null
  }>({
    completedNodes: [],
    failedNodes: [],
    currentNode: null,
  })

  useEffect(() => {
    if (!workflowId) return

    // Connect and subscribe to workflow events
    websocketService.connect(workflowId).catch(console.error)

    const unsubscribe = websocketService.subscribeToWorkflow(workflowId, {
      onStarted: payload => {
        setIsExecuting(true)
        setExecutionProgress({ completedNodes: [], failedNodes: [], currentNode: null })
        handlers.onStarted?.(payload)
      },
      onNodeStarted: (nodeId, payload) => {
        setExecutionProgress(prev => ({ ...prev, currentNode: nodeId }))
        handlers.onNodeStarted?.(nodeId, payload)
      },
      onNodeCompleted: (nodeId, payload) => {
        setExecutionProgress(prev => ({
          ...prev,
          completedNodes: [...prev.completedNodes, nodeId],
          currentNode: null,
        }))
        handlers.onNodeCompleted?.(nodeId, payload)
      },
      onNodeFailed: (nodeId, error) => {
        setExecutionProgress(prev => ({
          ...prev,
          failedNodes: [...prev.failedNodes, nodeId],
          currentNode: null,
        }))
        handlers.onNodeFailed?.(nodeId, error)
      },
      onCompleted: payload => {
        setIsExecuting(false)
        handlers.onCompleted?.(payload)
      },
      onFailed: error => {
        setIsExecuting(false)
        handlers.onFailed?.(error)
      },
    })

    return () => {
      unsubscribe()
    }
  }, [workflowId])

  return {
    isExecuting,
    executionProgress,
  }
}

export default useWebSocket
