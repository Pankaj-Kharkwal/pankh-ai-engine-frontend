import React, { useState, useEffect } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Hash,
  Type,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react'
import ExpressionInput from '../expression/ExpressionInput'

interface ParameterSchema {
  type: string
  title?: string
  description?: string
  default?: any
  required?: boolean
  enum?: string[]
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
  properties?: { [key: string]: ParameterSchema }
  items?: ParameterSchema
}

interface BlockParameterFormProps {
  schema: { [key: string]: ParameterSchema }
  values: { [key: string]: any }
  onChange: (values: { [key: string]: any }) => void
  disabled?: boolean
  availableNodes?: Array<{
    id: string
    name: string
    type: string
    data?: any
  }>
  contextData?: Record<string, any>
}

const BlockParameterForm: React.FC<BlockParameterFormProps> = ({
  schema,
  values,
  onChange,
  disabled = false,
  availableNodes = [],
  contextData = {},
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSections(newExpanded)
  }

  const validateField = (key: string, value: any, fieldSchema: ParameterSchema): string | null => {
    if (fieldSchema.required && (value === undefined || value === null || value === '')) {
      return `${fieldSchema.title || key} is required`
    }

    if (value !== undefined && value !== null && value !== '') {
      if (fieldSchema.type === 'string') {
        // Type guard: ensure value is a string before calling string methods
        const strValue = typeof value === 'string' ? value : String(value)
        if (fieldSchema.minLength && strValue.length < fieldSchema.minLength) {
          return `Minimum length is ${fieldSchema.minLength}`
        }
        if (fieldSchema.maxLength && strValue.length > fieldSchema.maxLength) {
          return `Maximum length is ${fieldSchema.maxLength}`
        }
        if (fieldSchema.pattern && !new RegExp(fieldSchema.pattern).test(strValue)) {
          return 'Invalid format'
        }
      }

      if (fieldSchema.type === 'number' || fieldSchema.type === 'integer') {
        const numValue = Number(value)
        if (isNaN(numValue)) {
          return 'Must be a valid number'
        }
        if (fieldSchema.minimum !== undefined && numValue < fieldSchema.minimum) {
          return `Minimum value is ${fieldSchema.minimum}`
        }
        if (fieldSchema.maximum !== undefined && numValue > fieldSchema.maximum) {
          return `Maximum value is ${fieldSchema.maximum}`
        }
      }

      if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
        return `Must be one of: ${fieldSchema.enum.join(', ')}`
      }
    }

    return null
  }

  const updateValue = (key: string, value: any) => {
    const newValues = { ...values, [key]: value }
    onChange(newValues)

    // Validate the field
    const fieldSchema = schema[key]
    if (fieldSchema) {
      const error = validateField(key, value, fieldSchema)
      setErrors(prev => ({
        ...prev,
        [key]: error || '',
      }))
    }
  }

  const renderArrayField = (key: string, fieldSchema: ParameterSchema) => {
    const arrayValue = values[key] || []
    const isExpanded = expandedSections.has(key)

    const addItem = () => {
      const newItem = fieldSchema.items?.type === 'object' ? {} : ''
      updateValue(key, [...arrayValue, newItem])
    }

    const removeItem = (index: number) => {
      const newArray = arrayValue.filter((_: any, i: number) => i !== index)
      updateValue(key, newArray)
    }

    const updateItem = (index: number, itemValue: any) => {
      const newArray = [...arrayValue]
      newArray[index] = itemValue
      updateValue(key, newArray)
    }

    return (
      <div className="space-y-2">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => toggleSection(key)}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <label className="text-sm font-medium text-gray-700">
            {fieldSchema.title || key}
            {fieldSchema.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              addItem()
            }}
            disabled={disabled}
            className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {fieldSchema.description && (
          <p className="text-xs text-gray-500">{fieldSchema.description}</p>
        )}

        {isExpanded && (
          <div className="pl-6 space-y-2">
            {arrayValue.map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  {fieldSchema.items?.type === 'object' ? (
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <BlockParameterForm
                        schema={fieldSchema.items.properties || {}}
                        values={item}
                        onChange={newValues => updateItem(index, newValues)}
                        disabled={disabled}
                      />
                    </div>
                  ) : (
                    renderBasicField(
                      `${key}[${index}]`,
                      fieldSchema.items || { type: 'string' },
                      item,
                      value => updateItem(index, value)
                    )
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={disabled}
                  className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {errors[key] && (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">{errors[key]}</span>
          </div>
        )}
      </div>
    )
  }

  const renderObjectField = (key: string, fieldSchema: ParameterSchema) => {
    const isExpanded = expandedSections.has(key)
    const objectValue = values[key] || {}

    return (
      <div className="space-y-2">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => toggleSection(key)}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <label className="text-sm font-medium text-gray-700">
            {fieldSchema.title || key}
            {fieldSchema.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>

        {fieldSchema.description && (
          <p className="text-xs text-gray-500">{fieldSchema.description}</p>
        )}

        {isExpanded && (
          <div className="pl-6 p-3 border border-gray-200 rounded-lg">
            <BlockParameterForm
              schema={fieldSchema.properties || {}}
              values={objectValue}
              onChange={newValues => updateValue(key, newValues)}
              disabled={disabled}
            />
          </div>
        )}

        {errors[key] && (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">{errors[key]}</span>
          </div>
        )}
      </div>
    )
  }

  const renderBasicField = (
    key: string,
    fieldSchema: ParameterSchema,
    value?: any,
    onUpdate?: (value: any) => void
  ) => {
    const fieldValue = value !== undefined ? value : (values[key] ?? fieldSchema.default ?? '')
    const updateFn = onUpdate || ((newValue: any) => updateValue(key, newValue))

    const getInputIcon = () => {
      switch (fieldSchema.type) {
        case 'string':
          if (fieldSchema.format === 'date') return <Calendar className="w-4 h-4" />
          if (fieldSchema.format === 'time') return <Clock className="w-4 h-4" />
          if (fieldSchema.format === 'password') return <Eye className="w-4 h-4" />
          return <Type className="w-4 h-4" />
        case 'number':
        case 'integer':
          return <Hash className="w-4 h-4" />
        default:
          return null
      }
    }

    if (fieldSchema.enum) {
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {fieldSchema.title || key}
            {fieldSchema.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {fieldSchema.description && (
            <p className="text-xs text-gray-500">{fieldSchema.description}</p>
          )}
          <select
            value={fieldValue}
            onChange={e => updateFn(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100 text-gray-900 bg-white"
          >
            <option value="">Select an option</option>
            {fieldSchema.enum.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors[key] && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">{errors[key]}</span>
            </div>
          )}
        </div>
      )
    }

    if (fieldSchema.type === 'boolean') {
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {fieldSchema.title || key}
            {fieldSchema.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {fieldSchema.description && (
            <p className="text-xs text-gray-500">{fieldSchema.description}</p>
          )}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => updateFn(!fieldValue)}
              disabled={disabled}
              className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {fieldValue ? (
                <ToggleRight className="w-5 h-5 text-blue-600" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">{fieldValue ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>
          {errors[key] && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">{errors[key]}</span>
            </div>
          )}
        </div>
      )
    }

    // Use ExpressionInput for string fields
    if (fieldSchema.type === 'string' && !fieldSchema.enum) {
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {fieldSchema.title || key}
            {fieldSchema.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {fieldSchema.description && (
            <p className="text-xs text-gray-500">{fieldSchema.description}</p>
          )}
          <ExpressionInput
            value={fieldValue}
            onChange={updateFn}
            placeholder={fieldSchema.title || key}
            availableNodes={availableNodes}
            contextData={contextData}
            disabled={disabled}
          />
          {errors[key] && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">{errors[key]}</span>
            </div>
          )}
        </div>
      )
    }

    const inputType =
      fieldSchema.format === 'password'
        ? 'password'
        : fieldSchema.format === 'date'
          ? 'date'
          : fieldSchema.format === 'time'
            ? 'time'
            : fieldSchema.type === 'number' || fieldSchema.type === 'integer'
              ? 'number'
              : 'text'

    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          {fieldSchema.title || key}
          {fieldSchema.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {fieldSchema.description && (
          <p className="text-xs text-gray-500">{fieldSchema.description}</p>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {getInputIcon()}
          </div>
          <input
            type={inputType}
            value={fieldValue}
            onChange={e => {
              let newValue = e.target.value
              if (fieldSchema.type === 'number' || fieldSchema.type === 'integer') {
                newValue = newValue === '' ? '' : Number(newValue)
              }
              updateFn(newValue)
            }}
            disabled={disabled}
            min={fieldSchema.minimum}
            max={fieldSchema.maximum}
            minLength={fieldSchema.minLength}
            maxLength={fieldSchema.maxLength}
            pattern={fieldSchema.pattern}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100 text-gray-900 bg-white"
            placeholder={fieldSchema.title || key}
          />
        </div>
        {errors[key] && (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">{errors[key]}</span>
          </div>
        )}
      </div>
    )
  }

  if (!schema || Object.keys(schema).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No parameters configured for this block</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(schema).map(([key, fieldSchema]) => (
        <div key={key}>
          {fieldSchema.type === 'array' && renderArrayField(key, fieldSchema)}
          {fieldSchema.type === 'object' && renderObjectField(key, fieldSchema)}
          {!['array', 'object'].includes(fieldSchema.type) && renderBasicField(key, fieldSchema)}
        </div>
      ))}
    </div>
  )
}

export default BlockParameterForm
