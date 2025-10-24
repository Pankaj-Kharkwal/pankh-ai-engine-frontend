/**
 * KeyboardShortcutsHelp - Dialog showing available keyboard shortcuts
 */

import React from 'react'
import { X, Keyboard } from 'lucide-react'
import { KeyboardShortcut, formatShortcut } from '../../hooks/useKeyboardShortcuts'

interface Props {
  shortcuts: KeyboardShortcut[]
  isOpen: boolean
  onClose: () => void
}

interface ShortcutCategory {
  name: string
  shortcuts: KeyboardShortcut[]
}

/**
 * Categorize shortcuts for better organization
 */
const categorizeShortcuts = (shortcuts: KeyboardShortcut[]): ShortcutCategory[] => {
  const categories: Record<string, KeyboardShortcut[]> = {
    Workflow: [],
    Editing: [],
    Navigation: [],
    Other: [],
  }

  shortcuts.forEach(shortcut => {
    const desc = shortcut.description.toLowerCase()

    if (desc.includes('save') || desc.includes('run')) {
      categories['Workflow'].push(shortcut)
    } else if (
      desc.includes('undo') ||
      desc.includes('redo') ||
      desc.includes('delete') ||
      desc.includes('copy') ||
      desc.includes('paste') ||
      desc.includes('duplicate') ||
      desc.includes('select')
    ) {
      categories['Editing'].push(shortcut)
    } else if (
      desc.includes('zoom') ||
      desc.includes('search') ||
      desc.includes('panel') ||
      desc.includes('toggle')
    ) {
      categories['Navigation'].push(shortcut)
    } else {
      categories['Other'].push(shortcut)
    }
  })

  return Object.entries(categories)
    .filter(([_, shortcuts]) => shortcuts.length > 0)
    .map(([name, shortcuts]) => ({ name, shortcuts }))
}

const KeyboardShortcutsHelp: React.FC<Props> = ({ shortcuts, isOpen, onClose }) => {
  if (!isOpen) return null

  const categories = categorizeShortcuts(shortcuts)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Keyboard className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {categories.map(category => (
            <div key={category.name}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{category.name}</h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div
                    key={`${category.name}-${index}`}
                    className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700">{shortcut.description}</span>
                    <kbd className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-800 shadow-sm">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {shortcuts.length === 0 && (
            <div className="text-center py-8 text-gray-500">No keyboard shortcuts available</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
          <p>
            <strong>Tip:</strong> Press{' '}
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
              Shift+?
            </kbd>{' '}
            to show/hide this help dialog
          </p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsHelp
