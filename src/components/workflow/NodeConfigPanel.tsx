import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Settings,
  FileJson,
  TestTube,
  Save,
  Loader2,
  Zap,
  AlertCircle,
  BookmarkPlus,
  Bookmark,
  Trash2,
} from 'lucide-react'
import { apiClient } from '../../services/api'
import BlockParameterForm from '../blocks/BlockParameterForm'
import BlockIOSchema from '../blocks/BlockIOSchema'
import { BlockTestForm } from '../blocks/BlockTestForm'

type ActiveTab = 'configure' | 'io' | 'test'

interface ParameterPreset {
  name: string
  description?: string
  parameters: Record<string, any>
  createdAt: string
}

interface NodeConfigPanelProps {
  nodeId: string | null
  node: any
  availableNodes?: any[]
  workflowEnvVars?: Record<string, any>
  onUpdate: (nodeId: string, update: any) => void
  onClose: () => void
}

const tabConfig: Record<
  ActiveTab,
  { label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }
> = {
  configure: { label: 'Configuration', icon: Settings },
  io: { label: 'I/O Schema', icon: FileJson },
  test: { label: 'Test & Validate', icon: TestTube },
}

const fallbackConfig = {}

export default function NodeConfigPanel({
  nodeId,
  node,
  availableNodes = [],
  workflowEnvVars = {},
  onUpdate,
  onClose,
}: NodeConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('configure')
  const [schema, setSchema] = useState<any>(null)
  const [loadingSchema, setLoadingSchema] = useState(false)
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [config, setConfig] = useState<Record<string, any>>(fallbackConfig)
  const [presets, setPresets] = useState<ParameterPreset[]>([])
  const [showPresetDialog, setShowPresetDialog] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetDescription, setPresetDescription] = useState('')

  const blockType = node?.data?.blockType
  const blockId = node?.data?.blockId || node?.data?.block_id
  const blockIdentifier = blockId || blockType
  const presetKey = blockType || blockId
  const blockLabel = node?.data?.label || blockType || blockId

  // Load presets from localStorage
  useEffect(() => {
    if (presetKey) {
      const savedPresets = localStorage.getItem(`presets_${presetKey}`)
      if (savedPresets) {
        try {
          setPresets(JSON.parse(savedPresets))
        } catch (e) {
          console.error('Failed to load presets:', e)
        }
      }
    }
  }, [presetKey])

  // Save preset
  const handleSavePreset = () => {
    if (!presetName.trim() || !presetKey) return

    const newPreset: ParameterPreset = {
      name: presetName.trim(),
      description: presetDescription.trim(),
      parameters: { ...config },
      createdAt: new Date().toISOString(),
    }

    const updatedPresets = [...presets, newPreset]
    setPresets(updatedPresets)
    localStorage.setItem(`presets_${presetKey}`, JSON.stringify(updatedPresets))

    setPresetName('')
    setPresetDescription('')
    setShowPresetDialog(false)
  }

  // Load preset
  const handleLoadPreset = (preset: ParameterPreset) => {
    setConfig(preset.parameters)
  }

  // Delete preset
  const handleDeletePreset = (index: number) => {
    const updatedPresets = presets.filter((_, i) => i !== index)
    setPresets(updatedPresets)
    if (presetKey) {
      localStorage.setItem(`presets_${presetKey}`, JSON.stringify(updatedPresets))
    }
  }

  useEffect(() => {
    setConfig(node?.data?.config || node?.data?.parameters || fallbackConfig)
    if (!blockIdentifier) {
      setSchema(null)
      setSchemaError('Select a block type to configure this node.')
      return
    }

    let mounted = true
    const loadSchema = async () => {
      setLoadingSchema(true)
      setSchemaError(null)
      try {
        const blockSchema = await apiClient.getBlockSchema(blockIdentifier)
        if (mounted) {
          setSchema(blockSchema)
        }
      } catch (error) {
        console.error('Failed to load block schema:', error)
        if (mounted) {
          setSchemaError('Unable to load block schema. Please try again.')
        }
      } finally {
        if (mounted) {
          setLoadingSchema(false)
        }
      }
    }

    loadSchema()
    return () => {
      mounted = false
    }
  }, [nodeId, blockIdentifier, node?.data?.config, node?.data?.parameters])

  const parameterSchema = useMemo(() => {
    // Try new format first (array)
    const inputs = schema?.io?.inputs
    if (Array.isArray(inputs) && inputs.length > 0) {
      // Convert array format to object format for BlockParameterForm
      return inputs.reduce((acc: any, input: any) => {
        acc[input.key] = {
          type: input.type,
          title: input.key,
          description: input.description,
          required: input.required,
          default: input.examples?.[0],
          enum: input.enum,
          minimum: input.minimum,
          maximum: input.maximum,
          minLength: input.minLength,
          maxLength: input.maxLength,
          pattern: input.pattern,
          format: input.format,
        }
        return acc
      }, {})
    }
    // Fall back to old format (object)
    return schema?.manifest?.config_schema?.properties || {}
  }, [schema])

  const lastTestResult = node?.data?.lastTestResult

  const handleSave = async () => {
    if (!nodeId) return
    setSaving(true)
    try {
      await onUpdate(nodeId, {
        config,
        parameters: config,
      })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1200)
    } catch (error) {
      console.error('Failed to update node config:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleTestComplete = (result: any) => {
    if (!nodeId) return
    onUpdate(nodeId, {
      lastTestResult: result,
      lastTestTimestamp: new Date().toISOString(),
    })
  }

  if (!nodeId || !node) {
    return null
  }

  if (!blockIdentifier) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl z-10 p-6 space-y-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800">Select a block to configure</h2>
          <p className="text-gray-600">
            Drag a block from the library and select it to configure parameters, inspect I/O schema,
            and run isolated tests.
          </p>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    if (loadingSchema) {
      return (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading schema...
        </div>
      )
    }

    if (schemaError) {
      return (
        <div className="flex items-center justify-center py-12 text-red-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          {schemaError}
        </div>
      )
    }

    switch (activeTab) {
      case 'configure':
        return (
          <div className="space-y-6">
            {/* Presets Section */}
            {presets.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                    <Bookmark className="w-4 h-4 mr-2 text-purple-600" />
                    Saved Presets
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {presets.map((preset, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-400 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => handleLoadPreset(preset)}
                            className="text-left w-full"
                          >
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {preset.name}
                            </div>
                            {preset.description && (
                              <div className="text-xs text-gray-500 truncate mt-1">
                                {preset.description}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(preset.createdAt).toLocaleDateString()}
                            </div>
                          </button>
                        </div>
                        <button
                          onClick={() => handleDeletePreset(index)}
                          className="ml-2 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete preset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(parameterSchema).length > 0 ? (
              <BlockParameterForm
                schema={parameterSchema}
                values={config}
                onChange={setConfig}
                disabled={saving}
                availableNodes={availableNodes}
                contextData={{ workflowEnvVars }}
              />
            ) : (
              <div className="flex items-center justify-center py-12 text-gray-500">
                This block does not expose configurable parameters.
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPresetDialog(true)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
              >
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Save as Preset
              </button>

              <div className="flex items-center space-x-3">
                {showSuccess && (
                  <span className="text-sm text-green-600 flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>Configuration saved</span>
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      case 'io':
        return <BlockIOSchema block={node} schema={schema} />
      case 'test':
        return (
          <div className="space-y-4">
            <BlockTestForm
              block={{ type: blockType, manifest: schema?.manifest }}
              onTestComplete={handleTestComplete}
            />
            {lastTestResult && (
              <div
                className={`rounded-lg border p-4 ${lastTestResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
              >
                <div className="flex items-center space-x-2">
                  {lastTestResult.success ? (
                    <span className="text-green-700 font-medium">Last test passed</span>
                  ) : (
                    <span className="text-red-700 font-medium">Last test failed</span>
                  )}
                  {node?.data?.lastTestTimestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(node.data.lastTestTimestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                {lastTestResult.error && (
                  <p className="text-sm text-red-700 mt-2">{lastTestResult.error}</p>
                )}
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-10 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{blockLabel}</h2>
                <p className="text-xs text-gray-500 font-mono">{blockType}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-gray-100 px-6 bg-gray-50/60">
            {(Object.keys(tabConfig) as ActiveTab[]).map(tab => {
              const Icon = tabConfig[tab].icon
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center space-x-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tabConfig[tab].label}</span>
                </button>
              )
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">{renderTabContent()}</div>
        </div>
      </div>

      {/* Preset Save Dialog */}
      {showPresetDialog && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPresetDialog(false)}
          ></div>
          <div className="relative bg-white rounded-xl shadow-2xl z-10 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Save Parameter Preset</h3>
              <button
                onClick={() => setShowPresetDialog(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preset Name *
                </label>
                <input
                  type="text"
                  value={presetName}
                  onChange={e => setPresetName(e.target.value)}
                  placeholder="e.g., Production Settings"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={presetDescription}
                  onChange={e => setPresetDescription(e.target.value)}
                  placeholder="Brief description of this preset..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-2">Current Parameters:</p>
                <pre className="text-xs text-gray-700 overflow-auto max-h-32">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setShowPresetDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
