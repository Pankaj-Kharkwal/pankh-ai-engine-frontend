// Expression evaluation engine for N8N-style expressions
// This provides a safe way to evaluate expressions like $node["HTTP Request"].json.data[0].name

export interface ExpressionContext {
  $node: Record<string, any>
  $workflow: Record<string, any>
  $execution: Record<string, any>
  $items: any[]
  $now: Date
  $today: string
}

export interface EvaluationResult {
  success: boolean
  result?: any
  error?: string
}

export class ExpressionEngine {
  private context: ExpressionContext

  constructor(context: ExpressionContext) {
    this.context = context
  }

  // Main evaluation method
  evaluate(expression: string): EvaluationResult {
    try {
      if (!expression || typeof expression !== 'string') {
        return { success: false, error: 'Invalid expression' }
      }

      // Parse and evaluate the expression
      const result = this.evaluateExpression(expression.trim())
      return { success: true, result }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Evaluation failed',
      }
    }
  }

  private evaluateExpression(expression: string): any {
    // Handle different expression types
    if (expression.startsWith('$node[')) {
      return this.evaluateNodeReference(expression)
    } else if (expression.startsWith('$')) {
      return this.evaluateVariable(expression)
    } else if (expression.startsWith('"') || expression.startsWith("'")) {
      return this.evaluateStringLiteral(expression)
    } else if (/^\d/.test(expression)) {
      return this.evaluateNumberLiteral(expression)
    } else if (expression === 'true' || expression === 'false') {
      return expression === 'true'
    } else if (expression === 'null') {
      return null
    } else if (expression === 'undefined') {
      return undefined
    }

    // Try to evaluate as a complex expression
    return this.evaluateComplexExpression(expression)
  }

  private evaluateNodeReference(expression: string): any {
    // Parse $node["NodeName"].property.subproperty[index]
    const nodeRefRegex = /^\$node\[["']([^"']+)["']\](.*)$/
    const match = expression.match(nodeRefRegex)

    if (!match) {
      throw new Error('Invalid node reference format')
    }

    const [, nodeName, propertyPath] = match

    if (!this.context.$node[nodeName]) {
      throw new Error(`Node "${nodeName}" not found`)
    }

    const nodeData = this.context.$node[nodeName]

    // If no property path, return the whole node data
    if (!propertyPath) {
      return nodeData
    }

    // Evaluate the property path
    return this.evaluatePropertyPath(nodeData, propertyPath)
  }

  private evaluateVariable(expression: string): any {
    const varName = expression.slice(1) // Remove $
    const value = (this.context as any)[`$${varName}`]

    if (value === undefined) {
      throw new Error(`Variable $${varName} not found`)
    }

    return value
  }

  private evaluatePropertyPath(baseValue: any, path: string): any {
    if (!path) return baseValue

    let current = baseValue
    const segments = this.parsePropertyPath(path)

    for (const segment of segments) {
      if (current == null) {
        throw new Error(`Cannot access property "${segment}" of null/undefined`)
      }

      if (segment.type === 'property') {
        current = current[segment.value]
      } else if (segment.type === 'index') {
        const index = parseInt(segment.value)
        if (isNaN(index)) {
          throw new Error(`Invalid array index: ${segment.value}`)
        }
        if (!Array.isArray(current)) {
          throw new Error('Cannot index into non-array value')
        }
        if (index < 0 || index >= current.length) {
          throw new Error(`Array index ${index} out of bounds`)
        }
        current = current[index]
      }
    }

    return current
  }

  private parsePropertyPath(path: string): Array<{ type: 'property' | 'index'; value: string }> {
    const segments: Array<{ type: 'property' | 'index'; value: string }> = []
    let current = path

    while (current) {
      if (current.startsWith('.')) {
        // Property access: .property
        const dotIndex = current.indexOf('.', 1)
        const bracketIndex = current.indexOf('[', 1)

        let endIndex
        if (dotIndex === -1 && bracketIndex === -1) {
          endIndex = current.length
        } else if (dotIndex === -1) {
          endIndex = bracketIndex
        } else if (bracketIndex === -1) {
          endIndex = dotIndex
        } else {
          endIndex = Math.min(dotIndex, bracketIndex)
        }

        const property = current.slice(1, endIndex)
        if (property) {
          segments.push({ type: 'property', value: property })
        }
        current = current.slice(endIndex)
      } else if (current.startsWith('[')) {
        // Array index: [0]
        const endIndex = current.indexOf(']')
        if (endIndex === -1) {
          throw new Error('Unclosed array index bracket')
        }

        const index = current.slice(1, endIndex)
        segments.push({ type: 'index', value: index })
        current = current.slice(endIndex + 1)
      } else {
        throw new Error(`Unexpected character in property path: ${current[0]}`)
      }
    }

    return segments
  }

  private evaluateStringLiteral(expression: string): string {
    // Simple string evaluation - in production, use a proper parser
    if (
      (expression.startsWith('"') && expression.endsWith('"')) ||
      (expression.startsWith("'") && expression.endsWith("'"))
    ) {
      return expression.slice(1, -1)
    }
    throw new Error('Invalid string literal')
  }

  private evaluateNumberLiteral(expression: string): number {
    const num = parseFloat(expression)
    if (isNaN(num)) {
      throw new Error('Invalid number literal')
    }
    return num
  }

  private evaluateComplexExpression(expression: string): any {
    // For complex expressions, we need a more sophisticated approach
    // This is a simplified version - in production, use a proper expression parser

    // Handle basic operations
    if (expression.includes(' + ')) {
      const [left, right] = expression.split(' + ', 2)
      return this.evaluateExpression(left.trim()) + this.evaluateExpression(right.trim())
    }

    if (expression.includes(' == ')) {
      const [left, right] = expression.split(' == ', 2)
      return this.evaluateExpression(left.trim()) === this.evaluateExpression(right.trim())
    }

    if (expression.includes(' && ')) {
      const [left, right] = expression.split(' && ', 2)
      return this.evaluateExpression(left.trim()) && this.evaluateExpression(right.trim())
    }

    if (expression.includes(' || ')) {
      const [left, right] = expression.split(' || ', 2)
      return this.evaluateExpression(left.trim()) || this.evaluateExpression(right.trim())
    }

    // If we can't parse it, treat it as a variable or throw an error
    if (expression.startsWith('$')) {
      return this.evaluateVariable(expression)
    }

    throw new Error(`Unsupported expression: ${expression}`)
  }

  // Get available completions for auto-completion
  getCompletions(prefix: string): Array<{ label: string; detail: string; type: string }> {
    const completions: Array<{ label: string; detail: string; type: string }> = []

    // Node completions
    Object.keys(this.context.$node).forEach(nodeName => {
      completions.push({
        label: `$node["${nodeName}"]`,
        detail: `Reference to ${nodeName} node`,
        type: 'node',
      })

      // Add common properties
      completions.push({
        label: `$node["${nodeName}"].json`,
        detail: 'JSON output data',
        type: 'property',
      })

      completions.push({
        label: `$node["${nodeName}"].binary`,
        detail: 'Binary data',
        type: 'property',
      })
    })

    // Variable completions
    const variables = ['$workflow', '$execution', '$items', '$now', '$today']
    variables.forEach(variable => {
      completions.push({
        label: variable,
        detail: `Global ${variable.slice(1)} variable`,
        type: 'variable',
      })
    })

    // Method completions
    const methods = ['.length', '.map()', '.filter()', '.find()', '.includes()']
    methods.forEach(method => {
      completions.push({
        label: method,
        detail: 'Array/Object method',
        type: 'method',
      })
    })

    // Filter by prefix
    if (prefix) {
      return completions.filter(c => c.label.toLowerCase().includes(prefix.toLowerCase()))
    }

    return completions
  }
}

// Factory function to create expression engine with context
export function createExpressionEngine(
  nodes: Array<{ id: string; name: string; data?: any }>,
  workflowData: any = {},
  executionData: any = {},
  items: any[] = []
): ExpressionEngine {
  const context: ExpressionContext = {
    $node: nodes.reduce(
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
    $workflow: workflowData,
    $execution: executionData,
    $items: items,
    $now: new Date(),
    $today: new Date().toISOString().split('T')[0],
  }

  return new ExpressionEngine(context)
}

// Utility function for quick evaluation
export function evaluateExpression(
  expression: string,
  nodes: Array<{ id: string; name: string; data?: any }>,
  workflowData: any = {},
  executionData: any = {},
  items: any[] = []
): EvaluationResult {
  const engine = createExpressionEngine(nodes, workflowData, executionData, items)
  return engine.evaluate(expression)
}
