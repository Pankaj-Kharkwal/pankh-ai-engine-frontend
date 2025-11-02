import React, { useState, useEffect, useMemo } from 'react'
import { X, Settings, FileJson, TestTube, Save, Loader2, Zap, AlertCircle } from 'lucide-react'
import { apiClient } from '../../services/api'
import BlockParameterForm from '../blocks/BlockParameterForm'
import BlockIOSchema from '../blocks/BlockIOSchema'
import { BlockTestForm } from '../blocks/BlockTestForm'

type ActiveTab = 'configure' | 'io' | 'test'

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

  const blockType = node?.data?.blockType
  const blockLabel = node?.data?.label || blockType

  useEffect(() => {
    setConfig(node?.data?.config || node?.data?.parameters || fallbackConfig)
    if (!blockType) {
      setSchema(null)
      setSchemaError('Select a block type to configure this node.')
      return
    }

    let mounted = true
    const loadSchema = async () => {
      setLoadingSchema(true)
      setSchemaError(null)
      try {
        const blockSchema = await apiClient.getBlockSchema(blockType)
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
  }, [nodeId, blockType, node?.data?.config, node?.data?.parameters])

  const parameterSchema = useMemo(
    () => schema?.manifest?.config_schema?.properties || {},
    [schema?.manifest?.config_schema?.properties]
  )

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

  if (!blockType) {
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

            <div className="flex items-center justify-end space-x-3">
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
  )
}
