/**
 * CommandPalette - Quick command search and execution
 * Inspired by VSCode/Sublime Text command palette
 */

import React, { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Command, filterCommands, formatShortcut } from '../../hooks/useKeyboardShortcuts'

interface Props {
  commands: Command[]
  isOpen: boolean
  onClose: () => void
}

const CommandPalette: React.FC<Props> = ({ commands, isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredCommands = filterCommands(commands, query)

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : prev))
          break

        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0))
          break

        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex])
          }
          break

        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  const executeCommand = (command: Command) => {
    command.action()
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center z-50 pt-20"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 outline-none text-lg text-gray-900 placeholder-gray-400"
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Commands List */}
        <div ref={listRef} className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No commands found for "{query}"</div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => {
                const isSelected = index === selectedIndex

                return (
                  <button
                    key={command.id}
                    onClick={() => executeCommand(command)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 text-left
                      transition-colors
                      ${isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {command.icon && <div className="text-gray-600">{command.icon}</div>}
                      <div className="flex-1">
                        <div className="text-gray-900 font-medium">{command.label}</div>
                        {command.category && (
                          <div className="text-sm text-gray-500">{command.category}</div>
                        )}
                      </div>
                    </div>

                    {command.shortcut && (
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600">
                        {formatShortcut(command.shortcut)}
                      </kbd>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">
                Esc
              </kbd>
              Close
            </span>
          </div>
          <div className="text-xs">
            {filteredCommands.length} {filteredCommands.length === 1 ? 'command' : 'commands'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
