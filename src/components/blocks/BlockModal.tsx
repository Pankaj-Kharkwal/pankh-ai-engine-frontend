import React, { useState, useEffect } from 'react'
import { X, Play, Eye, Settings, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react'
import BlockParameterForm from './BlockParameterForm'
import { BlockTestForm } from './BlockTestForm'
import { apiClient } from '../../services/api'

interface BlockModalProps {
  block: any
  isOpen: boolean
  onClose: () => void
  mode: 'view' | 'test' | 'configure'
  initialParameters?: any
  onSave?: (parameters: any) => void
  availableNodes?: Array<{
    id: string
    name: string
    type: string
    data?: any
  }>
  contextData?: Record<string, any>
}

const BlockModal: React.FC<BlockModalProps> = ({
  block,
  isOpen,
  onClose,
  mode,
  initialParameters,
  availableNodes = [],
  contextData = {},
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'parameters' | 'test' | 'results'>(
    'details'
  )
  const [schema, setSchema] = useState<any>(null)
  const [parameters, setParameters] = useState<any>({})
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && block) {
      setActiveTab(mode === 'view' ? 'details' : mode === 'test' ? 'parameters' : 'parameters')
      loadBlockSchema()
      // Initialize parameters with initial values if provided
      if (initialParameters) {
        setParameters(initialParameters)
      }
    }
  }, [isOpen, block, mode, initialParameters])

  const loadBlockSchema = async () => {
    if (!block?.type) return

    setIsLoading(true)
    setError(null)

    try {
      const schemaData = await apiClient.getBlockSchema(block.type)
      setSchema(schemaData)

      // Initialize parameters with default values from the manifest's config_schema
      const defaultParams: any = {}
      const configSchema = schemaData?.manifest?.config_schema
      if (configSchema?.properties) {
        Object.entries(configSchema.properties).forEach(([key, fieldSchema]: [string, any]) => {
          if (fieldSchema.default !== undefined) {
            defaultParams[key] = fieldSchema.default
          }
        })
      }
      setParameters(defaultParams)
    } catch (err) {
      console.error('Failed to load block schema:', err)
      setError('Failed to load block configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestBlock = async () => {
    if (!block?.type) return

    setIsLoading(true)
    setError(null)
    setTestResults(null)

    try {
      // Use the real node testing API for actual execution
      const result = await apiClient.testNode({
        block_type: block.type,
        parameters: parameters,
      })
      setTestResults(result)
      setActiveTab('results')
    } catch (err) {
      console.error('Block test failed:', err)
      setError('Block test failed')
      setTestResults({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })
      setActiveTab('results')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'details', label: 'Details', icon: Eye },
    { id: 'parameters', label: 'Parameters', icon: Settings },
    { id: 'test', label: 'Test', icon: Play },
    { id: 'results', label: 'Results', icon: CheckCircle },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {block?.manifest?.name || block?.type?.replace(/_/g, ' ') || 'Block'}
              </h2>
              <p className="text-sm text-gray-500">
                {block?.manifest?.category || 'Unknown'} • {block?.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Block Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                        {block?.type}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <p className="text-sm text-gray-900">
                        {block?.manifest?.category || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${block?.enabled ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        <span className="text-sm text-gray-900">
                          {block?.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Plugin Path</label>
                      <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded break-all">
                        {block?.plugin_path || 'Built-in'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Modified</label>
                      <p className="text-sm text-gray-900">
                        {block?.last_modified
                          ? new Date(block.last_modified * 1000).toLocaleString()
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {block?.manifest?.summary && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {block.manifest.summary}
                  </p>
                </div>
              )}

              {block?.load_error && (
                <div>
                  <h3 className="text-lg font-medium mb-3 text-red-600">Load Error</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <pre className="text-sm text-red-700 whitespace-pre-wrap">
                      {block.load_error}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'parameters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Block Parameters</h3>
                {mode === 'test' && (
                  <button
                    onClick={handleTestBlock}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span>Run Test</span>
                  </button>
                )}
              </div>

              {isLoading && !schema && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-3 text-gray-600">Loading schema...</span>
                </div>
              )}

              {schema && (
                <BlockParameterForm
                  schema={schema.manifest?.config_schema?.properties || {}}
                  values={parameters}
                  onChange={setParameters}
                  disabled={isLoading}
                  availableNodes={availableNodes}
                  contextData={contextData}
                />
              )}
            </div>
          )}

          {activeTab === 'test' && (
            <BlockTestForm
              block={block}
              onTestComplete={result => {
                setTestResults(result)
                setActiveTab('results')
              }}
            />
          )}

          {activeTab === 'results' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Test Results</h3>

              {!testResults && (
                <div className="text-center py-8 text-gray-500">
                  <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No test results yet. Run a test to see results here.</p>
                </div>
              )}

              {testResults && (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg border ${
                      testResults.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {testResults.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <h4
                        className={`font-medium ${
                          testResults.success ? 'text-green-900' : 'text-red-900'
                        }`}
                      >
                        {testResults.success ? 'Test Passed' : 'Test Failed'}
                      </h4>
                    </div>
                    {testResults.timestamp && (
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(testResults.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {testResults.error && (
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Error Details</h5>
                      <pre className="text-sm text-red-600 whitespace-pre-wrap">
                        {testResults.error}
                      </pre>
                    </div>
                  )}

                  {testResults.output && (
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Test Output</h5>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {typeof testResults.output === 'string'
                          ? testResults.output
                          : JSON.stringify(testResults.output, null, 2)}
                      </pre>
                    </div>
                  )}

                  {testResults.result && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">Test Result</h5>
                      <pre className="text-sm text-blue-700 whitespace-pre-wrap">
                        {JSON.stringify(testResults.result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {testResults.validation_info && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-medium text-green-900 mb-2">Validation Details</h5>
                      <div className="text-sm text-green-800 space-y-1">
                        <div>
                          <strong>Block Type:</strong> {testResults.validation_info.block_type}
                        </div>
                        <div>
                          <strong>Parameters Count:</strong>{' '}
                          {testResults.validation_info.parameters_count}
                        </div>
                        <div>
                          <strong>API Validation:</strong>{' '}
                          {testResults.validation_info.api_validation}
                        </div>
                      </div>
                    </div>
                  )}

                  {testResults.validation_errors && testResults.validation_errors.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-medium text-yellow-900 mb-2">Validation Warnings</h5>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        {testResults.validation_errors.map((error: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-yellow-600">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          {mode === 'configure' && (
            <button
              onClick={() => {
                onSave?.(parameters)
                onClose()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Parameters
            </button>
          )}
          {mode === 'test' && activeTab === 'parameters' && (
            <button
              onClick={handleTestBlock}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>Run Test</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlockModal
