import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { apiClient } from '../../services/api'
import { useVerifyBlock, useHealBlock } from '../../hooks/useApi'
import BlockParameterForm from './BlockParameterForm'
import BlockIOSchema from './BlockIOSchema'
import BlockMetrics from './BlockMetrics'

interface BlockDetailsProps {
  block: any
  onClose: () => void
  onSave: (parameters: any) => void
}

// Helper component for the Info Tab content
const InfoContent: React.FC<{ block: any }> = ({ block }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-3">Block Metadata</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Type</label>
            <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded break-all">
              {block?.type}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Category</label>
            <p className="text-sm text-gray-900 p-2 rounded border border-transparent">
              {block?.manifest?.category || 'Unknown'}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Plugin Path</label>
            <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded break-all">
              {block?.plugin_path || 'Built-in'}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500">Last Modified</label>
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
      <label className="text-xs font-semibold uppercase text-gray-500">Status:</label>
      <div className={`w-3 h-3 rounded-full ${block?.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={`text-sm font-medium ${block?.enabled ? 'text-green-700' : 'text-red-700'}`}>
        {block?.enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>

    {block?.metadata?.verification_status && (
      <div className="flex items-center space-x-2 mt-2">
        <label className="text-xs font-semibold uppercase text-gray-500">Verification:</label>
        <span className={`text-sm font-bold px-2 py-1 rounded ${block.metadata.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {block.metadata.verification_status.toUpperCase()}
        </span>
      </div>
    )}

    {block?.manifest?.summary && (
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Description</h3>
        <p className="text-gray-700 bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-inner">
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

// Helper component for the Results tab content
const ResultsContent: React.FC<{ testResults: any }> = ({ testResults }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold text-gray-800">Test Results Summary</h3>

    {!testResults && (
      <div className="text-center py-12 text-gray-500 border border-dashed rounded-lg p-8">
        <Play className="w-10 h-10 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No test results yet.</p>
        <p className="text-sm">Run a test from the 'Test' sub-tab to see the output here.</p>
      </div>
    )}

    {testResults && (
      <div className="space-y-6">
        <div
          className={`p-4 rounded-lg shadow-md flex items-center space-x-3 ${testResults.success
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
              className={`font-bold text-lg ${testResults.success ? 'text-green-900' : 'text-red-900'
                }`}
            >
              {testResults.success ? 'Test Passed Successfully' : 'Test Failed'}
            </h4>
            {testResults.timestamp && (
              <p className="text-xs text-gray-600 mt-0.5">
                Run on: {new Date(testResults.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {testResults.output && (
          <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
            <h5 className="font-semibold text-gray-800 mb-2 border-b pb-1">Test Output</h5>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
              {typeof testResults.output === 'string'
                ? testResults.output
                : JSON.stringify(testResults.output, null, 2)}
            </pre>
          </div>
        )}

        {testResults.result && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <h5 className="font-semibold text-blue-900 mb-2 border-b border-blue-200 pb-1">
              Final Result
            </h5>
            <pre className="text-sm text-blue-800 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
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
      </div>
    )}
  </div>
)

const BlockDetails: React.FC<BlockDetailsProps> = ({ block, onClose, onSave }) => {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<'details' | 'test' | 'metrics' | 'verify'>('details')

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

  // Verification & Healing
  const verifyBlock = useVerifyBlock()
  const healBlock = useHealBlock()
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [healingResult, setHealingResult] = useState<any>(null)

  // Function to reset test-related state
  const resetTestState = useCallback(() => {
    setTestResults(null)
    setActiveTestSubTab('run_test')
    setVerificationResult(null)
    setHealingResult(null)
  }, [])

  useEffect(() => {
    if (block) {
      loadBlockSchema()
      // FIX 2: Reset test state when a new block is loaded
      resetTestState()
    }
  }, [block, resetTestState])

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

  const handleVerify = () => {
    if (!block?.id) return
    verifyBlock.mutate(block.id, {
      onSuccess: (data) => {
        setVerificationResult(data)
      }
    })
  }

  const handleHeal = () => {
    if (!block?.id || !verificationResult?.issues) return
    healBlock.mutate({ blockId: block.id, issues: verificationResult.issues }, {
      onSuccess: (data) => {
        setHealingResult(data)
        // Re-verify after healing? Or just show success.
      }
    })
  }

  const getTabButtonClass = (tabName: string) =>
    `flex items-center space-x-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${activeTab === tabName
      ? 'border-b-4 border-blue-600 text-blue-700 bg-blue-50/50'
      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
    }`

  const getSubTabButtonClass = (subTabName: string) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 ${activeDetailsSubTab === subTabName
      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
      : 'text-gray-500 hover:bg-gray-100'
    }`

  const getTestSubTabButtonClass = (subTabName: string) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 ${activeTestSubTab === subTabName
      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
      : 'text-gray-500 hover:bg-gray-100'
    }`

  const getAnalyticsSubTabButtonClass = (subTabName: string) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-150 ${activeAnalyticsSubTab === subTabName
      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
      : 'text-gray-500 hover:bg-gray-100'
    }`

  if (!block) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col transform transition-all duration-300">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {block.manifest?.name || block.type} Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Main Tabs Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
          <button className={getTabButtonClass('details')} onClick={() => setActiveTab('details')}>
            <Grid className="w-5 h-5" />
            <span>Details</span>
          </button>
          <button className={getTabButtonClass('test')} onClick={() => setActiveTab('test')}>
            <TestTube className="w-5 h-5" />
            <span>Test</span>
          </button>
          <button className={getTabButtonClass('metrics')} onClick={() => setActiveTab('metrics')}>
            <Activity className="w-5 h-5" />
            <span>Metrics</span>
          </button>
          <button className={getTabButtonClass('verify')} onClick={() => setActiveTab('verify')}>
            <ShieldCheck className="w-5 h-5" />
            <span>Verify & Heal</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
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
            <div className="bg-white p-5 rounded-lg shadow-md h-full">
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
                    <h3 className="text-xl font-bold text-gray-800">
                      Block Parameters Configuration
                    </h3>
                    {isLoading && !schema && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span className="ml-3 text-gray-600">Loading parameter schema...</span>
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
            <div className="bg-white p-5 rounded-lg shadow-md h-full">
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
            <div className="bg-white p-5 rounded-lg shadow-md h-full">
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
                  <div className="text-center py-12 text-gray-500 border border-dashed rounded-lg p-8">
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

          {/* Verify & Heal Tab Content */}
          {activeTab === 'verify' && (
            <div className="bg-white p-5 rounded-lg shadow-md h-full space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Block Verification</h3>
                <button
                  onClick={handleVerify}
                  disabled={verifyBlock.isPending}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {verifyBlock.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Run Verification</span>
                </button>
              </div>

              {verificationResult && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${verificationResult.is_valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center space-x-3">
                      {verificationResult.is_valid ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <div>
                        <h4 className={`font-bold ${verificationResult.is_valid ? 'text-green-900' : 'text-red-900'}`}>
                          {verificationResult.is_valid ? 'Verification Passed' : 'Verification Failed'}
                        </h4>
                        <p className="text-sm text-gray-600">Score: {verificationResult.score}/100</p>
                      </div>
                    </div>
                  </div>

                  {verificationResult.issues && verificationResult.issues.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Issues Found:</h4>
                      <ul className="space-y-2">
                        {verificationResult.issues.map((issue: any, idx: number) => (
                          <li key={idx} className={`p-3 rounded border ${issue.severity === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
                              issue.severity === 'warning' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' :
                                'bg-blue-50 border-blue-100 text-blue-800'
                            }`}>
                            <div className="flex items-start space-x-2">
                              <span className="uppercase text-xs font-bold px-2 py-0.5 rounded bg-white bg-opacity-50 border border-black border-opacity-10">
                                {issue.severity}
                              </span>
                              <div>
                                <p className="font-medium text-sm">{issue.message}</p>
                                {issue.suggestion && <p className="text-xs mt-1 opacity-80">Suggestion: {issue.suggestion}</p>}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!verificationResult.is_valid && (
                    <div className="pt-4 border-t">
                      <h4 className="font-bold text-gray-800 mb-2">Self-Healing</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Attempt to automatically fix the identified issues using AI.
                      </p>
                      <button
                        onClick={handleHeal}
                        disabled={healBlock.isPending}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {healBlock.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
                        <span>Attempt Auto-Heal</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {healingResult && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">Healing Result</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Changes made:
                  </p>
                  <ul className="list-disc list-inside text-sm text-blue-800">
                    {healingResult.changes_made?.map((change: string, idx: number) => (
                      <li key={idx}>{change}</li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <p className="text-xs text-blue-600">
                      The block has been updated. Please re-run verification to confirm fixes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-5 flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
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
            className={`px-6 py-2 text-white rounded-lg transition-all font-semibold ${activeTab === 'details' && activeDetailsSubTab === 'parameters'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-md'
                : 'bg-gray-400 cursor-not-allowed opacity-75'
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
