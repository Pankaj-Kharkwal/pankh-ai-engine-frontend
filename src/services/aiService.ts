// AI Service using configurable workflow blocks instead of generating new blocks
import { apiClient } from './api'

export interface AIWorkflowRequest {
  task: string
  context?: string
  parameters?: Record<string, any>
  workflowType?: 'chat' | 'research' | 'code' | 'creative' | 'analysis'
}

export interface AIWorkflowResult {
  workflowId: string
  executionId: string
  result: any
  executionTime: number
}

class AIService {
  async executeAIWorkflow(request: AIWorkflowRequest): Promise<AIWorkflowResult> {
    // Create a workflow using existing configurable blocks instead of generating new ones
    const workflow = this.createAIWorkflow(request)

    // Create the workflow
    const workflowResponse = await apiClient.createWorkflow(workflow)

    // Execute the workflow
    const executionResponse = await apiClient.runWorkflow(workflowResponse.id)

    // Wait for completion and get results
    const result = await this.waitForWorkflowCompletion(executionResponse.id)

    return {
      workflowId: workflowResponse.id,
      executionId: executionResponse.id,
      result,
      executionTime: result.executionTime || 0,
    }
  }

  private createAIWorkflow(request: AIWorkflowRequest) {
    const workflowType = request.workflowType || 'chat'

    switch (workflowType) {
      case 'chat':
        return this.createChatWorkflow(request)
      case 'research':
        return this.createResearchWorkflow(request)
      case 'code':
        return this.createCodeWorkflow(request)
      case 'creative':
        return this.createCreativeWorkflow(request)
      case 'analysis':
        return this.createAnalysisWorkflow(request)
      default:
        return this.createChatWorkflow(request)
    }
  }

  private createChatWorkflow(request: AIWorkflowRequest) {
    const systemPrompt = request.parameters?.systemPrompt || 'You are a helpful AI assistant.'
    const temperature = request.parameters?.temperature || 0.7

    return {
      name: `AI Chat: ${request.task.substring(0, 50)}`,
      description: `AI chat workflow for: ${request.task}`,
      graph: {
        nodes: [
          {
            id: 'chat',
            type: 'azure_chat',
            parameters: {
              system: systemPrompt,
              prompt: request.task,
              temperature: temperature,
              max_context_chars: 4000,
            },
          },
          {
            id: 'output',
            type: 'echo',
            parameters: {
              message: '{{chat.azure_chat.text}}',
            },
          },
        ],
        edges: [{ from_node: 'chat', to_node: 'output' }],
      },
    }
  }

  private createResearchWorkflow(request: AIWorkflowRequest) {
    return {
      name: `Research: ${request.task.substring(0, 50)}`,
      description: `Research and summarization workflow for: ${request.task}`,
      graph: {
        nodes: [
          {
            id: 'search',
            type: 'searxng_search',
            parameters: {
              query: request.task,
              limit: 15,
            },
          },
          {
            id: 'scrape',
            type: 'scrape_urls',
            parameters: {
              top_n_from_searx: 5,
              max_chars_per_doc: 3000,
            },
          },
          {
            id: 'summarize',
            type: 'azure_chat',
            parameters: {
              system:
                'You are a research assistant. Summarize the key findings from the provided content.',
              prompt: `Summarize the following research content:\n\n{{scrape.scraped_docs}}\n\nFocus on: ${request.context || 'key insights and findings'}`,
              temperature: 0.3,
              max_context_chars: 8000,
            },
          },
          {
            id: 'output',
            type: 'echo',
            parameters: {
              message: '{{summarize.azure_chat.text}}',
            },
          },
        ],
        edges: [
          { from_node: 'search', to_node: 'scrape' },
          { from_node: 'scrape', to_node: 'summarize' },
          { from_node: 'summarize', to_node: 'output' },
        ],
      },
    }
  }

  private createCodeWorkflow(request: AIWorkflowRequest) {
    const language = request.parameters?.language || 'Python'

    return {
      name: `Code Generation: ${request.task.substring(0, 50)}`,
      description: `Code generation workflow for: ${request.task}`,
      graph: {
        nodes: [
          {
            id: 'generate',
            type: 'azure_chat',
            parameters: {
              system: `You are an expert ${language} developer. Generate clean, well-documented code with proper error handling.`,
              prompt: `Generate ${language} code for: ${request.task}\n\n${request.context ? `Additional context: ${request.context}` : ''}\n\nInclude comments and handle edge cases.`,
              temperature: 0.2,
              max_context_chars: 2000,
            },
          },
          {
            id: 'output',
            type: 'echo',
            parameters: {
              message: '{{generate.azure_chat.text}}',
            },
          },
        ],
        edges: [{ from_node: 'generate', to_node: 'output' }],
      },
    }
  }

  private createCreativeWorkflow(request: AIWorkflowRequest) {
    const contentType = request.parameters?.contentType || 'article'
    const writingStyle = request.parameters?.writingStyle || 'engaging'
    const tone = request.parameters?.tone || 'professional'
    const length = request.parameters?.length || 'medium'

    return {
      name: `Creative Writing: ${request.task.substring(0, 50)}`,
      description: `Creative writing workflow for: ${request.task}`,
      graph: {
        nodes: [
          {
            id: 'write',
            type: 'azure_chat',
            parameters: {
              system: 'You are a creative writing assistant. Help generate engaging content.',
              prompt: `Write a ${contentType} about: ${request.task}\n\nStyle: ${writingStyle}\nTone: ${tone}\nLength: ${length}\n\n${request.context ? `Additional context: ${request.context}` : ''}`,
              temperature: 0.8,
              max_context_chars: 4000,
            },
          },
          {
            id: 'output',
            type: 'echo',
            parameters: {
              message: '{{write.azure_chat.text}}',
            },
          },
        ],
        edges: [{ from_node: 'write', to_node: 'output' }],
      },
    }
  }

  private createAnalysisWorkflow(request: AIWorkflowRequest) {
    const analysisFocus = request.parameters?.analysisFocus || 'insights and recommendations'

    return {
      name: `Data Analysis: ${request.task.substring(0, 50)}`,
      description: `Data analysis workflow for: ${request.task}`,
      graph: {
        nodes: [
          {
            id: 'analyze',
            type: 'azure_chat',
            parameters: {
              system:
                'You are a data analysis expert. Provide insights and recommendations based on data.',
              prompt: `Analyze this data and provide insights:\n\n${request.task}\n\n${request.context ? `Additional context: ${request.context}` : ''}\n\nFocus on: ${analysisFocus}`,
              temperature: 0.3,
              max_context_chars: 6000,
            },
          },
          {
            id: 'output',
            type: 'echo',
            parameters: {
              message: '{{analyze.azure_chat.text}}',
            },
          },
        ],
        edges: [{ from_node: 'analyze', to_node: 'output' }],
      },
    }
  }

  private async waitForWorkflowCompletion(executionId: string): Promise<any> {
    const maxWaitTime = 30000 // 30 seconds
    const pollInterval = 1000 // 1 second
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const status = await apiClient.getExecutionStatus(executionId)

        if (status.status === 'completed') {
          return {
            ...status.outputs,
            executionTime: Date.now() - startTime,
          }
        } else if (status.status === 'failed') {
          throw new Error(`Workflow execution failed: ${status.error || 'Unknown error'}`)
        }

        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      } catch (error) {
        if (error.message.includes('not found')) {
          // Execution might not be created yet, wait and retry
          await new Promise(resolve => setTimeout(resolve, pollInterval))
          continue
        }
        throw error
      }
    }

    throw new Error('Workflow execution timed out')
  }

  // Legacy methods for backward compatibility (deprecated)
  async generateBlock(request: any): Promise<any> {
    throw new Error('Block generation is deprecated. Use executeAIWorkflow instead.')
  }

  async validateGeneratedCode(code: string): Promise<any> {
    throw new Error('Code validation is deprecated. Use workflow-based AI execution instead.')
  }

  async deployGeneratedBlock(block: any): Promise<void> {
    throw new Error('Block deployment is deprecated. Use workflow-based AI execution instead.')
  }
}

export const aiService = new AIService()
