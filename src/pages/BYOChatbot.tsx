import React, { useState, useMemo } from 'react'
import { MessageSquare, Plus, Settings, Play, Code, Zap, Database, Send, Cpu, LayoutGrid, Layers, FileText, ShoppingCart, Headset, Link, Loader, Sparkles } from 'lucide-react'

// --- Data Definitions ---

const initialTemplates = [
  {
    id: 1,
    name: 'Customer Support Bot',
    description: 'Handles inquiries, processes returns, and escalates complex tickets.',
    blocks: ['Intent Classification', 'Response Generation', 'API Integration', 'Escalation/Handoff'],
    icon: '🎧',
    category: 'Support'
  },
  {
    id: 2,
    name: 'Sales Assistant Bot',
    description: 'Qualifies leads, delivers product info, and schedules demos automatically.',
    blocks: ['Lead Qualification', 'Product Catalog', 'Calendar Integration', 'CRM Sync'],
    icon: '💼',
    category: 'Sales'
  },
  {
    id: 3,
    name: 'FAQ Knowledge Bot',
    description: 'Answers frequently asked questions using intelligent semantic search.',
    blocks: ['Knowledge Base', 'Semantic Search', 'Answer Ranking', 'Feedback Loop'],
    icon: '❓',
    category: 'Information'
  },
  {
    id: 4,
    name: 'HR Onboarding Guide',
    description: 'Guides new hires through paperwork, policies, and internal systems.',
    blocks: ['File Access Control', 'Policy Search', 'Form Submission', 'Notification'],
    icon: '🧑‍💼',
    category: 'Internal HR'
  },
  {
    id: 5,
    name: 'E-commerce Cart Bot',
    description: 'Recovers abandoned carts, manages discounts, and tracks orders.',
    blocks: ['Database Query', 'Webhook Trigger', 'Order Tracking', 'Payment Gateway'],
    icon: '🛒',
    category: 'E-commerce'
  },
  {
    id: 6,
    name: 'IT Helpdesk Resolver',
    description: 'Diagnoses common technical issues and logs complex tickets to Jira.',
    blocks: ['Diagnostic Tree', 'Ticket Creation', 'Device Lookup', 'Email Notification'],
    icon: '🖥️',
    category: 'IT/Ops'
  },
  {
    id: 7,
    name: 'Data Reporting Bot',
    description: 'Queries internal metrics databases and generates real-time charts/reports.',
    blocks: ['Database Query', 'Data Formatting', 'Security Check', 'Report Generation'],
    icon: '📊',
    category: 'Business Intel'
  },
  {
    id: 8,
    name: 'Internal Knowledge Navigator',
    description: 'Searches documents and provides summarized answers for internal teams.',
    blocks: ['Document Parsing', 'Summary Generation', 'Access Log', 'User Feedback'],
    icon: '📚',
    category: 'Information'
  },
  {
    id: 9,
    name: 'Language Translator Bot',
    description: 'Provides instant, context-aware, multi-lingual message translation.',
    blocks: ['Language Detection', 'Translation Model', 'Context Memory', 'Output Format'],
    icon: '🌍',
    category: 'Utility'
  },
  {
    id: 10,
    name: 'Game Master Bot',
    description: 'Runs a text-based adventure, trivia, or role-playing game session.',
    blocks: ['State Management', 'Randomizer', 'Narrative Generation', 'Score Tracker'],
    icon: '🎲',
    category: 'Entertainment'
  }
]

const availableBlocks = [
  { name: 'Intent Classification', icon: Zap, color: 'text-purple-600', category: 'AI/LLM' },
  { name: 'Response Generation', icon: Cpu, color: 'text-green-600', category: 'AI/LLM' },
  { name: 'Database Query', icon: Database, color: 'text-amber-600', category: 'Data' },
  { name: 'API Integration', icon: Settings, color: 'text-cyan-600', category: 'Integration' },
  { name: 'Webhook Trigger', icon: Send, color: 'text-orange-600', category: 'Integration' },
  { name: 'Knowledge Base', icon: FileText, color: 'text-blue-600', category: 'Data' },
  { name: 'Escalation/Handoff', icon: Headset, color: 'text-red-600', category: 'Workflow' },
  { name: 'Conditional Logic', icon: LayoutGrid, color: 'text-pink-600', category: 'Workflow' },
]

// Step configuration for the new tabbed layout
const stepConfig = [
  { id: 1, name: 'Setup & Templates', icon: MessageSquare },
  { id: 2, name: 'Configuration', icon: Settings },
  { id: 3, name: 'Workflow Canvas', icon: LayoutGrid },
  { id: 4, name: 'Preview & Deploy', icon: Play },
];

// Component for the block in the workflow view
const WorkflowBlock = ({ name, icon: Icon, color }) => (
  <div className={`p-4 rounded-xl shadow-lg border border-opacity-20 border-gray-300 backdrop-blur-md bg-white/80 flex flex-col items-center space-y-2 transition-transform transform hover:scale-[1.03] duration-300 text-gray-800 min-w-[120px]`}>
    <Icon className={`w-7 h-7 ${color}`} />
    <div className='text-xs font-semibold text-center'>{name}</div>
  </div>
);

export default function BYOChatbot() {
  const [chatbotTemplates, setChatbotTemplates] = useState(initialTemplates);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState(1);
  const [chatbotName, setChatbotName] = useState('Customer Support Bot');
  const [testMessage, setTestMessage] = useState('I need help with my order');
  const [chatHistory, setChatHistory] = useState([
    { text: 'Hi! How can I help you today?', isBot: true, isStarter: true },
    { text: 'I need help with my order', isBot: false },
  ]);

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerationMessage, setAiGenerationMessage] = useState('');
  
  // Derive the active blocks for the workflow visualization
  const activeTemplate = useMemo(() => chatbotTemplates.find(t => t.id === selectedTemplateId), [selectedTemplateId, chatbotTemplates]);

  // Combine active blocks with their corresponding full block details
  const workflowBlocks = useMemo(() => {
    if (!activeTemplate) return [];
    return activeTemplate.blocks.map(blockName => {
      const blockDetail = availableBlocks.find(b => b.name === blockName);
      // Ensure color is darker for light theme
      return blockDetail || { name: blockName, icon: Layers, color: 'text-gray-600' }; 
    });
  }, [activeTemplate]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplateId(template.id);
    setChatbotName(template.name);
  };
  
  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, stepConfig.length));
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSendMessage = () => {
    if (testMessage.trim() === '') return;

    const newUserMessage = { text: testMessage, isBot: false };
    const botResponse = {
      text: `Processing: Intent identified as '${activeTemplate.category}' for message: "${testMessage}". Running ${activeTemplate.blocks.length} blocks...`,
      isBot: true,
    };

    setChatHistory([...chatHistory, newUserMessage, botResponse]);
    setTestMessage('');
  };

  const handleGenerateWithAI = () => {
    if (aiPrompt.trim() === '') {
      setAiGenerationMessage('Please describe the chatbot you want to build.');
      return;
    }
    
    setIsGenerating(true);
    setAiGenerationMessage('AI is analyzing your request and designing the optimal workflow...');

    // --- Simulation of Gemini API Call ---
    setTimeout(() => {
      // Mock API response structure based on the prompt
      const newBotId = Date.now(); // Unique ID
      const sanitizedPrompt = aiPrompt.length > 50 ? aiPrompt.substring(0, 47) + '...' : aiPrompt;
      
      let generatedBlocks = ['Intent Classification', 'Response Generation', 'Knowledge Base'];
      if (aiPrompt.toLowerCase().includes('database') || aiPrompt.toLowerCase().includes('data')) {
        generatedBlocks.push('Database Query');
      }
      if (aiPrompt.toLowerCase().includes('schedule') || aiPrompt.toLowerCase().includes('api')) {
        generatedBlocks.push('API Integration');
      }

      const newTemplate = {
        id: newBotId,
        name: `AI Generated: ${sanitizedPrompt}`,
        description: `This chatbot was generated based on your prompt: "${aiPrompt}". It uses the following blocks: ${generatedBlocks.join(', ')}.`,
        blocks: generatedBlocks,
        icon: '✨',
        category: 'AI Custom'
      };

      setChatbotTemplates(prev => [...prev, newTemplate]);
      setSelectedTemplateId(newBotId);
      setChatbotName(newTemplate.name);
      
      setIsGenerating(false);
      setAiGenerationMessage(`✨ Successfully created bot: "${newTemplate.name}".`);
      setAiPrompt('');
      
      // Auto advance to Configuration
      setCurrentStep(2); 
    }, 2500); // Simulate network delay
  };

  // Content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Setup & Templates
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Selection */}
            <div className="glass-card p-6 lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-4 text-indigo-700">1. Select a Base Template ({chatbotTemplates.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {chatbotTemplates.filter(t => t.category !== 'AI Custom').map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 cursor-pointer text-center transition-all duration-300 border-2 rounded-xl
                      ${selectedTemplateId === template.id
                        ? 'border-indigo-500 bg-indigo-100 shadow-xl shadow-indigo-500/10 transform scale-[1.02] text-indigo-800' // Purple accent on selection
                        : 'border-gray-200 bg-white/90 hover:bg-indigo-50/70 hover:border-indigo-500/50 text-gray-700'
                      }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="text-4xl mb-2">{template.icon}</div>
                    <h3 className="font-medium text-sm">{template.name}</h3>
                    <div className="text-xs text-gray-500 mt-1">{template.category}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Generation Card */}
            <div className="glass-card p-6 lg:col-span-1">
              <h2 className="text-2xl font-semibold mb-4 text-violet-700 flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-violet-500" />
                Or, Create with AI
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Describe the function of the chatbot you need. E.g., "A bot that queries my Notion database for internal HR policies."</p>
                
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe your custom chatbot..."
                  className="glass-input w-full h-32 resize-none"
                  disabled={isGenerating}
                />
                
                <button
                  onClick={handleGenerateWithAI}
                  className={`w-full px-4 py-3 flex items-center justify-center space-x-2 rounded-xl text-white transition-all duration-300 ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700 transform hover:scale-[1.01]'}`}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  <span>{isGenerating ? 'Designing Workflow...' : 'Generate Chatbot'}</span>
                </button>

                {aiGenerationMessage && (
                  <div className={`p-3 text-sm rounded-lg ${isGenerating ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {aiGenerationMessage}
                  </div>
                )}
                
              </div>
            </div>
          </div>
        );

      case 2: // Configuration
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 md:col-span-2">
              <h2 className="text-2xl font-semibold mb-4 text-violet-700">2. Configure Identity</h2>
              <p className="text-gray-500 mb-6">Review the AI-generated name and description, or manually define your bot.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Chatbot Name</label>
                  <input
                    type="text"
                    value={chatbotName}
                    onChange={(e) => setChatbotName(e.target.value)}
                    placeholder="Enter chatbot name..."
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                  <textarea
                    placeholder="Describe what your chatbot does..."
                    className="glass-input w-full h-24 resize-none"
                    value={activeTemplate ? activeTemplate.description : ''}
                    readOnly
                  />
                </div>
                
                <h3 className="text-xl font-semibold mt-6 text-gray-800">Current Blocks in Workflow:</h3>
                <div className="flex flex-wrap gap-3">
                  {activeTemplate?.blocks.map((blockName) => {
                    const blockDetail = availableBlocks.find(b => b.name === blockName) || { icon: Layers, color: 'text-gray-600' };
                    const Icon = blockDetail.icon;
                    return (
                      <div key={blockName} className="px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 text-sm font-medium flex items-center">
                        <Icon className={`w-4 h-4 mr-2 ${blockDetail.color}`} />
                        {blockName}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Available Blocks Palette (For context/reference) */}
            <div className="glass-card p-6 md:col-span-1">
              <h2 className="text-2xl font-semibold mb-4 text-amber-700">Available Blocks</h2>
              <p className="text-xs text-gray-500 mb-3">Drag and drop blocks in the next step (Canvas).</p>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {availableBlocks.map((block) => (
                  <div key={block.name} className="glass-button p-3 flex items-center transition-all duration-200 hover:scale-[1.02] cursor-move">
                    <block.icon className={`w-5 h-5 mr-3 ${block.color}`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{block.name}</div>
                    </div>
                    <Plus className="w-4 h-4 text-green-500 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Workflow Canvas
        return (
          <div className="glass-card p-6 h-auto min-h-[500px]">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-700">3. Workflow Canvas (Active: {activeTemplate?.name})</h2>
            <p className="text-gray-500 mb-6">Drag and drop, connect, and configure the detailed flow of your chatbot here.</p>

            {/* Workflow Visualization */}
            <div className="flex flex-wrap items-center justify-start gap-4 p-6 bg-gray-200/50 rounded-xl border border-dashed border-gray-400 overflow-x-auto min-h-[350px]">
              {/* User Input Block (Start) */}
              <div className="p-4 rounded-xl shadow-lg bg-indigo-600/90 border border-indigo-400 flex flex-col items-center space-y-2 min-w-[150px] text-white">
                <Layers className="w-8 h-8" />
                <div className='text-sm font-bold text-center'>User Input (Start)</div>
              </div>

              {workflowBlocks.map((block, index) => (
                <React.Fragment key={block.name}>
                  {/* Arrow Connector */}
                  <div className="text-indigo-400 text-3xl font-light mx-2 hidden md:block">
                    <span className="inline-block transform rotate-90 md:rotate-0">&rarr;</span>
                  </div>
                  <WorkflowBlock name={block.name} icon={block.icon} color={block.color} />
                </React.Fragment>
              ))}

              <div className="text-indigo-400 text-3xl font-light mx-2 hidden md:block">
                <span className="inline-block transform rotate-90 md:rotate-0">&rarr;</span>
              </div>
              {/* Final Response Block (End) */}
              <div className="p-4 rounded-xl shadow-lg bg-pink-600/90 border border-pink-400 flex flex-col items-center space-y-2 min-w-[150px] text-white">
                <Headset className="w-8 h-8" />
                <div className='text-sm font-bold text-center'>Final Response (End)</div>
              </div>
            </div>
          </div>
        );

      case 4: // Preview & Deploy
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Preview */}
            <div className="glass-card p-6 lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-4 text-green-700 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Live Preview & Test
              </h2>
              <div className="bg-gray-200 rounded-xl p-4 h-96 flex flex-col border border-gray-300 shadow-inner">
                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                      <div className={`px-4 py-2 rounded-lg max-w-xs transition-all duration-300
                        ${msg.isBot
                          ? (msg.isStarter 
                              ? 'bg-indigo-600 text-white shadow-md' 
                              : 'bg-indigo-100 text-gray-800 border border-indigo-300 shadow-sm') // Light indigo for bot responses
                          : 'bg-violet-600 text-white shadow-md' // Dark violet for user messages
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex mt-4 pt-4 border-t border-gray-300">
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask the chatbot a question..."
                    className="glass-input flex-1 mr-2"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="glass-button px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Export & Deploy */}
            <div className="space-y-6 lg:col-span-1">
              <div className="glass-card p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-orange-700">Export & Integration</h2>
                  <div className="grid grid-cols-2 gap-4">
                      <button className="w-full glass-button p-4 flex flex-col items-center space-y-1 hover:animate-glow">
                          <Code className="w-5 h-5 text-amber-500" />
                          <span className="text-sm">Export Code</span>
                      </button>
                      <button className="w-full glass-button p-4 flex flex-col items-center space-y-1 hover:animate-glow">
                          <Link className="w-5 h-5 text-cyan-600" />
                          <span className="text-sm">Web Widget</span>
                      </button>
                      <button className="w-full glass-button p-4 flex flex-col items-center space-y-1 hover:animate-glow">
                          <Send className="w-5 h-5 text-pink-600" />
                          <span className="text-sm">API Endpoint</span>
                      </button>
                      <button className="w-full glass-button p-4 flex flex-col items-center space-y-1 hover:animate-glow bg-indigo-600 hover:bg-indigo-700 text-white !border-indigo-700">
                        <Play className="w-5 h-5" />
                        <span className="text-sm">Deploy Live</span>
                      </button>
                  </div>
              </div>
              <div className="glass-card p-6">
                <h2 className="text-2xl font-semibold mb-4 text-red-700">Advanced Settings</h2>
                <button className="w-full glass-button p-3 flex items-center justify-center space-x-2 hover:animate-glow">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>Manage Models & Credentials</span>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen p-6 bg-gray-100 text-gray-900 font-inter">
      {/* Global Glass Styles and Gradient Background */}
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7); /* Lighter background */
          border: 1px solid rgba(229, 231, 235, 0.7); /* Light gray border */
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
          transition: all 0.3s ease;
        }
        .glass-button {
          background: rgba(255, 255, 255, 0.8); /* Lighter button background */
          border: 1px solid rgba(229, 231, 235, 0.9);
          backdrop-filter: blur(5px);
          border-radius: 0.75rem;
          transition: all 0.3s ease;
          color: #1f2937; /* Dark text for light theme */
        }
        .glass-button:hover {
          background: rgba(243, 244, 246, 0.9);
        }
        .glass-input {
          background: rgba(249, 250, 251, 0.9);
          border: 1px solid rgba(209, 213, 219, 0.7);
          border-radius: 0.5rem;
          color: #1f2937; /* Dark text */
          padding: 0.75rem 1rem;
          transition: all 0.2s ease;
        }
        .glass-input::placeholder {
          color: #9ca3af;
        }
        .glass-input:focus {
          outline: none;
          border-color: #8b5cf6; /* Purple focus */
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
        }
        .gradient-text {
          /* Purple Gradient */
          background: linear-gradient(90deg, #8b5cf6, #c084fc); 
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hover\:animate-glow:hover {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.3); /* Purple glow */
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #c4b5fd; /* light purple */
            border-radius: 4px;
        }
      `}</style>

      {/* Header with Title and Step Navigation */}
      <div className="glass-card p-6 mb-8">
        <h1 className="text-4xl font-extrabold gradient-text flex items-center mb-6">
          <Cpu className="w-10 h-10 mr-3 text-indigo-600" />
          AI Workflow Builder
        </h1>

        {/* Step Navigation Pills */}
        <div className="flex flex-wrap justify-between md:justify-start space-x-0 md:space-x-4 space-y-2 md:space-y-0 border-b border-gray-200 pb-2 -mx-2">
          {stepConfig.map((step) => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 p-3 rounded-xl cursor-pointer transition-all duration-300 min-w-[150px]
                ${currentStep === step.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div className={`font-bold ${currentStep === step.id ? 'text-white' : 'text-indigo-600'}`}>
                {step.id}.
              </div>
              <step.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{step.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area (Controlled by Step) */}
      <div className="space-y-6">
        {renderStepContent()}
      </div>

      {/* Step Controls */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevStep}
          className={`glass-button px-6 py-3 border-indigo-300 flex items-center space-x-2 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'bg-white hover:bg-indigo-50/70 text-indigo-700'}`}
          disabled={currentStep === 1}
        >
          &larr; Previous Step
        </button>
        <button
          onClick={handleNextStep}
          className={`px-6 py-3 flex items-center space-x-2 rounded-xl text-white transition-all duration-300 ${currentStep === stepConfig.length ? 'opacity-50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          disabled={currentStep === stepConfig.length}
        >
          Next Step &rarr;
        </button>
      </div>
    </div>
  )
}
