/**
 * Block Test Lab - Comprehensive UI for Testing AI Block Generation & Execution
 *
 * Features:
 * - AI Chatbot for block generation guidance
 * - Block creation with natural language
 * - Live block execution with input/output preview
 * - Execution logs and metrics
 * - Multiple block type support
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send, PlayCircle, Plus, Bot, Code, Zap, CheckCircle,
  XCircle, Clock, MessageSquare, Terminal, Activity
} from 'lucide-react';
import { apiClient as api } from '../services/api';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface BlockExecutionResult {
  execution_id: string;
  block_id: string;
  status: 'success' | 'failure' | 'timeout' | 'retry';
  outputs?: Record<string, any>;
  error?: string;
  duration_ms: number;
  retry_count: number;
  executed_at: string;
  logs: string[];
}

const BlockTestLab: React.FC = () => {
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your AI assistant. I can help you create and test workflow blocks. What would you like to build today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Block State
  const [generatedBlock, setGeneratedBlock] = useState<any>(null);
  const [blockInputs, setBlockInputs] = useState<Record<string, any>>({});
  const [executionResult, setExecutionResult] = useState<BlockExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'chat' | 'block' | 'test' | 'results'>('chat');

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Chat Message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chatbot/chat', {
        messages: [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp
        }))
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.message.content,
        timestamp: response.data.message.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check for block generation intent
      if (response.data.intent === 'generate_block') {
        // Auto-switch to block tab
        setActiveTab('block');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `❌ Error: ${error.response?.data?.detail || error.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Block from Description
  const generateBlock = async (description: string) => {
    setIsLoading(true);
    try {
      // Get user's organization
      const orgResponse = await api.get('/users/me/organizations');
      const orgId = orgResponse.data[0]?.id;

      if (!orgId) {
        throw new Error('No organization found');
      }

      const response = await api.post('/generate-block', {
        description,
        organization_id: orgId
      });

      setGeneratedBlock(response.data.block_data);
      setActiveTab('block');

      // Add success message to chat
      const successMessage: ChatMessage = {
        role: 'assistant',
        content: `✅ Block "${response.data.block_data.name}" generated successfully! Check the Block tab to review and test it.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error: any) {
      console.error('Block generation error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `❌ Block generation failed: ${error.response?.data?.detail || error.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute Block
  const executeBlock = async () => {
    if (!generatedBlock?.id) {
      alert('No block generated yet!');
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const response = await api.post(`/blocks/execute/${generatedBlock.id}`, {
        block_id: generatedBlock.id,
        inputs: blockInputs,
        context: { source: 'test-lab' },
        dry_run: false
      });

      setExecutionResult(response.data);
      setActiveTab('results');
    } catch (error: any) {
      console.error('Execution error:', error);
      setExecutionResult({
        execution_id: 'error',
        block_id: generatedBlock.id,
        status: 'failure',
        error: error.response?.data?.detail || error.message,
        duration_ms: 0,
        retry_count: 0,
        executed_at: new Date().toISOString(),
        logs: [`Error: ${error.response?.data?.detail || error.message}`]
      });
      setActiveTab('results');
    } finally {
      setIsExecuting(false);
    }
  };

  // Render Chat Tab
  const renderChatTab = () => (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="flex items-start gap-2">
                {msg.role === 'assistant' && <Bot className="w-4 h-4 mt-1" />}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 animate-pulse" />
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
            placeholder="Ask me anything... (e.g., 'Create a block that sends emails')"
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => generateBlock(input)}
            disabled={isLoading || !input.trim()}
            className="text-sm bg-purple-500 text-white rounded px-3 py-1 hover:bg-purple-600 disabled:opacity-50"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Generate Block
          </button>
        </div>
      </div>
    </div>
  );

  // Render Block Tab
  const renderBlockTab = () => {
    if (!generatedBlock) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No block generated yet</p>
            <p className="text-sm mt-2">Use the chat to create a block first</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 overflow-y-auto h-full">
        <div className="space-y-4">
          {/* Block Info */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{generatedBlock.name}</h3>
            <p className="text-gray-300 text-sm mb-3">{generatedBlock.description}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                {generatedBlock.type}
              </span>
              <span className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded">
                v{generatedBlock.version || '1.0.0'}
              </span>
            </div>
          </div>

          {/* Block Code (if function type) */}
          {generatedBlock.code && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-2">Code</h4>
              <pre className="bg-gray-900 text-gray-300 text-xs p-3 rounded overflow-x-auto">
                {generatedBlock.code}
              </pre>
            </div>
          )}

          {/* Inputs Schema */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Inputs</h4>
            {generatedBlock.io?.inputs?.length > 0 ? (
              <ul className="space-y-2">
                {generatedBlock.io.inputs.map((input: any, idx: number) => (
                  <li key={idx} className="text-sm text-gray-300">
                    <span className="font-mono text-blue-400">{input.name}</span>
                    <span className="text-gray-500 mx-2">:</span>
                    <span className="text-purple-400">{input.type}</span>
                    {input.required && <span className="text-red-400 ml-2">*</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No inputs</p>
            )}
          </div>

          {/* Outputs Schema */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Outputs</h4>
            {generatedBlock.io?.outputs?.length > 0 ? (
              <ul className="space-y-2">
                {generatedBlock.io.outputs.map((output: any, idx: number) => (
                  <li key={idx} className="text-sm text-gray-300">
                    <span className="font-mono text-green-400">{output.name}</span>
                    <span className="text-gray-500 mx-2">:</span>
                    <span className="text-purple-400">{output.type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No outputs</p>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => setActiveTab('test')}
            className="w-full bg-green-500 text-white rounded-lg py-3 hover:bg-green-600 font-semibold"
          >
            <Zap className="w-5 h-5 inline mr-2" />
            Test This Block
          </button>
        </div>
      </div>
    );
  };

  // Render Test Tab
  const renderTestTab = () => {
    if (!generatedBlock) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <Terminal className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No block to test</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 overflow-y-auto h-full">
        <h3 className="text-xl font-semibold text-white mb-4">Test: {generatedBlock.name}</h3>

        {/* Input Form */}
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-white mb-3">Input Values</h4>
          {generatedBlock.io?.inputs?.length > 0 ? (
            <div className="space-y-3">
              {generatedBlock.io.inputs.map((input: any) => (
                <div key={input.name}>
                  <label className="block text-sm text-gray-300 mb-1">
                    {input.name}
                    {input.required && <span className="text-red-400 ml-1">*</span>}
                    <span className="text-gray-500 ml-2">({input.type})</span>
                  </label>
                  <input
                    type={input.type === 'number' ? 'number' : 'text'}
                    value={blockInputs[input.name] || ''}
                    onChange={(e) => setBlockInputs(prev => ({
                      ...prev,
                      [input.name]: input.type === 'number' ? Number(e.target.value) : e.target.value
                    }))}
                    placeholder={input.description || `Enter ${input.name}`}
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No inputs required</p>
          )}
        </div>

        {/* Execute Button */}
        <button
          onClick={executeBlock}
          disabled={isExecuting}
          className="w-full bg-blue-500 text-white rounded-lg py-3 hover:bg-blue-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExecuting ? (
            <>
              <Activity className="w-5 h-5 inline mr-2 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <PlayCircle className="w-5 h-5 inline mr-2" />
              Execute Block
            </>
          )}
        </button>
      </div>
    );
  };

  // Render Results Tab
  const renderResultsTab = () => {
    if (!executionResult) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No execution results yet</p>
          </div>
        </div>
      );
    }

    const isSuccess = executionResult.status === 'success';

    return (
      <div className="p-6 overflow-y-auto h-full">
        {/* Status Banner */}
        <div className={`rounded-lg p-4 mb-4 ${
          isSuccess ? 'bg-green-900/30 border border-green-500' : 'bg-red-900/30 border border-red-500'
        }`}>
          <div className="flex items-center gap-3">
            {isSuccess ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                {isSuccess ? 'Execution Successful' : 'Execution Failed'}
              </h3>
              <div className="flex gap-4 text-sm text-gray-300 mt-1">
                <span><Clock className="w-3 h-3 inline mr-1" />{executionResult.duration_ms.toFixed(2)}ms</span>
                {executionResult.retry_count > 0 && (
                  <span>Retries: {executionResult.retry_count}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Outputs */}
        {isSuccess && executionResult.outputs && (
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-white mb-2">Outputs</h4>
            <pre className="bg-gray-900 text-gray-300 text-xs p-3 rounded overflow-x-auto">
              {JSON.stringify(executionResult.outputs, null, 2)}
            </pre>
          </div>
        )}

        {/* Error */}
        {!isSuccess && executionResult.error && (
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-red-400 mb-2">Error</h4>
            <pre className="bg-gray-900 text-red-300 text-xs p-3 rounded overflow-x-auto">
              {executionResult.error}
            </pre>
          </div>
        )}

        {/* Logs */}
        {executionResult.logs && executionResult.logs.length > 0 && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Execution Logs</h4>
            <div className="bg-gray-900 text-gray-300 text-xs p-3 rounded space-y-1 font-mono">
              {executionResult.logs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Block Test Lab</h1>
          <p className="text-gray-400">AI-powered block generation, testing, and execution</p>
        </div>

        {/* Main Container */}
        <div className="bg-gray-800 rounded-lg shadow-2xl h-[calc(100vh-200px)]">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {[
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'block', label: 'Block', icon: Code },
              { id: 'test', label: 'Test', icon: Terminal },
              { id: 'results', label: 'Results', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-750'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-750'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="h-[calc(100%-49px)]">
            {activeTab === 'chat' && renderChatTab()}
            {activeTab === 'block' && renderBlockTab()}
            {activeTab === 'test' && renderTestTab()}
            {activeTab === 'results' && renderResultsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockTestLab;
