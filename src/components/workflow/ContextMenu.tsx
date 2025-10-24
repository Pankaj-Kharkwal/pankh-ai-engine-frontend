import React, { useEffect, useRef } from 'react'
import {
  Copy,
  Scissors,
  Trash2,
  Settings,
  Play,
  Square,
  Eye,
  EyeOff,
  Zap,
  MoreHorizontal,
} from 'lucide-react'

interface ContextMenuItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  action: () => void
  disabled?: boolean
  separator?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Position the menu within viewport bounds
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - (items.length * 40 + 20)),
    zIndex: 1000,
  }

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled) {
      item.action()
      onClose()
    }
  }

  return (
    <div
      ref={menuRef}
      className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] max-w-[300px]"
      style={menuStyle}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {item.separator && index > 0 && <div className="border-t border-gray-100 my-1" />}
          <button
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={`
              w-full px-3 py-2 text-left flex items-center space-x-3 hover:bg-gray-50
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
              text-sm text-gray-700
            `}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  )
}

// Predefined context menu configurations
export const createNodeContextMenu = (
  nodeId: string,
  nodeType: string,
  onConfigure: (nodeId: string) => void,
  onExecute: (nodeId: string) => void,
  onDelete: (nodeId: string) => void,
  onDuplicate: (nodeId: string) => void,
  onCopy: (nodeId: string) => void,
  onCut: (nodeId: string) => void,
  onDisable: (nodeId: string) => void,
  isDisabled: boolean = false
): ContextMenuItem[] => [
  {
    id: 'configure',
    label: 'Configure',
    icon: Settings,
    action: () => onConfigure(nodeId),
  },
  {
    id: 'execute',
    label: 'Execute Node',
    icon: Play,
    action: () => onExecute(nodeId),
  },
  {
    id: 'separator1',
    label: '',
    icon: MoreHorizontal,
    action: () => {},
    separator: true,
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    action: () => onDuplicate(nodeId),
  },
  {
    id: 'copy',
    label: 'Copy',
    icon: Copy,
    action: () => onCopy(nodeId),
  },
  {
    id: 'cut',
    label: 'Cut',
    icon: Scissors,
    action: () => onCut(nodeId),
  },
  {
    id: 'separator2',
    label: '',
    icon: MoreHorizontal,
    action: () => {},
    separator: true,
  },
  {
    id: 'disable',
    label: isDisabled ? 'Enable' : 'Disable',
    icon: isDisabled ? Eye : EyeOff,
    action: () => onDisable(nodeId),
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    action: () => onDelete(nodeId),
  },
]

export const createCanvasContextMenu = (
  onPaste: () => void,
  onSelectAll: () => void,
  onClearSelection: () => void,
  canPaste: boolean = false
): ContextMenuItem[] => [
  {
    id: 'paste',
    label: 'Paste',
    icon: Copy,
    action: onPaste,
    disabled: !canPaste,
  },
  {
    id: 'separator1',
    label: '',
    icon: MoreHorizontal,
    action: () => {},
    separator: true,
  },
  {
    id: 'select-all',
    label: 'Select All',
    icon: Square,
    action: onSelectAll,
  },
  {
    id: 'clear-selection',
    label: 'Clear Selection',
    icon: Square,
    action: onClearSelection,
  },
]

export const createEdgeContextMenu = (
  edgeId: string,
  onDelete: (edgeId: string) => void
): ContextMenuItem[] => [
  {
    id: 'delete',
    label: 'Delete Connection',
    icon: Trash2,
    action: () => onDelete(edgeId),
  },
]
