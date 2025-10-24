import { useState, useCallback, useRef, useEffect } from 'react'
import type { Node, Edge } from '@xyflow/react'

export interface WorkflowState {
  nodes: Node[]
  edges: Edge[]
  nodeCounter: number
}

export interface UndoRedoState {
  past: WorkflowState[]
  present: WorkflowState
  future: WorkflowState[]
}

export interface UseUndoRedoReturn {
  state: WorkflowState
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  recordState: (newState: WorkflowState) => void
  reset: (initialState: WorkflowState) => void
  clearHistory: () => void
}

const MAX_HISTORY_SIZE = 50

export function useUndoRedo(initialState: WorkflowState): UseUndoRedoReturn {
  const [history, setHistory] = useState<UndoRedoState>({
    past: [],
    present: initialState,
    future: [],
  })

  const isRecordingRef = useRef(false)

  // Record a new state in history
  const recordState = useCallback((newState: WorkflowState) => {
    if (isRecordingRef.current) return

    setHistory(prevHistory => {
      // Don't record if the state hasn't actually changed
      if (
        JSON.stringify(prevHistory.present.nodes) === JSON.stringify(newState.nodes) &&
        JSON.stringify(prevHistory.present.edges) === JSON.stringify(newState.edges) &&
        prevHistory.present.nodeCounter === newState.nodeCounter
      ) {
        return prevHistory
      }

      const newPast = [...prevHistory.past, prevHistory.present]

      // Limit history size
      if (newPast.length > MAX_HISTORY_SIZE) {
        newPast.shift()
      }

      return {
        past: newPast,
        present: newState,
        future: [], // Clear future when recording new state
      }
    })
  }, [])

  // Undo the last action
  const undo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.past.length === 0) return prevHistory

      const previous = prevHistory.past[prevHistory.past.length - 1]
      const newPast = prevHistory.past.slice(0, -1)

      return {
        past: newPast,
        present: previous,
        future: [prevHistory.present, ...prevHistory.future],
      }
    })
  }, [])

  // Redo the last undone action
  const redo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.future.length === 0) return prevHistory

      const next = prevHistory.future[0]
      const newFuture = prevHistory.future.slice(1)

      return {
        past: [...prevHistory.past, prevHistory.present],
        present: next,
        future: newFuture,
      }
    })
  }, [])

  // Reset to initial state
  const reset = useCallback((newInitialState: WorkflowState) => {
    setHistory({
      past: [],
      present: newInitialState,
      future: [],
    })
  }, [])

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory(prevHistory => ({
      past: [],
      present: prevHistory.present,
      future: [],
    }))
  }, [])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return
      }

      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault()
          undo()
        } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault()
          redo()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return {
    state: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undo,
    redo,
    recordState,
    reset,
    clearHistory,
  }
}

// Helper hook for workflow-specific undo/redo
export function useWorkflowUndoRedo(
  nodes: Node[],
  edges: Edge[],
  nodeCounter: number,
  onStateChange: (state: WorkflowState) => void
) {
  const initialState: WorkflowState = {
    nodes: nodes || [],
    edges: edges || [],
    nodeCounter: nodeCounter || 0,
  }

  const { state, canUndo, canRedo, undo, redo, recordState, reset, clearHistory } =
    useUndoRedo(initialState)

  // Record current state
  const recordCurrentState = useCallback(() => {
    recordState({
      nodes: nodes || [],
      edges: edges || [],
      nodeCounter: nodeCounter || 0,
    })
  }, [nodes, edges, nodeCounter, recordState])

  // Apply state change
  const applyState = useCallback(
    (newState: WorkflowState) => {
      onStateChange(newState)
    },
    [onStateChange]
  )

  // Enhanced undo that applies the state
  const undoWithApply = useCallback(() => {
    undo()
    applyState(state)
  }, [undo, state, applyState])

  // Enhanced redo that applies the state
  const redoWithApply = useCallback(() => {
    redo()
    applyState(state)
  }, [redo, state, applyState])

  return {
    canUndo,
    canRedo,
    undo: undoWithApply,
    redo: redoWithApply,
    recordState: recordCurrentState,
    reset,
    clearHistory,
  }
}
