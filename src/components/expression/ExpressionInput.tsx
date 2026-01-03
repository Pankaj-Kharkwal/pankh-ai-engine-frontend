import React, { useState, useRef, useEffect } from 'react'
import { Code, Edit3, Check, X } from 'lucide-react'
import ExpressionEditor from './ExpressionEditor'
import { evaluateExpression } from '../../utils/expressionEngine'

interface ExpressionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  availableNodes?: Array<{
    id: string
    name: string
    type: string
    data?: any
  }>
  contextData?: Record<string, any>
  className?: string
  disabled?: boolean
}

export default function ExpressionInput({
  value,
  onChange,
  placeholder = 'Enter value or expression...',
  availableNodes = [],
  contextData = {},
  className = '',
  disabled = false,
}: ExpressionInputProps) {
  // Safely convert value to string to prevent crashes on non-string inputs
  const safeValue = typeof value === 'string' ? value : String(value ?? '')

  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(safeValue)
  const [isExpression, setIsExpression] = useState(safeValue.startsWith('$'))
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    error?: string
    result?: any
  }>({ isValid: true })

  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-detect if input is an expression
  useEffect(() => {
    setIsExpression(safeValue.startsWith('$'))
    setTempValue(safeValue)
  }, [safeValue])

  // Validate expressions
  useEffect(() => {
    if (isExpression && safeValue) {
      const result = evaluateExpression(
        safeValue,
        availableNodes,
        contextData.workflow,
        contextData.execution,
        contextData.items
      )
      setValidationResult({
        isValid: result.success,
        error: result.error,
        result: result.result,
      })
    } else {
      setValidationResult({ isValid: true })
    }
  }, [safeValue, isExpression, availableNodes, contextData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setTempValue(newValue)
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // If it looks like an expression, mark it as such
      if (typeof tempValue === 'string' && tempValue.startsWith('$')) {
        setIsExpression(true)
      }
    } else if (e.key === 'Escape') {
      setTempValue(safeValue)
      setIsEditing(false)
    }
  }

  const handleFocus = () => {
    setIsEditing(true)
    setTempValue(safeValue)
  }

  const handleBlur = () => {
    setIsEditing(false)
    // Keep the current value
  }

  const openExpressionEditor = () => {
    setTempValue(safeValue)
    setIsEditing(true)
  }

  const handleExpressionSave = (expression: string) => {
    onChange(expression)
    setIsExpression(true)
    setIsEditing(false)
  }

  const handleExpressionCancel = () => {
    setIsEditing(false)
  }

  const toggleExpressionMode = () => {
    if (isExpression) {
      // Switch to plain text
      setIsExpression(false)
    } else {
      // Switch to expression mode
      setIsExpression(true)
      if (!safeValue.startsWith('$')) {
        onChange(`$${safeValue}`)
      }
    }
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={isEditing ? tempValue : safeValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              flex-1 px-3 py-2 border rounded-l-md text-sm
              ${isExpression ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-white'}
              ${validationResult.isValid ? '' : 'border-red-300 bg-red-50'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-blue-500'}
              ${isEditing ? 'ring-2 ring-blue-500' : ''}
            `}
          />

          {/* Expression indicator and controls */}
          <div className="flex items-center border-l border-gray-300">
            {isExpression && (
              <div className="px-2 py-2 text-xs text-blue-600 font-medium">EXPR</div>
            )}

            <button
              type="button"
              onClick={toggleExpressionMode}
              className="px-2 py-2 text-gray-400 hover:text-gray-600 border-l border-gray-300 hover:bg-gray-50"
              title={isExpression ? 'Switch to plain text' : 'Switch to expression'}
            >
              {isExpression ? <Edit3 className="w-4 h-4" /> : <Code className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={openExpressionEditor}
              className="px-2 py-2 text-gray-400 hover:text-gray-600 border-l border-gray-300 hover:bg-gray-50 rounded-r-md"
              title="Open expression editor"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Validation feedback */}
        {isExpression && !validationResult.isValid && safeValue && (
          <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <X className="w-3 h-3" />
            {validationResult.error}
          </div>
        )}

        {isExpression && validationResult.isValid && validationResult.result !== undefined && (
          <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Result: {JSON.stringify(validationResult.result).slice(0, 50)}
            {JSON.stringify(validationResult.result).length > 50 && '...'}
          </div>
        )}
      </div>

      {/* Expression Editor Modal */}
      {isEditing && (
        <ExpressionEditor
          value={tempValue}
          onChange={setTempValue}
          onSave={handleExpressionSave}
          onCancel={handleExpressionCancel}
          availableNodes={availableNodes}
          contextData={contextData}
          title="Edit Expression"
        />
      )}
    </>
  )
}
