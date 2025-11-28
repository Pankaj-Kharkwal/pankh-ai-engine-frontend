import React, { useState, useEffect, useMemo, useCallback } from 'react' // Added useCallback
import { BlockTestForm } from './BlockTestForm'
import {
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  Settings,
  FileJson,
  TestTube,
  ScrollText,
  BarChart3,
  Grid,
  Activity,
  Zap,
} from 'lucide-react'
import { apiClient } from '../../services/api'
import BlockParameterForm from './BlockParameterForm'
import BlockIOSchema from './BlockIOSchema'
import BlockMetrics from './BlockMetrics'

interface BlockDetailsProps {
  block: any
  onClose: () => void
  onSave: (parameters: any) => void
}

// Helper component for the Info Tab content (no changes needed here)
const InfoContent: React.FC<{ block: any }> = ({ block }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-bold text-gray-100 mb-3">Block Metadata</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase text-gray-300">Type</label>
            <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded break-all">
              {block?.type}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-300">Category</label>
            <p className="text-sm text-gray-900 p-2 rounded border border-transparent">
              {block?.manifest?.category || 'Unknown'}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase text-gray-300">Plugin Path</label>
            <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded break-all">
              {block?.plugin_path || 'Built-in'}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-300">Last Modified</label>
            <p className="text-sm text-gray-900 p-2 rounded border border-transparent">
              {block?.last_modified
                ? new Date(block.last_modified * 1000).toLocaleString()
                : 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <label className="text-xs font-semibold uppercase text-gray-300">Status:</label>
      <div className={`w-3 h-3 rounded-full ${block?.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={`text-sm font-medium ${block?.enabled ? 'text-green-700' : 'text-red-700'}`}>
        {block?.enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>

    {block?.manifest?.summary && (
      <div>
        <h3 className="text-lg font-bold text-gray-100 mb-3">Description</h3>
        <p className="text-gray-700 bg-gray-100 border border-[#D4AF37]/30 p-4 rounded-lg shadow-inner">
          {block.manifest.summary}
        </p>
      </div>
    )}

    {block?.load_error && (
      <div>
        <h3 className="text-lg font-bold mb-3 text-red-600">Load Error</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <pre className="text-sm text-red-700 whitespace-pre-wrap">{block.load_error}</pre>
        </div>
      </div>
    )}
  </div>
)

// Helper component for the Results tab content (no changes needed here)
const ResultsContent: React.FC<{ testResults: any }> = ({ testResults }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold text-gray-100">Test Results Summary</h3>

    {!testResults && (
      <div className="text-center py-12 text-gray-300 border border-dashed rounded-lg p-8">
        <Play className="w-10 h-10 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No test results yet.</p>
        <p className="text-sm">Run a test from the 'Test' sub-tab to see the output here.</p>
      </div>
    )}

    {testResults && (
      <div className="space-y-6">
        <div
          className={`p-4 rounded-lg shadow-md flex items-center space-x-3 ${
            testResults.success
              ? 'bg-green-100 border border-green-300'
              : 'bg-red-100 border border-red-300'
          }`}
        >
          {testResults.success ? (
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          )}
          <div>
            <h4
              className={`font-bold text-lg ${
                testResults.success ? 'text-green-900' : 'text-red-900'
              }`}
            >
              {testResults.success ? 'Test Passed Successfully' : 'Test Failed'}
            </h4>
            {testResults.timestamp && (
              <p className="text-xs text-gray-300 mt-0.5">
                Run on: {new Date(testResults.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {testResults.output && (
          <div className="bg-black border rounded-lg p-4 shadow-sm">
            <h5 className="font-semibold text-gray-100 mb-2 border-b pb-1">Test Output</h5>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
              {typeof testResults.output === 'string'
                ? testResults.output
                : JSON.stringify(testResults.output, null, 2)}
            </pre>
          </div>
        )}

        {testResults.result && (
          <div className="bg-[#D4AF37] border border-[#D4AF37]/30 rounded-lg p-4 shadow-sm">
            <h5 className="font-semibold text-[#D4AF37] mb-2 border-b border-[#D4AF37]/30 pb-1">
              Final Result
            </h5>
            <pre className="text-sm text-[#D4AF37] whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
              {JSON.stringify(testResults.result, null, 2)}
            </pre>
          </div>
        )}

        {testResults.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <h5 className="font-semibold text-red-900 mb-2 border-b border-red-200 pb-1">
              Error Details
            </h5>
            <pre className="text-sm text-red-700 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
              {testResults.error}
            </pre>
          </div>
        )}

        {/* Validation and Warnings (optional details) */}
        {(testResults.validation_info ||
          (testResults.validation_errors && testResults.validation_errors.length > 0)) && (
          <div className="space-y-4">
            {testResults.validation_info && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                <h5 className="font-semibold text-green-900 mb-2 border-b border-green-200 pb-1">
                  Validation Info
                </h5>
                <div className="text-sm text-green-800 space-y-1">
                  <div>
                    <strong>Block Type:</strong> {testResults.validation_info.block_type}
                  </div>
                  <div>
                    <strong>Parameters Count:</strong>{' '}
                    {testResults.validation_info.parameters_count}
                  </div>
                  <div>
                    <strong>API Validation:</strong> {testResults.validation_info.api_validation}
                  </div>
                </div>
              </div>
            )}

            {testResults.validation_errors && testResults.validation_errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
                <h5 className="font-semibold text-yellow-900 mb-2 border-b border-yellow-200 pb-1">
                  Validation Warnings
                </h5>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc pl-5">
                  {testResults.validation_errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    )}
  </div>
)

const BlockDetails: React.FC<BlockDetailsProps> = ({ block, onClose, onSave }) => {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<'details' | 'test' | 'metrics'>('details')

  // Sub-Tab States
  const [activeDetailsSubTab, setActiveDetailsSubTab] = useState<
    'info' | 'parameters' | 'io_schema'
  >('info')
  const [activeTestSubTab, setActiveTestSubTab] = useState<'run_test' | 'results'>('run_test')
  const [activeAnalyticsSubTab, setActiveAnalyticsSubTab] = useState<'logs' | 'metrics'>('metrics')

  // Data States
  const [schema, setSchema] = useState<any>(null)
  const [parameters, setParameters] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<any>(null)

  // Function to reset test-related state
  const resetTestState = useCallback(() => {
    setTestResults(null)
    setActiveTestSubTab('run_test')
  }, [])

  useEffect(() => {
    if (block) {
      loadBlockSchema()
      // FIX 2: Reset test state when a new block is loaded
      resetTestState()
    }
  }, [block, resetTestState])

  // Removed the previous useEffect for activeTestSubTab as the resetTestState handles the initial state

  const loadBlockSchema = async () => {
    if (!block?.type) return

    setIsLoading(true)
    setError(null)

    try {
      const schemaData = await apiClient.getBlockSchema(block.type)
      setSchema(schemaData)

      const defaultParams: any = {}
      const configSchema = schemaData?.manifest?.config_schema
      if (configSchema?.properties) {
        Object.entries(configSchema.properties).forEach(([key, fieldSchema]: [string, any]) => {
          if (fieldSchema.default !== undefined) {
            defaultParams[key] = fieldSchema.default
          }
        })
      }
      setParameters(block.parameters || defaultParams)
    } catch (err) {
      console.error('Failed to load block schema:', err)
      setError('Failed to load block configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const getTabButtonClass = (tabName: string) =>
    `flex items-center space-x-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
      activeTab === tabName
        ? 'border-b-4 border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
        : 'text-gray-300 hover:text-gray-100 hover:bg-black'
    }`

  const getSubTabButtonClass = (subTabName: string) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 ${
      activeDetailsSubTab === subTabName
        ? 'bg-gray-900 text-[#D4AF37] border-b-2 border-[#D4AF37]/50'
        : 'text-gray-300 hover:bg-gray-700'
    }`

  const getTestSubTabButtonClass = (subTabName: string) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 ${
      activeTestSubTab === subTabName
        ? 'bg-gray-900 text-[#D4AF37] border-b-2 border-[#D4AF37]/50'
        : 'text-gray-300 hover:bg-gray-700'
    }`

  const getAnalyticsSubTabButtonClass = (subTabName: string) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 ${
      activeAnalyticsSubTab === subTabName
        ? 'bg-gray-900 text-[#D4AF37] border-b-2 border-[#D4AF37]/50'
        : 'text-gray-300 hover:bg-gray-700'
    }`

  if (!block) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col transform transition-all duration-300">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-200">
            {block.manifest?.name || block.type} Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-300 transition-colors p-1 rounded-full "
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Main Tabs Navigation */}
        <div className="flex border-b border-gray-200 bg-black overflow-x-auto">
          <button className={getTabButtonClass('details')} onClick={() => setActiveTab('details')}>
            <Grid className="w-5 h-5" />
            <span>Details (Info, Params, I/O)</span>
          </button>
          <button className={getTabButtonClass('test')} onClick={() => setActiveTab('test')}>
            <TestTube className="w-5 h-5" />
            <span>Test & Results</span>
          </button>
          <button className={getTabButtonClass('metrics')} onClick={() => setActiveTab('metrics')}>
            <Activity className="w-5 h-5" />
            <span>Logs & Metrics</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-black">
          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Details Tab Content */}
          {activeTab === 'details' && (
            <div className="bg-gray-900 p-5 rounded-lg shadow-md h-full">
              <div className="border-b flex space-x-2">
                <button
                  className={getSubTabButtonClass('info')}
                  onClick={() => setActiveDetailsSubTab('info')}
                >
                  <Info className="w-4 h-4 inline mr-1" /> Info
                </button>
                <button
                  className={getSubTabButtonClass('parameters')}
                  onClick={() => setActiveDetailsSubTab('parameters')}
                >
                  <Settings className="w-4 h-4 inline mr-1" /> Parameters
                </button>
                <button
                  className={getSubTabButtonClass('io_schema')}
                  onClick={() => setActiveDetailsSubTab('io_schema')}
                >
                  <FileJson className="w-4 h-4 inline mr-1" /> I/O Schema
                </button>
              </div>

              <div className="mt-4 pt-4">
                {activeDetailsSubTab === 'info' && <InfoContent block={block} />}

                {activeDetailsSubTab === 'parameters' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-100">
                      Block Parameters Configuration
                    </h3>
                    {isLoading && !schema && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                        <span className="ml-3 text-gray-300">Loading parameter schema...</span>
                      </div>
                    )}
                    {schema && (
                      <BlockParameterForm
                        schema={schema.manifest?.config_schema?.properties || {}}
                        values={parameters}
                        onChange={setParameters}
                        disabled={isLoading}
                      />
                    )}
                  </div>
                )}

                {activeDetailsSubTab === 'io_schema' && (
                  <BlockIOSchema block={block} schema={schema} />
                )}
              </div>
            </div>
          )}

          {/* Test & Results Tab Content */}
          {activeTab === 'test' && (
            <div className="bg-gray-900 p-5 rounded-lg shadow-md h-full">
              <div className="border-b flex space-x-2">
                <button
                  className={getTestSubTabButtonClass('run_test')}
                  onClick={() => setActiveTestSubTab('run_test')}
                >
                  <Zap className="w-4 h-4 inline mr-1" /> Run Test
                </button>
                <button
                  className={getTestSubTabButtonClass('results')}
                  onClick={() => setActiveTestSubTab('results')}
                >
                  {testResults?.success ? (
                    <CheckCircle className="w-4 h-4 inline mr-1 text-green-600" />
                  ) : testResults ? (
                    <XCircle className="w-4 h-4 inline mr-1 text-red-600" />
                  ) : (
                    <Play className="w-4 h-4 inline mr-1" />
                  )}
                  Test Results
                </button>
              </div>

              <div className="mt-4 pt-4">
                {activeTestSubTab === 'run_test' && (
                  <BlockTestForm
                    block={block}
                    onTestComplete={result => {
                      setTestResults(result)
                      // FIX 1: Explicitly switch to results tab after test completes
                      setActiveTestSubTab('results')
                    }}
                  />
                )}
                {activeTestSubTab === 'results' && <ResultsContent testResults={testResults} />}
              </div>
            </div>
          )}

          {/* Logs & Metrics Tab Content */}
          {activeTab === 'metrics' && (
            <div className="bg-gray-900 p-5 rounded-lg shadow-md h-full">
              <div className="border-b flex space-x-2">
                <button
                  className={getAnalyticsSubTabButtonClass('metrics')}
                  onClick={() => setActiveAnalyticsSubTab('metrics')}
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" /> Metrics
                </button>
                <button
                  className={getAnalyticsSubTabButtonClass('logs')}
                  onClick={() => setActiveAnalyticsSubTab('logs')}
                >
                  <ScrollText className="w-4 h-4 inline mr-1" /> Logs
                </button>
              </div>

              <div className="mt-4 pt-4">
                {activeAnalyticsSubTab === 'metrics' && <BlockMetrics blockType={block.type} />}

                {activeAnalyticsSubTab === 'logs' && (
                  <div className="text-center py-12 text-gray-300 border border-dashed rounded-lg p-8">
                    <ScrollText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">Execution Logs</h3>
                    <p className="text-sm">
                      Logs will appear here when the block is executed on the platform.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-5 flex justify-end space-x-3 bg-black rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={() => {
              onSave?.(parameters)
              onClose()
            }}
            disabled={activeTab !== 'details' || activeDetailsSubTab !== 'parameters'}
            className={`px-6 py-2 text-white rounded-lg transition-all font-semibold ${
              activeTab === 'details' && activeDetailsSubTab === 'parameters'
                  ? 'bg-[#D4AF37] hover:bg-[#D4AF37]/90 shadow-md'
                : 'bg-gray-700 text-gray-300 cursor-not-allowed opacity-75'
            }`}
            title={
              activeTab !== 'details' || activeDetailsSubTab !== 'parameters'
                ? 'Switch to Parameters tab to save'
                : 'Save the current parameter values'
            }
          >
            Save Parameters
          </button>
        </div>
      </div>
    </div>
  )
}

export default BlockDetails
