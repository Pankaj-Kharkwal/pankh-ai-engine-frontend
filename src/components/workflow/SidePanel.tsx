import React from 'react'
import type { Node } from '@xyflow/react'
import BlockParameterForm from '../blocks/BlockParameterForm'

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  selectedBlock: Node | null
  onSave: (parameters: any) => void
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, selectedBlock, onSave }) => {
  if (!isOpen || !selectedBlock) {
    return null
  }

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-lg z-10">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">{selectedBlock.data.label}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          &times;
        </button>
      </div>
      <div className="p-4">
        {selectedBlock.data.schema?.config?.properties ? (
          <BlockParameterForm
            schema={selectedBlock.data.schema.config.properties}
            values={selectedBlock.data.parameters}
            onChange={newParams => {
              // This should ideally be handled by a state management library
              // For now, we'll just log the changes
              console.log(newParams)
            }}
          />
        ) : (
          <p>No configurable parameters for this block.</p>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
        <button
          onClick={() => onSave(selectedBlock.data.parameters)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default SidePanel
