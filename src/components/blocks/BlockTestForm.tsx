import React, { useState, useEffect } from 'react'
import { Loader2, Play, Eye, Clock, Zap } from 'lucide-react'
import { apiClient } from '../../services/api'
import BlockParameterForm from './BlockParameterForm'

interface BlockTestFormProps {
  block: any
  onTestComplete: (result: any) => void
}

export const BlockTestForm: React.FC<BlockTestFormProps> = ({ block, onTestComplete }) => {
  const [testParams, setTestParams] = useState<any>({})
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [schema, setSchema] = useState<any>(null)
  const [loadingSchema, setLoadingSchema] = useState(false)
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const [dryRun, setDryRun] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  // Load block schema on mount
  useEffect(() => {
    const loadSchema = async () => {
      if (!block) return

      setLoadingSchema(true)
      setSchemaError(null)

      try {
        // Use block data directly instead of fetching by type
        setSchema(block)

        // Initialize parameters with default values from new format (block.io.inputs) or old format
        const defaultParams: any = {}
        const inputs = block?.io?.inputs || []

        if (Array.isArray(inputs) && inputs.length > 0) {
          // New format: block.io.inputs (array)
          inputs.forEach((input: any) => {
            if (input.examples && input.examples.length > 0) {
              const inputKey = input.key || input.name
              if (inputKey) {
                defaultParams[inputKey] = input.examples[0]
              }
            }
          })
        } else {
          // Old format: block.manifest.config_schema.properties (object)
          const configSchema = block?.manifest?.config_schema
          if (configSchema?.properties) {
            Object.entries(configSchema.properties).forEach(([key, fieldSchema]: [string, any]) => {
              if (fieldSchema.default !== undefined) {
                defaultParams[key] = fieldSchema.default
              }
            })
          }
        }
        setTestParams(defaultParams)
      } catch (err) {
        console.error('Failed to load block schema:', err)
        setSchemaError('Failed to load block schema')
      } finally {
        setLoadingSchema(false)
      }
    }

    loadSchema()
  }, [block])

  const runBlockTest = async () => {
    setTesting(true)
    setTestResult(null)
    setExecutionTime(null)

    const startTime = performance.now()

    try {
      // Use the real node testing API for actual execution
      const result = await apiClient.testNode({
        block_id: block.id || block._id,
        block_type: block.type,
        parameters: testParams,
      })

      const endTime = performance.now()
      const execTime = endTime - startTime
      setExecutionTime(execTime)

      const enhancedResult = {
        ...result,
        execution_time_ms: execTime,
        dry_run: dryRun,
        timestamp: new Date().toISOString(),
      }

      setTestResult(enhancedResult)
      onTestComplete(enhancedResult)
    } catch (error: any) {
      const endTime = performance.now()
      const execTime = endTime - startTime
      setExecutionTime(execTime)

      const errorResult = {
        success: false,
        error: error.message || 'Test failed',
        execution_time_ms: execTime,
        dry_run: dryRun,
        timestamp: new Date().toISOString(),
      }
      setTestResult(errorResult)
      onTestComplete(errorResult)
    } finally {
      setTesting(false)
    }
  }

  if (loadingSchema) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Loading block schema...</span>
      </div>
    )
  }

  if (schemaError) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{schemaError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Test Block: {block.name || block.manifest?.name || block.type}</h3>

      {/* Parameter Form using BlockParameterForm for full feature support */}
      {(() => {
        // Try new format first (array)
        const inputs = block?.io?.inputs || schema?.io?.inputs
        if (Array.isArray(inputs) && inputs.length > 0) {
          // Convert array format to object format for BlockParameterForm
          const paramSchema = inputs.reduce((acc: any, input: any) => {
            const inputKey = input.key || input.name
            if (!inputKey) {
              return acc
            }
            acc[inputKey] = {
              type: input.type,
              title: inputKey,
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

          return (
            <BlockParameterForm
              schema={paramSchema}
              values={testParams}
              onChange={setTestParams}
              disabled={testing}
            />
          )
        }

        // Fall back to old format (object)
        const oldSchema = schema?.manifest?.config_schema?.properties
        if (oldSchema && Object.keys(oldSchema).length > 0) {
          return (
            <BlockParameterForm
              schema={oldSchema}
              values={testParams}
              onChange={setTestParams}
              disabled={testing}
            />
          )
        }

        return <div className="text-gray-500 text-sm py-4">No parameters required for this block</div>
      })()}

      {/* Dry Run Toggle */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <div>
              <label className="text-sm font-medium text-blue-900">Dry Run Mode</label>
              <p className="text-xs text-blue-700">Validate without executing real operations</p>
            </div>
          </div>
          <button
            onClick={() => setDryRun(!dryRun)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              dryRun ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                dryRun ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={runBlockTest}
          disabled={testing || loadingSchema}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
        >
          {testing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{dryRun ? 'Validating...' : 'Testing...'}</span>
            </>
          ) : (
            <>
              {dryRun ? <Eye className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{dryRun ? 'Validate' : 'Run Test'}</span>
            </>
          )}
        </button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="space-y-4">
          {/* Status Header */}
          <div
            className={`rounded-lg p-4 ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
          >
            <div className="flex items-center justify-between">
              <h4
                className={`font-medium flex items-center ${testResult.success ? 'text-green-900' : 'text-red-900'}`}
              >
                {testResult.success ? '✓ Test Passed' : '✗ Test Failed'}
                {testResult.dry_run && (
                  <span className="ml-2 text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                    DRY RUN
                  </span>
                )}
              </h4>
              {executionTime !== null && (
                <div className="flex items-center space-x-1 text-sm text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>{executionTime.toFixed(2)}ms</span>
                </div>
              )}
            </div>
          </div>

          {/* Output Result */}
          {testResult.success && testResult.output && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-blue-900 mb-2">Output</h5>
              <pre className="text-sm text-blue-800 overflow-auto max-h-64 bg-white p-3 rounded border">
                {JSON.stringify(testResult.output, null, 2)}
              </pre>
            </div>
          )}

          {/* Error Details */}
          {!testResult.success && testResult.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-red-900 mb-2">Error</h5>
              <p className="text-sm text-red-800">{testResult.error}</p>
            </div>
          )}

          {/* Execution Logs */}
          {testResult.logs && testResult.logs.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Execution Logs</h5>
              <div className="space-y-1 max-h-48 overflow-auto bg-white p-3 rounded border font-mono text-xs">
                {testResult.logs.map((log: string, idx: number) => (
                  <div key={idx} className="text-gray-700">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution Metrics */}
          {(testResult.duration_ms || testResult.execution_id) && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-purple-900 mb-2">Execution Metrics</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {testResult.duration_ms && (
                  <div>
                    <span className="text-purple-700 font-medium">Duration:</span>
                    <span className="ml-2 text-purple-900">{testResult.duration_ms.toFixed(2)}ms</span>
                  </div>
                )}
                {testResult.execution_id && (
                  <div>
                    <span className="text-purple-700 font-medium">Execution ID:</span>
                    <span className="ml-2 text-purple-900 font-mono text-xs">{testResult.execution_id}</span>
                  </div>
                )}
                {testResult.executed_at && (
                  <div>
                    <span className="text-purple-700 font-medium">Executed At:</span>
                    <span className="ml-2 text-purple-900">{new Date(testResult.executed_at).toLocaleString()}</span>
                  </div>
                )}
                {testResult.retry_count !== undefined && testResult.retry_count > 0 && (
                  <div>
                    <span className="text-purple-700 font-medium">Retries:</span>
                    <span className="ml-2 text-purple-900">{testResult.retry_count}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Result (collapsed by default) */}
          <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <summary className="text-sm font-medium text-gray-900 cursor-pointer">Full Response (Debug)</summary>
            <pre className="text-xs text-gray-700 overflow-auto max-h-96 bg-white p-3 rounded border mt-2">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}
