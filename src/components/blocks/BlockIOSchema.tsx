import React, { useState } from 'react'
import { ArrowRight, Copy, Check, FileJson, AlertCircle } from 'lucide-react'

interface BlockIOSchemaProps {
  block: any
  schema?: any
}

export default function BlockIOSchema({ block, schema }: BlockIOSchemaProps) {
  const [copiedInput, setCopiedInput] = useState(false)
  const [copiedOutput, setCopiedOutput] = useState(false)

  const copyToClipboard = (text: string, type: 'input' | 'output') => {
    navigator.clipboard.writeText(text)
    if (type === 'input') {
      setCopiedInput(true)
      setTimeout(() => setCopiedInput(false), 2000)
    } else {
      setCopiedOutput(true)
      setTimeout(() => setCopiedOutput(false), 2000)
    }
  }

  // Generate sample input based on config schema or io.inputs
  const generateSampleInput = () => {
    // Try io.inputs first (new format), then fallback to manifest.config_schema (old format)
    const inputs = block?.io?.inputs || schema?.io?.inputs || []

    if (inputs.length === 0 && !schema?.manifest?.config_schema?.properties) {
      return null
    }

    const sample: any = {}

    // Handle new format: block.io.inputs (array of input objects)
    if (inputs.length > 0) {
      inputs.forEach((input: any) => {
        const key = input.key
        const examples = input.examples || []
        switch (input.type) {
          case 'string':
            sample[key] = examples[0] || `example_${key}`
            break
          case 'number':
          case 'integer':
            sample[key] = examples[0] || 42
            break
          case 'boolean':
            sample[key] = examples[0] !== undefined ? examples[0] : true
            break
          case 'array':
            sample[key] = examples[0] || ['item1', 'item2']
            break
          case 'object':
            sample[key] = examples[0] || {}
            break
          default:
            sample[key] = examples[0] || null
        }
      })
      return sample
    }

    // Handle old format: schema.manifest.config_schema.properties (object)
    if (schema?.manifest?.config_schema?.properties) {
      Object.entries(schema.manifest.config_schema.properties).forEach(
        ([key, fieldSchema]: [string, any]) => {
          switch (fieldSchema.type) {
            case 'string':
              sample[key] = fieldSchema.default || `example_${key}`
              break
            case 'number':
            case 'integer':
              sample[key] = fieldSchema.default || 42
              break
            case 'boolean':
              sample[key] = fieldSchema.default !== undefined ? fieldSchema.default : true
              break
            case 'array':
              sample[key] = fieldSchema.default || ['item1', 'item2']
              break
            case 'object':
              sample[key] = fieldSchema.default || {}
              break
            default:
              sample[key] = null
          }
        }
      )
    }

    return Object.keys(sample).length > 0 ? sample : null
  }

  // Generate sample output based on block type
  const generateSampleOutput = () => {
    const blockType = block?.type?.toLowerCase() || ''

    // Common output patterns based on block type
    if (blockType.includes('http') || blockType.includes('api')) {
      return {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
        body: {
          data: 'Response data from API',
          timestamp: new Date().toISOString(),
        },
      }
    }

    if (blockType.includes('ai') || blockType.includes('llm') || blockType.includes('chat')) {
      return {
        response: 'AI generated response text',
        model: 'gpt-4',
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
      }
    }

    if (blockType.includes('database') || blockType.includes('sql')) {
      return {
        rows: [
          { id: 1, name: 'Example 1' },
          { id: 2, name: 'Example 2' },
        ],
        rowCount: 2,
      }
    }

    if (blockType.includes('email') || blockType.includes('mail')) {
      return {
        messageId: '<unique-message-id@example.com>',
        status: 'sent',
        recipients: ['user@example.com'],
      }
    }

    // Default generic output
    return {
      success: true,
      result: 'Block execution completed successfully',
      data: null,
    }
  }

  const sampleInput = generateSampleInput()
  const sampleOutput = generateSampleOutput()

  // Extract input schema details - support both new and old formats
  const inputs = block?.io?.inputs || schema?.io?.inputs || []

  // Convert to array of [key, schema] tuples for consistent rendering
  const inputProperties = inputs.length > 0
    ? inputs.map((input: any) => [input.key, input])
    : Object.entries(schema?.manifest?.config_schema?.properties || {})

  return (
    <div className="space-y-6">
      {/* Input Schema */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center">
            <FileJson className="w-5 h-5 mr-2" />
            Input Schema
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {inputProperties.length > 0 ? (
            <>
              {/* Schema Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Parameter
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Required
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inputProperties.map(([key, fieldSchema]: [string, any]) => (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">
                          {fieldSchema.title || key}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {fieldSchema.type}
                          </span>
                          {fieldSchema.format && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {fieldSchema.format}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {fieldSchema.required ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Required
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Optional
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {fieldSchema.description || 'No description'}
                          {fieldSchema.default !== undefined && (
                            <div className="mt-1 text-xs text-gray-500">
                              Default:{' '}
                              <code className="bg-gray-100 px-1 rounded">
                                {JSON.stringify(fieldSchema.default)}
                              </code>
                            </div>
                          )}
                          {fieldSchema.examples && fieldSchema.examples.length > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              Example:{' '}
                              <code className="bg-gray-100 px-1 rounded">
                                {JSON.stringify(fieldSchema.examples[0])}
                              </code>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sample Input */}
              {sampleInput && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Sample Input</label>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(sampleInput, null, 2), 'input')}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      {copiedInput ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    {JSON.stringify(sampleInput, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No input parameters defined</p>
              <p className="text-xs mt-1">This block doesn't require any configuration</p>
            </div>
          )}
        </div>
      </div>

      {/* Arrow Separator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-full shadow-lg">
          <span className="text-sm font-medium">Block Execution</span>
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>

      {/* Output Schema */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-green-900 flex items-center">
            <FileJson className="w-5 h-5 mr-2" />
            Output Schema
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Output Format</p>
                <p className="text-xs text-blue-700 mt-1">
                  The output format depends on the block's execution result. Below is a sample based
                  on typical output for this block type.
                </p>
              </div>
            </div>
          </div>

          {/* Sample Output */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Sample Output</label>
              <button
                onClick={() => copyToClipboard(JSON.stringify(sampleOutput, null, 2), 'output')}
                className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-800"
              >
                {copiedOutput ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {JSON.stringify(sampleOutput, null, 2)}
            </pre>
          </div>

          {/* Output Fields Description */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Output Fields</label>
            <div className="space-y-2">
              {Object.entries(sampleOutput).map(([key, value]) => (
                <div key={key} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <code className="flex-shrink-0 font-mono text-sm text-gray-900 mr-3">{key}</code>
                  <div className="flex-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">
                      {typeof value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Example */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-3">Usage in Workflow</h3>
        <div className="space-y-2 text-sm text-purple-800">
          <p>
            • Access output in expressions using:{' '}
            <code className="bg-purple-100 px-2 py-1 rounded">
              $node["{block.manifest?.name || block.type}"].json
            </code>
          </p>
          <p>
            • Reference specific fields:{' '}
            <code className="bg-purple-100 px-2 py-1 rounded">
              $node["{block.manifest?.name || block.type}"].json.{Object.keys(sampleOutput)[0]}
            </code>
          </p>
          <p>• Use in downstream blocks as parameter values or conditional logic</p>
        </div>
      </div>
    </div>
  )
}
