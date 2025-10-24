# Keyboard Shortcuts Integration Guide

## Overview

This guide shows how to integrate keyboard shortcuts into the WorkflowBuilder component.

## Quick Integration

### 1. Import Required Hooks and Components

```tsx
import { useWorkflowBuilderShortcuts } from '../../hooks/useKeyboardShortcuts'
import KeyboardShortcutsHelp from '../../components/workflow/KeyboardShortcutsHelp'
import CommandPalette from '../../components/workflow/CommandPalette'
import type { Command } from '../../hooks/useKeyboardShortcuts'
```

### 2. Add State for UI Components

```tsx
const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
const [showCommandPalette, setShowCommandPalette] = useState(false)
```

### 3. Set Up Keyboard Shortcuts Hook

```tsx
const { shortcuts } = useWorkflowBuilderShortcuts({
  onSave: handleSaveWorkflow,
  onRun: handleRunWorkflow,
  onUndo: undo,
  onRedo: redo,
  onDelete: handleDeleteSelected,
  onDuplicate: handleDuplicateSelected,
  onSelectAll: handleSelectAll,
  onCopy: handleCopy,
  onPaste: handlePaste,
  onSearch: () => setShowCommandPalette(true),
  onZoomIn: handleZoomIn,
  onZoomOut: handleZoomOut,
  onZoomReset: handleZoomReset,
  onTogglePanel: handleTogglePanel,
  onHelp: () => setShowShortcutsHelp(!showShortcutsHelp),
})
```

### 4. Define Commands for Command Palette

```tsx
const commands: Command[] = [
  {
    id: 'save',
    label: 'Save Workflow',
    category: 'Workflow',
    action: handleSaveWorkflow,
    shortcut: shortcuts.find(s => s.description === 'Save workflow'),
    icon: <Save className="w-4 h-4" />,
  },
  {
    id: 'run',
    label: 'Run Workflow',
    category: 'Workflow',
    action: handleRunWorkflow,
    shortcut: shortcuts.find(s => s.description === 'Run workflow'),
    icon: <Play className="w-4 h-4" />,
  },
  {
    id: 'undo',
    label: 'Undo',
    category: 'Editing',
    action: undo,
    shortcut: shortcuts.find(s => s.description === 'Undo'),
    icon: <Undo className="w-4 h-4" />,
  },
  {
    id: 'redo',
    label: 'Redo',
    category: 'Editing',
    action: redo,
    shortcut: shortcuts.find(s => s.description === 'Redo'),
    icon: <Redo className="w-4 h-4" />,
  },
  // Add more commands...
]
```

### 5. Add UI Components to Render

```tsx
return (
  <div className="workflow-builder">
    {/* Existing workflow builder UI */}

    {/* Keyboard Shortcuts Help Dialog */}
    <KeyboardShortcutsHelp
      shortcuts={shortcuts}
      isOpen={showShortcutsHelp}
      onClose={() => setShowShortcutsHelp(false)}
    />

    {/* Command Palette */}
    <CommandPalette
      commands={commands}
      isOpen={showCommandPalette}
      onClose={() => setShowCommandPalette(false)}
    />
  </div>
)
```

## Complete Example Implementation

```tsx
import React, { useState } from 'react'
import { Save, Play, Undo, Redo, Trash, Copy, Search } from 'lucide-react'
import { useWorkflowBuilderShortcuts } from '../../hooks/useKeyboardShortcuts'
import KeyboardShortcutsHelp from '../../components/workflow/KeyboardShortcutsHelp'
import CommandPalette from '../../components/workflow/CommandPalette'
import type { Command } from '../../hooks/useKeyboardShortcuts'

const WorkflowBuilder = () => {
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)

  // Example handler functions
  const handleSaveWorkflow = () => {
    console.log('Saving workflow...')
  }

  const handleRunWorkflow = () => {
    console.log('Running workflow...')
  }

  const handleUndo = () => {
    console.log('Undo')
  }

  const handleRedo = () => {
    console.log('Redo')
  }

  const handleDeleteSelected = () => {
    console.log('Delete selected nodes')
  }

  const handleDuplicateSelected = () => {
    console.log('Duplicate selected nodes')
  }

  const handleSelectAll = () => {
    console.log('Select all nodes')
  }

  const handleCopy = () => {
    console.log('Copy selected')
  }

  const handlePaste = () => {
    console.log('Paste')
  }

  const handleZoomIn = () => {
    console.log('Zoom in')
  }

  const handleZoomOut = () => {
    console.log('Zoom out')
  }

  const handleZoomReset = () => {
    console.log('Reset zoom')
  }

  const handleTogglePanel = () => {
    console.log('Toggle panel')
  }

  // Register keyboard shortcuts
  const { shortcuts } = useWorkflowBuilderShortcuts({
    onSave: handleSaveWorkflow,
    onRun: handleRunWorkflow,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDelete: handleDeleteSelected,
    onDuplicate: handleDuplicateSelected,
    onSelectAll: handleSelectAll,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onSearch: () => setShowCommandPalette(true),
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onZoomReset: handleZoomReset,
    onTogglePanel: handleTogglePanel,
    onHelp: () => setShowShortcutsHelp(!showShortcutsHelp),
  })

  // Define commands for palette
  const commands: Command[] = [
    {
      id: 'save',
      label: 'Save Workflow',
      category: 'Workflow',
      action: handleSaveWorkflow,
      shortcut: shortcuts.find(s => s.description === 'Save workflow'),
      icon: <Save className="w-4 h-4" />,
    },
    {
      id: 'run',
      label: 'Run Workflow',
      category: 'Workflow',
      action: handleRunWorkflow,
      shortcut: shortcuts.find(s => s.description === 'Run workflow'),
      icon: <Play className="w-4 h-4" />,
    },
    {
      id: 'undo',
      label: 'Undo',
      category: 'Editing',
      action: handleUndo,
      shortcut: shortcuts.find(s => s.description === 'Undo'),
      icon: <Undo className="w-4 h-4" />,
    },
    {
      id: 'redo',
      label: 'Redo',
      category: 'Editing',
      action: handleRedo,
      shortcut: shortcuts.find(s => s.description === 'Redo'),
      icon: <Redo className="w-4 h-4" />,
    },
    {
      id: 'delete',
      label: 'Delete Selected',
      category: 'Editing',
      action: handleDeleteSelected,
      shortcut: shortcuts.find(s => s.description === 'Delete selected nodes'),
      icon: <Trash className="w-4 h-4" />,
    },
    {
      id: 'duplicate',
      label: 'Duplicate Selected',
      category: 'Editing',
      action: handleDuplicateSelected,
      shortcut: shortcuts.find(s => s.description === 'Duplicate selected nodes'),
      icon: <Copy className="w-4 h-4" />,
    },
    {
      id: 'search',
      label: 'Search Blocks',
      category: 'Navigation',
      action: () => setShowCommandPalette(true),
      shortcut: shortcuts.find(s => s.description === 'Search blocks'),
      icon: <Search className="w-4 h-4" />,
    },
  ]

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Workflow Builder</h1>
        <button
          onClick={() => setShowShortcutsHelp(true)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Keyboard Shortcuts (Shift+?)
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1">{/* Your workflow canvas goes here */}</main>

      {/* Keyboard Shortcuts Help Dialog */}
      <KeyboardShortcutsHelp
        shortcuts={shortcuts}
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />

      {/* Command Palette */}
      <CommandPalette
        commands={commands}
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
    </div>
  )
}

export default WorkflowBuilder
```

## Available Shortcuts

### Workflow Actions

- **Ctrl+S** - Save workflow
- **Ctrl+R** - Run workflow

### Editing

- **Ctrl+Z** - Undo
- **Ctrl+Y** or **Ctrl+Shift+Z** - Redo
- **Delete** or **Backspace** - Delete selected nodes
- **Ctrl+D** - Duplicate selected nodes
- **Ctrl+A** - Select all nodes
- **Ctrl+C** - Copy selected nodes
- **Ctrl+V** - Paste nodes

### Navigation

- **Ctrl+F** or **Ctrl+K** - Search blocks / Command palette
- **Ctrl+=** or **Ctrl++** - Zoom in
- **Ctrl+-** - Zoom out
- **Ctrl+0** - Reset zoom
- **Ctrl+B** - Toggle side panel
- **Shift+?** - Show keyboard shortcuts help

## Customization

### Adding New Shortcuts

To add a new shortcut, update the `useWorkflowBuilderShortcuts` call:

```tsx
const { shortcuts } = useWorkflowBuilderShortcuts({
  // Existing shortcuts...
  onMyCustomAction: handleMyCustomAction,
})
```

Then add the corresponding command to the command palette:

```tsx
const commands: Command[] = [
  // Existing commands...
  {
    id: 'my-custom-action',
    label: 'My Custom Action',
    category: 'Custom',
    action: handleMyCustomAction,
    icon: <MyIcon className="w-4 h-4" />,
  },
]
```

### Disabling Shortcuts

To temporarily disable shortcuts:

```tsx
const { shortcuts } = useKeyboardShortcuts({
  shortcuts: myShortcuts,
  enabled: !isModalOpen, // Disable when modal is open
})
```

## Tips

1. **Command Palette** - Use Ctrl+K for quick access to all actions
2. **Context-Aware** - Shortcuts don't trigger when typing in input fields
3. **Help Dialog** - Press Shift+? anytime to see available shortcuts
4. **Searchable** - Command palette supports fuzzy search
5. **Customizable** - Easy to add/remove shortcuts as needed

## Testing

To test keyboard shortcuts:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import WorkflowBuilder from './WorkflowBuilder'

test('saves workflow with Ctrl+S', () => {
  const { container } = render(<WorkflowBuilder />)

  fireEvent.keyDown(container, {
    key: 's',
    ctrlKey: true,
  })

  // Assert that save function was called
})
```
