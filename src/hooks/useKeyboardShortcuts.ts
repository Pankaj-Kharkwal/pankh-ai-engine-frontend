/**
 * useKeyboardShortcuts - Centralized keyboard shortcut management
 *
 * Provides a composable hook for registering and handling keyboard shortcuts
 * with proper cleanup and prevention of conflicts.
 */

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description: string
  action: () => void
  preventDefault?: boolean
}

export interface KeyboardShortcutConfig {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

/**
 * Check if a keyboard event matches a shortcut definition
 */
const matchesShortcut = (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
  const ctrlMatch = shortcut.ctrl
    ? event.ctrlKey || event.metaKey
    : !event.ctrlKey && !event.metaKey
  const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
  const altMatch = shortcut.alt ? event.altKey : !event.altKey
  const metaMatch = shortcut.meta ? event.metaKey : true // Meta is optional

  return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch
}

/**
 * Format shortcut for display (e.g., "Ctrl+S", "Ctrl+Shift+P")
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = []

  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.alt) parts.push('Alt')
  if (shortcut.meta) parts.push('Meta')
  parts.push(shortcut.key.toUpperCase())

  return parts.join('+')
}

/**
 * Hook for registering keyboard shortcuts
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 's',
 *       ctrl: true,
 *       description: 'Save workflow',
 *       action: handleSave,
 *     },
 *     {
 *       key: 'z',
 *       ctrl: true,
 *       description: 'Undo',
 *       action: handleUndo,
 *     },
 *   ],
 *   enabled: true,
 * });
 * ```
 */
export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: KeyboardShortcutConfig) => {
  const shortcutsRef = useRef(shortcuts)

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't intercept if user is typing in an input field
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      for (const shortcut of shortcutsRef.current) {
        if (matchesShortcut(event, shortcut)) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.action()
          break // Only execute first matching shortcut
        }
      }
    },
    [enabled]
  )

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])

  return {
    shortcuts: shortcutsRef.current,
    formatShortcut,
  }
}

/**
 * Workflow Builder specific shortcuts
 */
export const useWorkflowBuilderShortcuts = (actions: {
  onSave?: () => void
  onRun?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onSelectAll?: () => void
  onCopy?: () => void
  onPaste?: () => void
  onSearch?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomReset?: () => void
  onTogglePanel?: () => void
  onHelp?: () => void
}) => {
  const shortcuts: KeyboardShortcut[] = []

  if (actions.onSave) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      description: 'Save workflow',
      action: actions.onSave,
    })
  }

  if (actions.onRun) {
    shortcuts.push({
      key: 'r',
      ctrl: true,
      description: 'Run workflow',
      action: actions.onRun,
    })
  }

  if (actions.onUndo) {
    shortcuts.push({
      key: 'z',
      ctrl: true,
      description: 'Undo',
      action: actions.onUndo,
    })
  }

  if (actions.onRedo) {
    shortcuts.push({
      key: 'y',
      ctrl: true,
      description: 'Redo',
      action: actions.onRedo,
    })
    shortcuts.push({
      key: 'z',
      ctrl: true,
      shift: true,
      description: 'Redo (alternative)',
      action: actions.onRedo,
    })
  }

  if (actions.onDelete) {
    shortcuts.push({
      key: 'Delete',
      description: 'Delete selected nodes',
      action: actions.onDelete,
      preventDefault: true,
    })
    shortcuts.push({
      key: 'Backspace',
      description: 'Delete selected nodes (alternative)',
      action: actions.onDelete,
      preventDefault: true,
    })
  }

  if (actions.onDuplicate) {
    shortcuts.push({
      key: 'd',
      ctrl: true,
      description: 'Duplicate selected nodes',
      action: actions.onDuplicate,
    })
  }

  if (actions.onSelectAll) {
    shortcuts.push({
      key: 'a',
      ctrl: true,
      description: 'Select all nodes',
      action: actions.onSelectAll,
    })
  }

  if (actions.onCopy) {
    shortcuts.push({
      key: 'c',
      ctrl: true,
      description: 'Copy selected nodes',
      action: actions.onCopy,
    })
  }

  if (actions.onPaste) {
    shortcuts.push({
      key: 'v',
      ctrl: true,
      description: 'Paste nodes',
      action: actions.onPaste,
    })
  }

  if (actions.onSearch) {
    shortcuts.push({
      key: 'f',
      ctrl: true,
      description: 'Search blocks',
      action: actions.onSearch,
    })
    shortcuts.push({
      key: 'k',
      ctrl: true,
      description: 'Command palette',
      action: actions.onSearch,
    })
  }

  if (actions.onZoomIn) {
    shortcuts.push({
      key: '=',
      ctrl: true,
      description: 'Zoom in',
      action: actions.onZoomIn,
    })
    shortcuts.push({
      key: '+',
      ctrl: true,
      description: 'Zoom in (alternative)',
      action: actions.onZoomIn,
    })
  }

  if (actions.onZoomOut) {
    shortcuts.push({
      key: '-',
      ctrl: true,
      description: 'Zoom out',
      action: actions.onZoomOut,
    })
  }

  if (actions.onZoomReset) {
    shortcuts.push({
      key: '0',
      ctrl: true,
      description: 'Reset zoom',
      action: actions.onZoomReset,
    })
  }

  if (actions.onTogglePanel) {
    shortcuts.push({
      key: 'b',
      ctrl: true,
      description: 'Toggle side panel',
      action: actions.onTogglePanel,
    })
  }

  if (actions.onHelp) {
    shortcuts.push({
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: actions.onHelp,
    })
  }

  return useKeyboardShortcuts({ shortcuts })
}

/**
 * Command palette entry
 */
export interface Command {
  id: string
  label: string
  shortcut?: KeyboardShortcut
  category?: string
  action: () => void
  icon?: React.ReactNode
}

/**
 * Search and filter commands
 */
export const filterCommands = (commands: Command[], query: string): Command[] => {
  if (!query) return commands

  const lowerQuery = query.toLowerCase()
  return commands.filter(cmd => {
    const labelMatch = cmd.label.toLowerCase().includes(lowerQuery)
    const categoryMatch = cmd.category?.toLowerCase().includes(lowerQuery)
    const shortcutMatch =
      cmd.shortcut && formatShortcut(cmd.shortcut).toLowerCase().includes(lowerQuery)

    return labelMatch || categoryMatch || shortcutMatch
  })
}
