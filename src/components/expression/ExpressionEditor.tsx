import React, { useRef, useEffect, useState, useMemo } from 'react'
import Editor from '@monaco-editor/react'
import { Check, X, Play, AlertCircle, Info } from 'lucide-react'
import * as monaco from 'monaco-editor'

interface ExpressionEditorProps {
  value: string
  onChange: (value: string) => void
  onSave: (value: string) => void
  onCancel: () => void
  availableNodes?: Array<{
    id: string
    name: string
    type: string
    data?: any
  }>
  contextData?: Record<string, any>
  placeholder?: string
  title?: string
}

interface ValidationResult {
  isValid: boolean
  error?: string
  result?: any
}

export default function ExpressionEditor({
  value,
  onChange,
  onSave,
  onCancel,
  availableNodes = [],
  contextData = {},
  placeholder = 'Enter expression...',
  title = 'Expression Editor',
}: ExpressionEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
  })
  const [isEvaluating, setIsEvaluating] = useState(false)

  // Expression language definition
  const expressionLanguage = useMemo(
    () => ({
      tokenizer: {
        root: [
          // Node references: $node["NodeName"]
          [/\$\w+\[["']/, { token: 'keyword', next: '@nodeRef' }],
          // Variables: $workflow, $execution, $items
          [/\$\w+/, 'variable'],
          // Strings
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/"/, { token: 'string.quote', bracket: '@open', next: '@string_double' }],
          [/'/, { token: 'string.quote', bracket: '@open', next: '@string_single' }],
          // Numbers
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/\d+/, 'number'],
          // Operators
          [/[+\-*/%=<>!&|]/, 'operator'],
          // Brackets
          [/[{}()\[\]]/, '@brackets'],
          // Property access
          [/\.\w+/, 'property'],
        ],
        nodeRef: [
          [/[^"'\]]*/, 'string'],
          [/\]/, { token: 'keyword', next: '@pop' }],
        ],
        string_double: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
        ],
        string_single: [
          [/[^\\']+/, 'string'],
          [/\\./, 'string.escape'],
          [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
        ],
      },
    }),
    []
  )

  // Auto-completion provider
  const completionProvider = useMemo(
    () => ({
      provideCompletionItems: (model: monaco.editor.ITextModel, position: monaco.Position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions: monaco.languages.CompletionItem[] = []

        // Node references
        availableNodes.forEach(node => {
          suggestions.push({
            label: `$node["${node.name}"]`,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: `$node["${node.name}"]`,
            detail: `Reference to ${node.type} node`,
            range,
          })

          // Add common properties
          if (node.data?.outputData) {
            suggestions.push({
              label: `$node["${node.name}"].json`,
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: `$node["${node.name}"].json`,
              detail: 'JSON output data',
              range,
            })
          }
        })

        // Global variables
        const globalVars = ['$workflow', '$execution', '$items', '$now', '$today']
        globalVars.forEach(variable => {
          suggestions.push({
            label: variable,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: variable,
            detail: `Global ${variable.slice(1)} variable`,
            range,
          })
        })

        // Common methods
        const methods = ['.length', '.map()', '.filter()', '.reduce()', '.find()', '.includes()']
        methods.forEach(method => {
          suggestions.push({
            label: method,
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: method,
            detail: `Array/Object method`,
            range,
          })
        })

        return { suggestions }
      },
    }),
    [availableNodes]
  )

  // Configure Monaco Editor
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor

    // Register custom language
    monaco.languages.register({ id: 'n8n-expression' })
    monaco.languages.setMonarchTokensProvider('n8n-expression', expressionLanguage)

    // Register completion provider
    monaco.languages.registerCompletionItemProvider('n8n-expression', completionProvider)

    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      lineNumbers: 'off',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleEvaluate()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave()
    })
  }

  // Expression evaluation
  const evaluateExpression = async (expression: string): Promise<ValidationResult> => {
    try {
      // Build context for evaluation
      const context = {
        $node: availableNodes.reduce(
          (acc, node) => {
            acc[node.name] = {
              json: node.data?.outputData || {},
              binary: node.data?.binaryData || {},
              ...node.data,
            }
            return acc
          },
          {} as Record<string, any>
        ),
        $workflow: contextData.workflow || {},
        $execution: contextData.execution || {},
        $items: contextData.items || [],
        $now: new Date(),
        $today: new Date().toISOString().split('T')[0],
      }

      // Simple expression evaluation (in production, use a proper expression engine)
      const result = evaluateSimpleExpression(expression, context)
      return { isValid: true, result }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid expression',
      }
    }
  }

  // Simple expression evaluator (replace with proper engine like n8n's)
  const evaluateSimpleExpression = (expression: string, context: any): any => {
    // This is a simplified evaluator - in production, use a proper expression parser
    try {
      // Handle basic node references
      let processed = expression

      // Replace $node["NodeName"] with actual data
      Object.keys(context.$node).forEach(nodeName => {
        const regex = new RegExp(`\\$node\\["${nodeName}"\\]`, 'g')
        processed = processed.replace(regex, `context.$node["${nodeName}"]`)
      })

      // Replace other variables
      processed = processed.replace(/\$(\w+)/g, 'context.$$1')

      // Evaluate (in production, use a safer evaluation method)
      // eslint-disable-next-line no-new-func
      const result = Function('context', `return ${processed}`)(context)
      return result
    } catch (error) {
      throw new Error(`Expression evaluation failed: ${error}`)
    }
  }

  const handleEvaluate = async () => {
    if (!value.trim()) return

    setIsEvaluating(true)
    try {
      const result = await evaluateExpression(value)
      setValidation(result)
    } catch (error) {
      setValidation({
        isValid: false,
        error: error instanceof Error ? error.message : 'Evaluation failed',
      })
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleSave = () => {
    if (validation.isValid || !value.trim()) {
      onSave(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !value.trim()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEvaluating ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Test
            </button>
            <button
              onClick={handleSave}
              disabled={!validation.isValid && value.trim()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0">
          <Editor
            height="300px"
            language="n8n-expression"
            value={value}
            onChange={val => onChange(val || '')}
            onMount={handleEditorDidMount}
            options={{
              placeholder,
              theme: 'vs-light',
              fontSize: 14,
              lineNumbers: 'off',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Validation Result */}
        <div className="border-t p-4">
          <div className="flex items-start gap-3">
            {validation.isValid ? (
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">
                {validation.isValid ? 'Expression is valid' : 'Expression error'}
              </div>

              {validation.error && (
                <div className="text-sm text-red-600 mt-1">{validation.error}</div>
              )}

              {validation.isValid && validation.result !== undefined && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-1">Result:</div>
                  <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                    {JSON.stringify(validation.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Help */}
        <div className="border-t bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>
              Use <code className="bg-gray-200 px-1 rounded text-xs">$node["NodeName"]</code> to
              reference node data. Press{' '}
              <kbd className="bg-gray-200 px-1 rounded text-xs">Ctrl+Enter</kbd> to test,
              <kbd className="bg-gray-200 px-1 rounded text-xs">Ctrl+S</kbd> to save.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
