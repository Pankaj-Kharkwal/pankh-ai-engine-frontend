// import React, { useState, useMemo } from 'react'
// import {
//   MessageSquare,
//   Plus,
//   Settings,
//   Play,
//   Code,
//   Zap,
//   Database,
//   Send,
//   Cpu,
//   LayoutGrid,
//   Layers,
//   FileText,
//   ShoppingCart,
//   Headset,
//   Link,
//   Loader,
//   Sparkles,
// } from 'lucide-react'

// // --- Data Definitions ---

// const initialTemplates = [
//   {
//     id: 1,
//     name: 'Customer Support Bot',
//     description: 'Handles inquiries, processes returns, and escalates complex tickets.',
//     blocks: [
//       'Intent Classification',
//       'Response Generation',
//       'API Integration',
//       'Escalation/Handoff',
//     ],
//     icon: '🎧',
//     category: 'Support',
//   },
//   {
//     id: 2,
//     name: 'Sales Assistant Bot',
//     description: 'Qualifies leads, delivers product info, and schedules demos automatically.',
//     blocks: ['Lead Qualification', 'Product Catalog', 'Calendar Integration', 'CRM Sync'],
//     icon: '💼',
//     category: 'Sales',
//   },
//   {
//     id: 3,
//     name: 'FAQ Knowledge Bot',
//     description: 'Answers frequently asked questions using intelligent semantic search.',
//     blocks: ['Knowledge Base', 'Semantic Search', 'Answer Ranking', 'Feedback Loop'],
//     icon: '❓',
//     category: 'Information',
//   },
//   {
//     id: 4,
//     name: 'HR Onboarding Guide',
//     description: 'Guides new hires through paperwork, policies, and internal systems.',
//     blocks: ['File Access Control', 'Policy Search', 'Form Submission', 'Notification'],
//     icon: '🧑‍💼',
//     category: 'Internal HR',
//   },
//   {
//     id: 5,
//     name: 'E-commerce Cart Bot',
//     description: 'Recovers abandoned carts, manages discounts, and tracks orders.',
//     blocks: ['Database Query', 'Webhook Trigger', 'Order Tracking', 'Payment Gateway'],
//     icon: '🛒',
//     category: 'E-commerce',
//   },
//   {
//     id: 6,
//     name: 'IT Helpdesk Resolver',
//     description: 'Diagnoses common technical issues and logs complex tickets to Jira.',
//     blocks: ['Diagnostic Tree', 'Ticket Creation', 'Device Lookup', 'Email Notification'],
//     icon: '🖥️',
//     category: 'IT/Ops',
//   },
//   {
//     id: 7,
//     name: 'Data Reporting Bot',
//     description: 'Queries internal metrics databases and generates real-time charts/reports.',
//     blocks: ['Database Query', 'Data Formatting', 'Security Check', 'Report Generation'],
//     icon: '📊',
//     category: 'Business Intel',
//   },
//   {
//     id: 8,
//     name: 'Internal Knowledge Navigator',
//     description: 'Searches documents and provides summarized answers for internal teams.',
//     blocks: ['Document Parsing', 'Summary Generation', 'Access Log', 'User Feedback'],
//     icon: '📚',
//     category: 'Information',
//   },
//   {
//     id: 9,
//     name: 'Language Translator Bot',
//     description: 'Provides instant, context-aware, multi-lingual message translation.',
//     blocks: ['Language Detection', 'Translation Model', 'Context Memory', 'Output Format'],
//     icon: '🌍',
//     category: 'Utility',
//   },
//   {
//     id: 10,
//     name: 'Game Master Bot',
//     description: 'Runs a text-based adventure, trivia, or role-playing game session.',
//     blocks: ['State Management', 'Randomizer', 'Narrative Generation', 'Score Tracker'],
//     icon: '🎲',
//     category: 'Entertainment',
//   },
// ]

// const availableBlocks = [
//   { name: 'Intent Classification', icon: Zap, color: 'text-purple-600', category: 'AI/LLM' },
//   { name: 'Response Generation', icon: Cpu, color: 'text-green-600', category: 'AI/LLM' },
//   { name: 'Database Query', icon: Database, color: 'text-amber-600', category: 'Data' },
//   { name: 'API Integration', icon: Settings, color: 'text-cyan-600', category: 'Integration' },
//   { name: 'Webhook Trigger', icon: Send, color: 'text-orange-600', category: 'Integration' },
//   { name: 'Knowledge Base', icon: FileText, color: 'text-blue-600', category: 'Data' },
//   { name: 'Escalation/Handoff', icon: Headset, color: 'text-red-600', category: 'Workflow' },
//   { name: 'Conditional Logic', icon: LayoutGrid, color: 'text-pink-600', category: 'Workflow' },
// ]

// // Step configuration for the new tabbed layout
// const stepConfig = [
//   { id: 1, name: 'Setup & Templates', icon: MessageSquare },
//   { id: 2, name: 'Configuration', icon: Settings },
//   { id: 3, name: 'Workflow Canvas', icon: LayoutGrid },
//   { id: 4, name: 'Preview & Deploy', icon: Play },
// ]

// // Component for the block in the workflow view
// const WorkflowBlock = ({ name, icon: Icon, color }) => (
//   <div
//     className={`p-4 rounded-xl shadow-lg border border-opacity-20 border-gray-300 backdrop-blur-md bg-white/80 flex flex-col items-center space-y-2 transition-transform transform hover:scale-[1.03] duration-300 text-gray-800 min-w-[120px]`}
//   >
//     <Icon className={`w-7 h-7 ${color}`} />
//     <div className="text-xs font-semibold text-center">{name}</div>
//   </div>
// )

// export default function BYOChatbot() {
//   const [chatbotTemplates, setChatbotTemplates] = useState(initialTemplates)
//   const [currentStep, setCurrentStep] = useState(1)
//   const [selectedTemplateId, setSelectedTemplateId] = useState(1)
//   const [chatbotName, setChatbotName] = useState('Customer Support Bot')
//   const [testMessage, setTestMessage] = useState('I need help with my order')
//   const [chatHistory, setChatHistory] = useState([
//     { text: 'Hi! How can I help you today?', isBot: true, isStarter: true },
//     { text: 'I need help with my order', isBot: false },
//   ])

//   // AI Generation State
//   const [aiPrompt, setAiPrompt] = useState('')
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [aiGenerationMessage, setAiGenerationMessage] = useState('')

//   // Derive the active blocks for the workflow visualization
//   const activeTemplate = useMemo(
//     () => chatbotTemplates.find(t => t.id === selectedTemplateId),
//     [selectedTemplateId, chatbotTemplates]
//   )

//   // Combine active blocks with their corresponding full block details
//   const workflowBlocks = useMemo(() => {
//     if (!activeTemplate) return []
//     return activeTemplate.blocks.map(blockName => {
//       const blockDetail = availableBlocks.find(b => b.name === blockName)
//       // Ensure color is darker for light theme
//       return blockDetail || { name: blockName, icon: Layers, color: 'text-gray-600' }
//     })
//   }, [activeTemplate])

//   const handleTemplateSelect = template => {
//     setSelectedTemplateId(template.id)
//     setChatbotName(template.name)
//   }

//   const handleNextStep = () => {
//     setCurrentStep(prev => Math.min(prev + 1, stepConfig.length))
//   }

//   const handlePrevStep = () => {
//     setCurrentStep(prev => Math.max(prev - 1, 1))
//   }

//   const handleSendMessage = () => {
//     if (testMessage.trim() === '') return

//     const newUserMessage = { text: testMessage, isBot: false }
//     const botResponse = {
//       text: `Processing: Intent identified as '${activeTemplate.category}' for message: "${testMessage}". Running ${activeTemplate.blocks.length} blocks...`,
//       isBot: true,
//     }

//     setChatHistory([...chatHistory, newUserMessage, botResponse])
//     setTestMessage('')
//   }

//   const handleGenerateWithAI = () => {
//     if (aiPrompt.trim() === '') {
//       setAiGenerationMessage('Please describe the chatbot you want to build.')
//       return
//     }

//     setIsGenerating(true)
//     setAiGenerationMessage('AI is analyzing your request and designing the optimal workflow...')

//     // --- Simulation of Gemini API Call ---
//     setTimeout(() => {
//       // Mock API response structure based on the prompt
//       const newBotId = Date.now() // Unique ID
//       const sanitizedPrompt = aiPrompt.length > 50 ? aiPrompt.substring(0, 47) + '...' : aiPrompt

//       let generatedBlocks = ['Intent Classification', 'Response Generation', 'Knowledge Base']
//       if (aiPrompt.toLowerCase().includes('database') || aiPrompt.toLowerCase().includes('data')) {
//         generatedBlocks.push('Database Query')
//       }
//       if (aiPrompt.toLowerCase().includes('schedule') || aiPrompt.toLowerCase().includes('api')) {
//         generatedBlocks.push('API Integration')
//       }

//       const newTemplate = {
//         id: newBotId,
//         name: `AI Generated: ${sanitizedPrompt}`,
//         description: `This chatbot was generated based on your prompt: "${aiPrompt}". It uses the following blocks: ${generatedBlocks.join(', ')}.`,
//         blocks: generatedBlocks,
//         icon: '✨',
//         category: 'AI Custom',
//       }

//       setChatbotTemplates(prev => [...prev, newTemplate])
//       setSelectedTemplateId(newBotId)
//       setChatbotName(newTemplate.name)

//       setIsGenerating(false)
//       setAiGenerationMessage(`✨ Successfully created bot: "${newTemplate.name}".`)
//       setAiPrompt('')

//       // Auto advance to Configuration
//       setCurrentStep(2)
//     }, 2500) // Simulate network delay
//   }

//   // Content for each step
//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1: // Setup & Templates
//         return (
//           <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//             {/* Template Selection */}
//             <div className="p-6 glass-card lg:col-span-2">
//               <h2 className="mb-4 text-2xl font-semibold text-indigo-700">
//                 1. Select a Base Template ({chatbotTemplates.length})
//               </h2>
//               <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
//                 {chatbotTemplates
//                   .filter(t => t.category !== 'AI Custom')
//                   .map(template => (
//                     <div
//                       key={template.id}
//                       className={`p-4 cursor-pointer text-center transition-all duration-300 border-2 rounded-xl
//                       ${
//                         selectedTemplateId === template.id
//                           ? 'border-indigo-500 bg-indigo-100 shadow-xl shadow-indigo-500/10 transform scale-[1.02] text-indigo-800' // Purple accent on selection
//                           : 'border-gray-200 bg-white/90 hover:bg-indigo-50/70 hover:border-indigo-500/50 text-gray-700'
//                       }`}
//                       onClick={() => handleTemplateSelect(template)}
//                     >
//                       <div className="mb-2 text-4xl">{template.icon}</div>
//                       <h3 className="text-sm font-medium">{template.name}</h3>
//                       <div className="mt-1 text-xs text-gray-500">{template.category}</div>
//                     </div>
//                   ))}
//               </div>
//             </div>

//             {/* AI Generation Card */}
//             <div className="p-6 glass-card lg:col-span-1">
//               <h2 className="flex items-center mb-4 text-2xl font-semibold text-violet-700">
//                 <Sparkles className="mr-2 w-6 h-6 text-violet-500" />
//                 Or, Create with AI
//               </h2>
//               <div className="space-y-4">
//                 <p className="text-sm text-gray-600">
//                   Describe the function of the chatbot you need. E.g., "A bot that queries my Notion
//                   database for internal HR policies."
//                 </p>

//                 <textarea
//                   value={aiPrompt}
//                   onChange={e => setAiPrompt(e.target.value)}
//                   placeholder="Describe your custom chatbot..."
//                   className="w-full h-32 resize-none glass-input"
//                   disabled={isGenerating}
//                 />

//                 <button
//                   onClick={handleGenerateWithAI}
//                   className={`w-full px-4 py-3 flex items-center justify-center space-x-2 rounded-xl text-white transition-all duration-300 ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700 transform hover:scale-[1.01]'}`}
//                   disabled={isGenerating}
//                 >
//                   {isGenerating ? (
//                     <Loader className="w-5 h-5 animate-spin" />
//                   ) : (
//                     <Zap className="w-5 h-5" />
//                   )}
//                   <span>{isGenerating ? 'Designing Workflow...' : 'Generate Chatbot'}</span>
//                 </button>

//                 {aiGenerationMessage && (
//                   <div
//                     className={`p-3 text-sm rounded-lg ${isGenerating ? 'text-blue-700 bg-blue-100' : 'text-green-700 bg-green-100'}`}
//                   >
//                     {aiGenerationMessage}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )

//       case 2: // Configuration
//         return (
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//             <div className="p-6 glass-card md:col-span-2">
//               <h2 className="mb-4 text-2xl font-semibold text-violet-700">2. Configure Identity</h2>
//               <p className="mb-6 text-gray-500">
//                 Review the AI-generated name and description, or manually define your bot.
//               </p>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Chatbot Name
//                   </label>
//                   <input
//                     type="text"
//                     value={chatbotName}
//                     onChange={e => setChatbotName(e.target.value)}
//                     placeholder="Enter chatbot name..."
//                     className="w-full glass-input"
//                   />
//                 </div>
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">
//                     Description
//                   </label>
//                   <textarea
//                     placeholder="Describe what your chatbot does..."
//                     className="w-full h-24 resize-none glass-input"
//                     value={activeTemplate ? activeTemplate.description : ''}
//                     readOnly
//                   />
//                 </div>

//                 <h3 className="mt-6 text-xl font-semibold text-gray-800">
//                   Current Blocks in Workflow:
//                 </h3>
//                 <div className="flex flex-wrap gap-3">
//                   {activeTemplate?.blocks.map(blockName => {
//                     const blockDetail = availableBlocks.find(b => b.name === blockName) || {
//                       icon: Layers,
//                       color: 'text-gray-600',
//                     }
//                     const Icon = blockDetail.icon
//                     return (
//                       <div
//                         key={blockName}
//                         className="flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-full"
//                       >
//                         <Icon className={`w-4 h-4 mr-2 ${blockDetail.color}`} />
//                         {blockName}
//                       </div>
//                     )
//                   })}
//                 </div>
//               </div>
//             </div>

//             {/* Available Blocks Palette (For context/reference) */}
//             <div className="p-6 glass-card md:col-span-1">
//               <h2 className="mb-4 text-2xl font-semibold text-amber-700">Available Blocks</h2>
//               <p className="mb-3 text-xs text-gray-500">
//                 Drag and drop blocks in the next step (Canvas).
//               </p>
//               <div className="space-y-3 max-h-[400px] overflow-y-auto">
//                 {availableBlocks.map(block => (
//                   <div
//                     key={block.name}
//                     className="glass-button p-3 flex items-center transition-all duration-200 hover:scale-[1.02] cursor-move"
//                   >
//                     <block.icon className={`w-5 h-5 mr-3 ${block.color}`} />
//                     <div className="flex-1">
//                       <div className="text-sm font-medium">{block.name}</div>
//                     </div>
//                     <Plus className="ml-auto w-4 h-4 text-green-500" />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )

//       case 3: // Workflow Canvas
//         return (
//           <div className="glass-card p-6 h-auto min-h-[500px]">
//             <h2 className="mb-4 text-2xl font-semibold text-cyan-700">
//               3. Workflow Canvas (Active: {activeTemplate?.name})
//             </h2>
//             <p className="mb-6 text-gray-500">
//               Drag and drop, connect, and configure the detailed flow of your chatbot here.
//             </p>

//             {/* Workflow Visualization */}
//             <div className="flex flex-wrap items-center justify-start gap-4 p-6 bg-gray-200/50 rounded-xl border border-dashed border-gray-400 overflow-x-auto min-h-[350px]">
//               {/* User Input Block (Start) */}
//               <div className="p-4 rounded-xl shadow-lg bg-indigo-600/90 border border-indigo-400 flex flex-col items-center space-y-2 min-w-[150px] text-white">
//                 <Layers className="w-8 h-8" />
//                 <div className="text-sm font-bold text-center">User Input (Start)</div>
//               </div>

//               {workflowBlocks.map((block, index) => (
//                 <React.Fragment key={block.name}>
//                   {/* Arrow Connector */}
//                   <div className="hidden mx-2 text-3xl font-light text-indigo-400 md:block">
//                     <span className="inline-block transform rotate-90 md:rotate-0">&rarr;</span>
//                   </div>
//                   <WorkflowBlock name={block.name} icon={block.icon} color={block.color} />
//                 </React.Fragment>
//               ))}

//               <div className="hidden mx-2 text-3xl font-light text-indigo-400 md:block">
//                 <span className="inline-block transform rotate-90 md:rotate-0">&rarr;</span>
//               </div>
//               {/* Final Response Block (End) */}
//               <div className="p-4 rounded-xl shadow-lg bg-pink-600/90 border border-pink-400 flex flex-col items-center space-y-2 min-w-[150px] text-white">
//                 <Headset className="w-8 h-8" />
//                 <div className="text-sm font-bold text-center">Final Response (End)</div>
//               </div>
//             </div>
//           </div>
//         )

//       case 4: // Preview & Deploy
//         return (
//           <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//             {/* Live Preview */}
//             <div className="p-6 glass-card lg:col-span-2">
//               <h2 className="flex items-center mb-4 text-2xl font-semibold text-green-700">
//                 <MessageSquare className="mr-2 w-5 h-5" />
//                 Live Preview & Test
//               </h2>
//               <div className="flex flex-col p-4 h-96 bg-gray-200 rounded-xl border border-gray-300 shadow-inner">
//                 <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
//                   {chatHistory.map((msg, index) => (
//                     <div
//                       key={index}
//                       className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
//                     >
//                       <div
//                         className={`px-4 py-2 rounded-lg max-w-xs transition-all duration-300
//                         ${
//                           msg.isBot
//                             ? msg.isStarter
//                               ? 'bg-indigo-600 text-white shadow-md'
//                               : 'bg-indigo-100 text-gray-800 border border-indigo-300 shadow-sm' // Light indigo for bot responses
//                             : 'bg-violet-600 text-white shadow-md' // Dark violet for user messages
//                         }`}
//                       >
//                         {msg.text}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="flex pt-4 mt-4 border-t border-gray-300">
//                   <input
//                     type="text"
//                     value={testMessage}
//                     onChange={e => setTestMessage(e.target.value)}
//                     onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
//                     placeholder="Ask the chatbot a question..."
//                     className="flex-1 mr-2 glass-input"
//                   />
//                   <button
//                     onClick={handleSendMessage}
//                     className="px-4 py-2 text-white bg-indigo-600 transition-all duration-300 glass-button hover:bg-indigo-700"
//                   >
//                     <Send className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Export & Deploy */}
//             <div className="space-y-6 lg:col-span-1">
//               <div className="p-6 glass-card">
//                 <h2 className="mb-4 text-2xl font-semibold text-orange-700">
//                   Export & Integration
//                 </h2>
//                 <div className="grid grid-cols-2 gap-4">
//                   <button className="flex flex-col items-center p-4 space-y-1 w-full glass-button hover:animate-glow">
//                     <Code className="w-5 h-5 text-amber-500" />
//                     <span className="text-sm">Export Code</span>
//                   </button>
//                   <button className="flex flex-col items-center p-4 space-y-1 w-full glass-button hover:animate-glow">
//                     <Link className="w-5 h-5 text-cyan-600" />
//                     <span className="text-sm">Web Widget</span>
//                   </button>
//                   <button className="flex flex-col items-center p-4 space-y-1 w-full glass-button hover:animate-glow">
//                     <Send className="w-5 h-5 text-pink-600" />
//                     <span className="text-sm">API Endpoint</span>
//                   </button>
//                   <button className="w-full glass-button p-4 flex flex-col items-center space-y-1 hover:animate-glow bg-indigo-600 hover:bg-indigo-700 text-white !border-indigo-700">
//                     <Play className="w-5 h-5" />
//                     <span className="text-sm">Deploy Live</span>
//                   </button>
//                 </div>
//               </div>
//               <div className="p-6 glass-card">
//                 <h2 className="mb-4 text-2xl font-semibold text-red-700">Advanced Settings</h2>
//                 <button className="flex justify-center items-center p-3 space-x-2 w-full glass-button hover:animate-glow">
//                   <Settings className="w-5 h-5 text-gray-600" />
//                   <span>Manage Models & Credentials</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         )
//       default:
//         return null
//     }
//   }

//   return (
//     <div className="p-6 min-h-screen text-gray-900 bg-gray-100 font-inter">
//       {/* Global Glass Styles and Gradient Background */}
//       <style jsx global>{`
//         .glass-card {
//           background: rgba(255, 255, 255, 0.7); /* Lighter background */
//           border: 1px solid rgba(229, 231, 235, 0.7); /* Light gray border */
//           backdrop-filter: blur(10px);
//           border-radius: 1rem;
//           box-shadow:
//             0 4px 6px rgba(0, 0, 0, 0.05),
//             0 1px 3px rgba(0, 0, 0, 0.03);
//           transition: all 0.3s ease;
//         }
//         .glass-button {
//           background: rgba(255, 255, 255, 0.8); /* Lighter button background */
//           border: 1px solid rgba(229, 231, 235, 0.9);
//           backdrop-filter: blur(5px);
//           border-radius: 0.75rem;
//           transition: all 0.3s ease;
//           color: #1f2937; /* Dark text for light theme */
//         }
//         .glass-button:hover {
//           background: rgba(243, 244, 246, 0.9);
//         }
//         .glass-input {
//           background: rgba(249, 250, 251, 0.9);
//           border: 1px solid rgba(209, 213, 219, 0.7);
//           border-radius: 0.5rem;
//           color: #1f2937; /* Dark text */
//           padding: 0.75rem 1rem;
//           transition: all 0.2s ease;
//         }
//         .glass-input::placeholder {
//           color: #9ca3af;
//         }
//         .glass-input:focus {
//           outline: none;
//           border-color: #8b5cf6; /* Purple focus */
//           box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
//         }
//         .gradient-text {
//           /* Purple Gradient */
//           background: linear-gradient(90deg, #8b5cf6, #c084fc);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//         }
//         .hover\:animate-glow:hover {
//           box-shadow: 0 0 15px rgba(139, 92, 246, 0.3); /* Purple glow */
//         }
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 8px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background-color: #c4b5fd; /* light purple */
//           border-radius: 4px;
//         }
//       `}</style>

//       {/* Header with Title and Step Navigation */}
//       <div className="p-6 mb-8 glass-card">
//         <h1 className="flex items-center mb-6 text-4xl font-extrabold gradient-text">
//           <Cpu className="mr-3 w-10 h-10 text-indigo-600" />
//           AI Workflow Builder
//         </h1>

//         {/* Step Navigation Pills */}
//         <div className="flex flex-wrap justify-between pb-2 -mx-2 space-x-0 space-y-2 border-b border-gray-200 md:justify-start md:space-x-4 md:space-y-0">
//           {stepConfig.map(step => (
//             <div
//               key={step.id}
//               className={`flex items-center space-x-2 p-3 rounded-xl cursor-pointer transition-all duration-300 min-w-[150px]
//                 ${
//                   currentStep === step.id
//                     ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
//                     : 'text-gray-600 hover:bg-gray-100'
//                 }`}
//               onClick={() => setCurrentStep(step.id)}
//             >
//               <div
//                 className={`font-bold ${currentStep === step.id ? 'text-white' : 'text-indigo-600'}`}
//               >
//                 {step.id}.
//               </div>
//               <step.icon className="w-5 h-5" />
//               <span className="text-sm font-medium">{step.name}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Main Content Area (Controlled by Step) */}
//       <div className="space-y-6">{renderStepContent()}</div>

//       {/* Step Controls */}
//       <div className="flex justify-between mt-8">
//         <button
//           onClick={handlePrevStep}
//           className={`glass-button px-6 py-3 border-indigo-300 flex items-center space-x-2 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'bg-white hover:bg-indigo-50/70 text-indigo-700'}`}
//           disabled={currentStep === 1}
//         >
//           &larr; Previous Step
//         </button>
//         <button
//           onClick={handleNextStep}
//           className={`px-6 py-3 flex items-center space-x-2 rounded-xl text-white transition-all duration-300 ${currentStep === stepConfig.length ? 'opacity-50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
//           disabled={currentStep === stepConfig.length}
//         >
//           Next Step &rarr;
//         </button>
//       </div>
//     </div>
//   )
// }




import React, { useState,useEffect, useMemo } from 'react'
import {
  MessageSquare,
  Plus,
  Settings,
  Play,
  Code,
  Zap,
  Database,
  Send,
  Cpu,
  LayoutGrid,
  Layers,
  FileText,
  ShoppingCart,
  Headset,
  Link,
  Loader,
  Sparkles,
} from 'lucide-react'

// --- Data Definitions ---






// I have added API configurations here :
const API_BASE = (import.meta.env.VITE_API_URL || 'https://backend-dev.pankh.ai/api/v1').replace(/\/$/, '')
const API_KEY = import.meta.env.VITE_API_KEY || 'dev-key-change-me'

// Lets have some API Helper functions here :
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  // Build headers - start with a simple object
  const headersObj: Record<string, string> = {}
  
  // Copy existing headers if they're a plain object
  if (options.headers && typeof options.headers === 'object' && !(options.headers instanceof Headers) && !Array.isArray(options.headers)) {
    Object.assign(headersObj, options.headers)
  }
  
  // Only add Content-Type if there's a body and it's not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headersObj['Content-Type'] = 'application/json'
  }
  
  // Since user is logged in, use cookie-based authentication for ALL endpoints
  // The backend accepts cookie-based auth from login sessions for all authenticated endpoints
  // API key is only for M2M scenarios when there's no user session
  if (import.meta.env?.DEV) {
    console.log(`🍪 API Call to ${endpoint}: Using cookie-based authentication (user session)`)
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: headersObj,
    credentials: 'include', // IMPORTANT: Always include cookies for authentication
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    // Better error message extraction
    let errorMsg = response.statusText
    
    // Try multiple error message fields
    if (errorData.detail) {
      if (Array.isArray(errorData.detail) && errorData.detail[0]?.msg) {
        errorMsg = errorData.detail[0].msg
      } else if (typeof errorData.detail === 'string') {
        errorMsg = errorData.detail
      }
    } else if (errorData.message) {
      errorMsg = errorData.message
    } else if (errorData.error) {
      errorMsg = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error)
    } else if (errorData.detail || errorData.msg) {
      errorMsg = errorData.detail || errorData.msg
    }
    
    // Provide more helpful error messages based on status code
    if (response.status === 401) {
      if (!API_KEY || !API_KEY.trim() || API_KEY === 'dev-key-change-me') {
        errorMsg = 'Invalid or missing API key. Please check your VITE_API_KEY environment variable.'
      } else {
        errorMsg = 'Authentication failed. Please verify your API key is correct or ensure you are logged in with valid session cookies.'
      }
    } else if (response.status === 500) {
      // Backend server error - add helpful context
      if (errorMsg.includes('AZURE_OPENAI_ENDPOINT') || errorMsg.includes('environment variable')) {
        errorMsg = `Backend Configuration Error: ${errorMsg}. Please ensure the backend server has the required environment variables configured (AZURE_OPENAI_ENDPOINT, etc.). This needs to be set in the BACKEND's .env file, not the frontend.`
      } else {
        errorMsg = `Backend Server Error (500): ${errorMsg}. Please check the backend server logs for more details.`
      }
    }
    
    throw new Error(errorMsg)
  }

  return response.json()
}










//These are the hardcoded templates for chatbot workflows

const initialTemplates = [
  {
    id: 1,
    name: 'Customer Support Bot',
    description: 'Handles inquiries, processes returns, and escalates complex tickets.',
    blocks: [
      'Intent Classification',
      'Response Generation',
      'API Integration',
      'Escalation/Handoff',
    ],
    icon: '🎧',
    category: 'Support',
  },
  {
    id: 2,
    name: 'Sales Assistant Bot',
    description: 'Qualifies leads, delivers product info, and schedules demos automatically.',
    blocks: ['Lead Qualification', 'Product Catalog', 'Calendar Integration', 'CRM Sync'],
    icon: '💼',
    category: 'Sales',
  },
  {
    id: 3,
    name: 'FAQ Knowledge Bot',
    description: 'Answers frequently asked questions using intelligent semantic search.',
    blocks: ['Knowledge Base', 'Semantic Search', 'Answer Ranking', 'Feedback Loop'],
    icon: '❓',
    category: 'Information',
  },
  {
    id: 4,
    name: 'HR Onboarding Guide',
    description: 'Guides new hires through paperwork, policies, and internal systems.',
    blocks: ['File Access Control', 'Policy Search', 'Form Submission', 'Notification'],
    icon: '🧑‍💼',
    category: 'Internal HR',
  },
  {
    id: 5,
    name: 'E-commerce Cart Bot',
    description: 'Recovers abandoned carts, manages discounts, and tracks orders.',
    blocks: ['Database Query', 'Webhook Trigger', 'Order Tracking', 'Payment Gateway'],
    icon: '🛒',
    category: 'E-commerce',
  },
  {
    id: 6,
    name: 'IT Helpdesk Resolver',
    description: 'Diagnoses common technical issues and logs complex tickets to Jira.',
    blocks: ['Diagnostic Tree', 'Ticket Creation', 'Device Lookup', 'Email Notification'],
    icon: '🖥️',
    category: 'IT/Ops',
  },
  {
    id: 7,
    name: 'Data Reporting Bot',
    description: 'Queries internal metrics databases and generates real-time charts/reports.',
    blocks: ['Database Query', 'Data Formatting', 'Security Check', 'Report Generation'],
    icon: '📊',
    category: 'Business Intel',
  },
  {
    id: 8,
    name: 'Internal Knowledge Navigator',
    description: 'Searches documents and provides summarized answers for internal teams.',
    blocks: ['Document Parsing', 'Summary Generation', 'Access Log', 'User Feedback'],
    icon: '📚',
    category: 'Information',
  },
  {
    id: 9,
    name: 'Language Translator Bot',
    description: 'Provides instant, context-aware, multi-lingual message translation.',
    blocks: ['Language Detection', 'Translation Model', 'Context Memory', 'Output Format'],
    icon: '🌍',
    category: 'Utility',
  },
  {
    id: 10,
    name: 'Game Master Bot',
    description: 'Runs a text-based adventure, trivia, or role-playing game session.',
    blocks: ['State Management', 'Randomizer', 'Narrative Generation', 'Score Tracker'],
    icon: '🎲',
    category: 'Entertainment',
  },
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
]

// Component for the block in the workflow view
const WorkflowBlock = ({ name, icon: Icon, color }) => (
  <div
    className={`p-4 rounded-xl shadow-lg border border-opacity-20 border-gray-300 backdrop-blur-md bg-white/80 flex flex-col items-center space-y-2 transition-transform transform hover:scale-[1.03] duration-300 text-gray-800 min-w-[120px]`}
  >
    <Icon className={`w-7 h-7 ${color}`} />
    <div className="text-xs font-semibold text-center">{name}</div>
  </div>
)

// Main BYOChatbot Component

export default function BYOChatbot() {
  const [chatbotTemplates, setChatbotTemplates] = useState(initialTemplates)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplateId, setSelectedTemplateId] = useState(1)
  const [chatbotName, setChatbotName] = useState('Customer Support Bot')
  const [testMessage, setTestMessage] = useState('I need help with my order')
  const [chatHistory, setChatHistory] = useState([
    { text: 'Hi! How can I help you today?', isBot: true, isStarter: true },
    { text: 'I need help with my order', isBot: false },
  ])

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiGenerationMessage, setAiGenerationMessage] = useState('')








// Here are the step1 for first section
  //Now there will new api integration States , we will use 6 states for api integration
  const [user, setUser] = useState<any>(null)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [activeOrgId, setActiveOrgId] = useState<string>('')
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [error, setError] = useState<string>('')
  const [generatedWorkflowId, setGeneratedWorkflowId] = useState<string>('')







  // Step2 States
    const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')












  // Derive the active blocks for the workflow visualization
  const activeTemplate = useMemo(
    () => chatbotTemplates.find(t => t.id === selectedTemplateId),
    [selectedTemplateId, chatbotTemplates]
  )

  // Combine active blocks with their corresponding full block details
  const workflowBlocks = useMemo(() => {
    if (!activeTemplate) return []
    return activeTemplate.blocks.map(blockName => {
      const blockDetail = availableBlocks.find(b => b.name === blockName)
      // Ensure color is darker for light theme
      return blockDetail || { name: blockName, icon: Layers, color: 'text-gray-600' }
    })
  }, [activeTemplate])














// Now we have to get the user details and their organisations id ,and also the active organisations details 
// These apis are 
//GET /users/me : but this will not give organisation id
// hence we will use another that's GET /users/me/organizations 
// Also , this for creating the workflow from users
//POST /nlp/create-workflow : to create workflow from the user prompt


// Step1:  Load User Details+ Organizations + Workflows (Templates)
  useEffect(() => {
    loadUserData()
  }, [])

  // Load workflows when organization is set
  useEffect(() => {
    if (activeOrgId) {
      loadWorkflowsFromAPI()
    }
  }, [activeOrgId])

  const loadUserData = async () => {
    try {
      setIsLoadingUser(true)
      setError('')

      console.log('🔄 Step 1.1: Loading user profile...')
      
      // API Call 1: Get user profile
      const userData = await apiCall('/users/me')
      console.log('✅ Step 1.1 Complete - User:', userData)
      setUser(userData)

      console.log('🔄 Step 1.2: Loading organizations...')
      
      // API Call 2: Get user's organizations
      const orgsData = await apiCall('/users/me/organizations')
      console.log('✅ Step 1.2 Complete - Organizations:', orgsData)
      setOrganizations(orgsData)

      // Set active organization
      if (orgsData && orgsData.length > 0) {
        const orgId = orgsData[0].id
        setActiveOrgId(orgId)
        console.log('✅ Active Organization set:', orgId)
      } else {
        setError('❌ No organization found. Please create one first.')
      }
    } catch (err: any) {
      console.error('❌ Failed to load user data:', err)
      setError(`Failed to load workspace: ${err.message}`)
    } finally {
      setIsLoadingUser(false)
    }
  }

  // Load workflows from backend API to use as templates
  const loadWorkflowsFromAPI = async () => {
    if (!activeOrgId) {
      console.warn('⚠️ Cannot load workflows: No organization ID available')
      return
    }
    
    try {
      console.log('🔄 Step 1.3: Loading workflows from backend...')
      console.log('📝 Organization ID:', activeOrgId)
      
      // API Call: Get all workflows for the organization
      // Note: Using cookie-based auth (from login session)
      const workflowsData = await apiCall(`/organizations/${activeOrgId}/workflows/`)
      console.log('✅ Step 1.3 Complete - Workflows loaded:', workflowsData)
      
      // Transform backend workflows to template format
      let transformedTemplates: any[] = []
      
      // Handle both array response and object with workflows property
      const workflows = Array.isArray(workflowsData) 
        ? workflowsData 
        : (workflowsData.workflows || workflowsData.data || [])
      
      if (workflows && workflows.length > 0) {
        transformedTemplates = workflows.map((wf: any) => {
          // Extract blocks from graph.nodes (standard structure) or blocks array
          let blockNames: string[] = []
          
          // Try 1: Check graph.nodes (most common structure)
          if (wf.graph?.nodes && Array.isArray(wf.graph.nodes)) {
            blockNames = wf.graph.nodes
              .map((node: any) => node.type || node.block_type || node.name || 'Block')
              .filter((name: string) => name && name !== 'Block' && name !== 'start' && name !== 'complete')
          } 
          // Try 2: Check blocks array directly
          else if (wf.blocks && Array.isArray(wf.blocks)) {
            blockNames = wf.blocks
              .map((b: any) => b.name || b.type || b.block_type || 'Block')
              .filter((name: string) => name && name !== 'Block')
          }
          
          return {
            id: wf.id || wf._id,
            name: wf.name || 'Unnamed Workflow',
            description: wf.description || wf.name || 'No description',
            blocks: blockNames.length > 0 ? blockNames : ['Intent Classification', 'Response Generation'],
            icon: '🤖',
            category: 'Saved',
            workflow_id: wf.id || wf._id, // Store real workflow ID
          }
        })
        
        console.log(`✅ Transformed ${transformedTemplates.length} workflows to templates`)
      }
      
      // Combine with hardcoded templates (for demo/fallback)
      // Backend workflows come first, then hardcoded ones
      const allTemplates = [...transformedTemplates, ...initialTemplates]
      setChatbotTemplates(allTemplates)
      
      console.log(`✅ Total templates available: ${allTemplates.length} (${transformedTemplates.length} from backend + ${initialTemplates.length} hardcoded)`)
      
    } catch (err: any) {
      console.warn('⚠️ Failed to load workflows from backend, using hardcoded templates only:', err)
      console.warn('⚠️ Error details:', {
        message: err.message,
        organizationId: activeOrgId,
        note: 'This is okay - workflows will still work, just won\'t show in templates list'
      })
      // Fallback to hardcoded templates if API fails
      // This is fine - workflows can still be created and saved
      setChatbotTemplates(initialTemplates)
    }
  }

  // ==================== FLOW STEP 2: Generate Chatbot with AI ====================
  const handleGenerateWithAI = async () => {
    // Validation
    if (aiPrompt.trim() === '') {
      setAiGenerationMessage('⚠️ Please describe the chatbot you want to build.')
      return
    }

    if (!activeOrgId) {
      setAiGenerationMessage('❌ No organization selected. Please reload the page.')
      return
    }

    setIsGenerating(true)
    setAiGenerationMessage('🤖 AI is analyzing your request and designing the optimal workflow...')

    try {
      console.log('🔄 Step 2.1: Calling NLP API...')
      console.log('📝 Prompt:', aiPrompt)
      console.log('🏢 Organization ID:', activeOrgId)

      // API Call 3: Create workflow from natural language
      const response = await apiCall('/nlp/create-workflow', {
        method: 'POST',
        body: JSON.stringify({
          text: aiPrompt,
          context: {
            organization_id: activeOrgId,
          },
        }),
      })

      console.log('✅ Step 2.1 Complete - Workflow created:', response)

      // Extract workflow details
      const workflowData = response.workflow || {}
      const spec = response.specification || {}
      
      // Log full response for debugging
      console.log('📋 Full API Response:', JSON.stringify(response, null, 2))

      // Extract block names from various possible locations in the response
      let blockNames: string[] = []
      
      // Try 1: Check workflow.graph.nodes (standard structure)
      if (workflowData.graph?.nodes && Array.isArray(workflowData.graph.nodes)) {
        blockNames = workflowData.graph.nodes
          .map((node: any) => node.type || node.block_type || node.name || 'Block')
          .filter((name: string) => name && name !== 'Block' && name !== 'start' && name !== 'complete')
        console.log('✅ Extracted blocks from workflow.graph.nodes:', blockNames)
      }
      // Try 2: Check workflow.blocks array
      else if (workflowData.blocks && Array.isArray(workflowData.blocks)) {
        blockNames = workflowData.blocks.map((b: any) => b.name || b.type || b.block_type || 'Block')
        console.log('✅ Extracted blocks from workflow.blocks:', blockNames)
      }
      // Try 3: Check specification.required_blocks
      else if (spec.required_blocks && Array.isArray(spec.required_blocks)) {
        blockNames = spec.required_blocks
        console.log('✅ Extracted blocks from spec.required_blocks:', blockNames)
      }
      // Try 4: Check response.blocks directly
      else if (response.blocks && Array.isArray(response.blocks)) {
        blockNames = response.blocks.map((b: any) => b.name || b.type || b.block_type || 'Block')
        console.log('✅ Extracted blocks from response.blocks:', blockNames)
      }
      
      // Fallback: Use default blocks if nothing found
      if (blockNames.length === 0) {
        console.warn('⚠️ No blocks found in response, using default blocks')
        blockNames = ['Intent Classification', 'Response Generation']
      }
      
      console.log(`✅ Final block names extracted: ${blockNames.length} blocks -`, blockNames)

      // Store workflow ID for later use
      // The backend should return a valid MongoDB ObjectId (24 hex characters)
      // If not present, we'll need to create the workflow first
      const workflowId = workflowData.id || workflowData._id || response.workflow_id || ''
      
      if (!workflowId) {
        console.warn('⚠️ No workflow ID returned from API. Workflow will be created on save.')
        // Clear the workflow ID - will create it when saving
        setGeneratedWorkflowId('')
      } else {
        // Validate that it's a proper ObjectId format (24 hex characters)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(workflowId)
        if (!isValidObjectId) {
          console.warn(`⚠️ Invalid workflow ID format: ${workflowId}. Will create workflow on save.`)
          setGeneratedWorkflowId('')
        } else {
          setGeneratedWorkflowId(workflowId)
          console.log('💾 Workflow ID stored:', workflowId)
        }
      }

      // Create template from response
      const newTemplate = {
        id: workflowId,
        name: spec.title || workflowData.name || `AI: ${aiPrompt.substring(0, 30)}...`,
        description: spec.description || aiPrompt,
        blocks: blockNames,
        icon: '✨',
        category: 'AI Custom',
      }

      console.log('✅ New template created:', newTemplate)

      // Update UI
      setChatbotTemplates(prev => [...prev, newTemplate])
      setSelectedTemplateId(newTemplate.id)
      setChatbotName(newTemplate.name)

      setIsGenerating(false)
      setAiGenerationMessage(
        `✅ Successfully created "${newTemplate.name}" with ${blockNames.length} blocks!`
      )
      setAiPrompt('')

      // Auto advance to Configuration after 1.5 seconds
      console.log('⏭️ Auto-advancing to Configuration in 1.5s...')
      setTimeout(() => {
        setCurrentStep(2)
      }, 1500)
    } catch (err: any) {
      console.error('❌ AI generation failed:', err)
      setIsGenerating(false)
      setAiGenerationMessage(`❌ Error: ${err.message || 'Failed to generate workflow'}`)
    }
  }


  //Now step 2 : that's save configuration in which we used PUT /organizations/{org_id}/workflows/{workflow_id} to save the workflow configuration
  const handleSaveConfiguration = async () => {
    if (!activeOrgId) {
      setSaveMessage('❌ No organization selected.')
      return
    }

    if (!chatbotName.trim()) {
      setSaveMessage('❌ Please enter a chatbot name.')
      return
    }

    setIsSaving(true)
    setSaveMessage('💾 Saving configuration...')

    try {
      let workflowId = generatedWorkflowId
      
      // Check if workflow ID is valid (24 hex characters for MongoDB ObjectId)
      const isValidObjectId = workflowId && workflowId.trim() !== '' && /^[0-9a-fA-F]{24}$/.test(workflowId)
      
      if (!isValidObjectId) {
        // Check if template has a workflow_id that we should use
        const templateWorkflowId = activeTemplate?.workflow_id
        if (templateWorkflowId && /^[0-9a-fA-F]{24}$/.test(templateWorkflowId)) {
          // Template has a valid workflow ID - use it instead of creating new
          console.log('📝 Using workflow ID from template:', templateWorkflowId)
          workflowId = templateWorkflowId
          setGeneratedWorkflowId(workflowId)
          // Continue to update step below
        } else {
          // Workflow doesn't exist yet - create it first
          console.log('🔄 Step 2.0: Creating new workflow...')
          console.log('📝 Name:', chatbotName)
          console.log('📝 Description:', activeTemplate?.description)
          
          // Get blocks from active template
          const blocks = activeTemplate?.blocks || []
          const graph = {
            nodes: blocks.map((blockName: string, index: number) => ({
              id: `node_${index}`,
              type: blockName,
              parameters: {},
            })),
            edges: [],
          }
          
          // API Call: Create workflow with all necessary data
          const description = activeTemplate?.description || ''
          const createResponse = await apiCall(
            `/organizations/${activeOrgId}/workflows`,
            {
              method: 'POST',
              body: JSON.stringify({
                name: chatbotName,
                description: description,
                graph: graph,
              }),
            }
          )
          
          workflowId = createResponse.id || createResponse._id
          if (!workflowId) {
            throw new Error('Failed to create workflow: No ID returned')
          }
          
          // Validate the returned ID
          if (!/^[0-9a-fA-F]{24}$/.test(workflowId)) {
            throw new Error(`Invalid workflow ID returned: ${workflowId}`)
          }
          
          setGeneratedWorkflowId(workflowId)
          console.log('✅ Workflow created with ID:', workflowId)
          
          // Update the template to include the new workflow_id
          setChatbotTemplates(prev => 
            prev.map(t => t.id === selectedTemplateId 
              ? { ...t, workflow_id: workflowId } 
              : t
            )
          )
          
          // Success - workflow created with all data (name, description, graph)
          // No need to update it since we included everything in the create request
          setIsSaving(false)
          setSaveMessage('✅ Configuration saved successfully!')
          
          // Auto clear message after 3 seconds
          setTimeout(() => {
            setSaveMessage('')
          }, 3000)
          return // Exit early - workflow already created with all data, no update needed
        }
      }

      // If we have a valid workflow ID, update it
      console.log('🔄 Step 2.1: Updating workflow configuration...')
      console.log('📝 Workflow ID:', workflowId)
      console.log('📝 Name:', chatbotName)
      console.log('📝 Description:', activeTemplate?.description)

      // API Call: Update existing workflow with additional details
      const response = await apiCall(
        `/organizations/${activeOrgId}/workflows/${workflowId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            name: chatbotName,
            description: activeTemplate?.description || '',
          }),
        }
      )

      console.log('✅ Step 2.1 Complete - Configuration saved:', response)

      setIsSaving(false)
      setSaveMessage('✅ Configuration saved successfully!')

      // Auto clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    } catch (err: any) {
      console.error('❌ Failed to save configuration:', err)
      setIsSaving(false)
      setSaveMessage(`❌ Error: ${err.message || 'Failed to save configuration'}`)
    }
  }







  const handleTemplateSelect = (template: any) => {
    setSelectedTemplateId(template.id)
    setChatbotName(template.name)
    
    // If template has a workflow_id (from backend), use it
    // Otherwise, clear generatedWorkflowId so a new workflow will be created on save
    if (template.workflow_id && /^[0-9a-fA-F]{24}$/.test(template.workflow_id)) {
      setGeneratedWorkflowId(template.workflow_id)
      console.log('✅ Using existing workflow ID from template:', template.workflow_id)
    } else {
      // Template doesn't have a workflow ID (hardcoded template) - will create new workflow on save
      setGeneratedWorkflowId('')
      console.log('📝 Template has no workflow ID - will create new workflow on save')
    }
  }

  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, stepConfig.length))
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSendMessage = () => {
    if (testMessage.trim() === '') return

    const newUserMessage = { text: testMessage, isBot: false }
    const botResponse = {
      text: `Processing: Intent identified as '${activeTemplate.category}' for message: "${testMessage}". Running ${activeTemplate.blocks.length} blocks...`,
      isBot: true,
    }

    setChatHistory([...chatHistory, newUserMessage, botResponse])
    setTestMessage('')
  }











//I commented this because this was generating fake responses,  no apis were there
  // const handleGenerateWithAI = () => {
  //   if (aiPrompt.trim() === '') {
  //     setAiGenerationMessage('Please describe the chatbot you want to build.')
  //     return
  //   }

  //   setIsGenerating(true)
  //   setAiGenerationMessage('AI is analyzing your request and designing the optimal workflow...')

  //   // --- Simulation of Gemini API Call ---
  //   setTimeout(() => {
  //     // Mock API response structure based on the prompt
  //     const newBotId = Date.now() // Unique ID
  //     const sanitizedPrompt = aiPrompt.length > 50 ? aiPrompt.substring(0, 47) + '...' : aiPrompt

  //     let generatedBlocks = ['Intent Classification', 'Response Generation', 'Knowledge Base']
  //     if (aiPrompt.toLowerCase().includes('database') || aiPrompt.toLowerCase().includes('data')) {
  //       generatedBlocks.push('Database Query')
  //     }
  //     if (aiPrompt.toLowerCase().includes('schedule') || aiPrompt.toLowerCase().includes('api')) {
  //       generatedBlocks.push('API Integration')
  //     }

  //     const newTemplate = {
  //       id: newBotId,
  //       name: `AI Generated: ${sanitizedPrompt}`,
  //       description: `This chatbot was generated based on your prompt: "${aiPrompt}". It uses the following blocks: ${generatedBlocks.join(', ')}.`,
  //       blocks: generatedBlocks,
  //       icon: '✨',
  //       category: 'AI Custom',
  //     }

  //     setChatbotTemplates(prev => [...prev, newTemplate])
  //     setSelectedTemplateId(newBotId)
  //     setChatbotName(newTemplate.name)

  //     setIsGenerating(false)
  //     setAiGenerationMessage(`✨ Successfully created bot: "${newTemplate.name}".`)
  //     setAiPrompt('')

  //     // Auto advance to Configuration
  //     setCurrentStep(2)
  //   }, 2500) // Simulate network delay
  // }









  // Content for each step
  //Below function has several steps , in which i changed case 1

  const renderStepContent = () => {
    // Loading state
    if (currentStep === 1 && isLoadingUser) {
      return (
        <div className="p-12 text-center glass-card">
          <Loader className="mx-auto mb-4 w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      )
    }

    // Error state
    if (error && currentStep === 1) {
      return (
        <div className="p-6 bg-red-50 border-red-200 glass-card">
          <h3 className="flex items-center mb-2 font-semibold text-red-700">
            <span className="mr-2 text-2xl">⚠️</span>
            Error Loading Workspace
          </h3>
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={loadUserData}
            className="px-4 py-2 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
          >
            🔄 Retry
          </button>
        </div>
      )
    }

    switch (currentStep) {
      case 1: // Setup & Templates
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Organization info banner */}
            {user && activeOrgId && organizations.length > 0 && (
              <div className="p-4 mb-2 bg-indigo-50 rounded-lg border border-indigo-200 lg:col-span-3">
                <p className="text-sm text-indigo-700">
                  <strong>✓ Active Organization:</strong>{' '}
                  {organizations.find(o => o.id === activeOrgId)?.name || activeOrgId}
                </p>
                <p className="mt-1 text-xs text-indigo-500">
                  User: {user.email} • Loaded {organizations.length} organization(s)
                </p>
              </div>
            )}

            {/* Template Selection - KEEP EXISTING JSX */}
            <div className="p-6 glass-card lg:col-span-2">
              <h2 className="mb-4 text-2xl font-semibold text-indigo-700">
                1. Select a Base Template ({chatbotTemplates.length})
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {chatbotTemplates
                  .filter(t => t.category !== 'AI Custom')
                  .map(template => (
                    <div
                      key={template.id}
                      className={`p-4 cursor-pointer text-center transition-all duration-300 border-2 rounded-xl ${
                        selectedTemplateId === template.id
                          ? 'border-indigo-500 bg-indigo-100 shadow-xl shadow-indigo-500/10 transform scale-[1.02] text-indigo-800'
                          : 'border-gray-200 bg-white/90 hover:bg-indigo-50/70 hover:border-indigo-500/50 text-gray-700'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="mb-2 text-4xl">{template.icon}</div>
                      <h3 className="text-sm font-medium">{template.name}</h3>
                      <div className="mt-1 text-xs text-gray-500">{template.category}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* AI Generation Card */}
            <div className="p-6 glass-card lg:col-span-1">
              <h2 className="flex items-center mb-4 text-2xl font-semibold text-violet-700">
                <Sparkles className="mr-2 w-6 h-6 text-violet-500" />
                Or, Create with AI
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Describe the function of the chatbot you need. E.g., "A bot that queries my
                  Notion database for internal HR policies."
                </p>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Describe your custom chatbot..."
                  className="w-full h-32 resize-none glass-input"
                  disabled={isGenerating || !activeOrgId}
                />
                <button
                  onClick={handleGenerateWithAI}
                  className={`w-full px-4 py-3 flex items-center justify-center space-x-2 rounded-xl text-white transition-all duration-300 ${
                    isGenerating || !activeOrgId
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-violet-600 hover:bg-violet-700 transform hover:scale-[1.01]'
                  }`}
                  disabled={isGenerating || !activeOrgId}
                >
                  {isGenerating ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                  <span>{isGenerating ? 'Designing Workflow...' : 'Generate Chatbot'}</span>
                </button>
                {aiGenerationMessage && (
                  <div
                    className={`p-3 text-sm rounded-lg ${
                      isGenerating
                        ? 'bg-blue-100 text-blue-700'
                        : aiGenerationMessage.includes('❌')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {aiGenerationMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )



      // ✅ KEEP ALL OTHER CASES AS IS (cases 2, 3, 4)


      case 2: // Configuration
        return (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-6 glass-card md:col-span-2">
              <h2 className="mb-4 text-2xl font-semibold text-violet-700">2. Configure Identity</h2>
              <p className="mb-6 text-gray-500">
                Review the AI-generated name and description, or manually define your bot.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Chatbot Name
                  </label>
                  <input
                    type="text"
                    value={chatbotName}
                    onChange={e => setChatbotName(e.target.value)}
                    placeholder="Enter chatbot name..."
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe what your chatbot does..."
                    className="w-full h-24 resize-none glass-input"
                    value={activeTemplate ? activeTemplate.description : ''}
// I have done changes here to update the description in template
                                        onChange={e => {
                      // Update description in template
                      const updatedTemplates = chatbotTemplates.map(t =>
                        t.id === selectedTemplateId ? { ...t, description: e.target.value } : t
                      )
                      setChatbotTemplates(updatedTemplates)
                    }}
                  />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-gray-800">
                  Current Blocks in Workflow:
                </h3>
                <div className="flex flex-wrap gap-3">
                  {activeTemplate?.blocks.map(blockName => {
                    const blockDetail = availableBlocks.find(b => b.name === blockName) || {
                      icon: Layers,
                      color: 'text-gray-600',
                    }
                    const Icon = blockDetail.icon
                    return (
                      <div
                        key={blockName}
                        className="flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-full"
                      >
                        <Icon className={`w-4 h-4 mr-2 ${blockDetail.color}`} />
                        {blockName}
                      </div>
                    )
                  })}
                </div>




                                {/* Save Configuration Button */}
                <div className="pt-4 mt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveConfiguration}
                    disabled={isSaving || !chatbotName.trim()}
                    className={`w-full px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                      isSaving || !chatbotName.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 transform hover:scale-[1.01]'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Settings className="w-5 h-5" />
                        <span>Save Configuration</span>
                      </>
                    )}
                  </button>
                  {saveMessage && (
                    <div
                      className={`mt-3 p-3 text-sm rounded-lg ${
                        saveMessage.includes('✅')
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {saveMessage}
                    </div>
                  )}
                  {!generatedWorkflowId && chatbotName.trim() && (
                    <p className="mt-3 text-xs text-center text-blue-600">
                      💡 Workflow will be created automatically when you save.
                    </p>
                  )}
                </div>
              </div>
            </div>
  






            {/* Available Blocks Palette (For context/reference) */}
            <div className="p-6 glass-card md:col-span-1">
              <h2 className="mb-4 text-2xl font-semibold text-amber-700">Available Blocks</h2>
              <p className="mb-3 text-xs text-gray-500">
                Drag and drop blocks in the next step (Canvas).
              </p>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {availableBlocks.map(block => (
                  <div
                    key={block.name}
                    className="glass-button p-3 flex items-center transition-all duration-200 hover:scale-[1.02] cursor-move"
                  >
                    <block.icon className={`w-5 h-5 mr-3 ${block.color}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{block.name}</div>
                    </div>
                    <Plus className="ml-auto w-4 h-4 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 3: // Workflow Canvas
        return (
          <div className="glass-card p-6 h-auto min-h-[500px]">
            <h2 className="mb-4 text-2xl font-semibold text-cyan-700">
              3. Workflow Canvas (Active: {activeTemplate?.name})
            </h2>
            <p className="mb-6 text-gray-500">
              Drag and drop, connect, and configure the detailed flow of your chatbot here.
            </p>

            {/* Workflow Visualization */}
            <div className="flex flex-wrap items-center justify-start gap-4 p-6 bg-gray-200/50 rounded-xl border border-dashed border-gray-400 overflow-x-auto min-h-[350px]">
              {/* User Input Block (Start) */}
              <div className="p-4 rounded-xl shadow-lg bg-indigo-600/90 border border-indigo-400 flex flex-col items-center space-y-2 min-w-[150px] text-white">
                <Layers className="w-8 h-8" />
                <div className="text-sm font-bold text-center">User Input (Start)</div>
              </div>

              {workflowBlocks.map((block, index) => (
                <React.Fragment key={block.name}>
                  {/* Arrow Connector */}
                  <div className="hidden mx-2 text-3xl font-light text-indigo-400 md:block">
                    <span className="inline-block transform rotate-90 md:rotate-0">&rarr;</span>
                  </div>
                  <WorkflowBlock name={block.name} icon={block.icon} color={block.color} />
                </React.Fragment>
              ))}

              <div className="hidden mx-2 text-3xl font-light text-indigo-400 md:block">
                <span className="inline-block transform rotate-90 md:rotate-0">&rarr;</span>
              </div>
              {/* Final Response Block (End) */}
              <div className="p-4 rounded-xl shadow-lg bg-pink-600/90 border border-pink-400 flex flex-col items-center space-y-2 min-w-[150px] text-white">
                <Headset className="w-8 h-8" />
                <div className="text-sm font-bold text-center">Final Response (End)</div>
              </div>
            </div>
          </div>
        )

      case 4: // Preview & Deploy
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Live Preview */}
            <div className="p-6 glass-card lg:col-span-2">
              <h2 className="flex items-center mb-4 text-2xl font-semibold text-green-700">
                <MessageSquare className="mr-2 w-5 h-5" />
                Live Preview & Test
              </h2>
              <div className="flex flex-col p-4 h-96 bg-gray-200 rounded-xl border border-gray-300 shadow-inner">
                <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg max-w-xs transition-all duration-300
                        ${
                          msg.isBot
                            ? msg.isStarter
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-indigo-100 text-gray-800 border border-indigo-300 shadow-sm' // Light indigo for bot responses
                            : 'bg-violet-600 text-white shadow-md' // Dark violet for user messages
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex pt-4 mt-4 border-t border-gray-300">
                  <input
                    type="text"
                    value={testMessage}
                    onChange={e => setTestMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask the chatbot a question..."
                    className="flex-1 mr-2 glass-input"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 text-white bg-indigo-600 transition-all duration-300 glass-button hover:bg-indigo-700"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Export & Deploy */}
            <div className="space-y-6 lg:col-span-1">
              <div className="p-6 glass-card">
                <h2 className="mb-4 text-2xl font-semibold text-orange-700">
                  Export & Integration
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center p-4 space-y-1 w-full glass-button hover:animate-glow">
                    <Code className="w-5 h-5 text-amber-500" />
                    <span className="text-sm">Export Code</span>
                  </button>
                  <button className="flex flex-col items-center p-4 space-y-1 w-full glass-button hover:animate-glow">
                    <Link className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm">Web Widget</span>
                  </button>
                  <button className="flex flex-col items-center p-4 space-y-1 w-full glass-button hover:animate-glow">
                    <Send className="w-5 h-5 text-pink-600" />
                    <span className="text-sm">API Endpoint</span>
                  </button>
                  <button className="w-full glass-button p-4 flex flex-col items-center space-y-1 hover:animate-glow bg-indigo-600 hover:bg-indigo-700 text-white !border-indigo-700">
                    <Play className="w-5 h-5" />
                    <span className="text-sm">Deploy Live</span>
                  </button>
                </div>
              </div>
              <div className="p-6 glass-card">
                <h2 className="mb-4 text-2xl font-semibold text-red-700">Advanced Settings</h2>
                <button className="flex justify-center items-center p-3 space-x-2 w-full glass-button hover:animate-glow">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span>Manage Models & Credentials</span>
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6 min-h-screen text-gray-900 bg-gray-100 font-inter">
      {/* Global Glass Styles and Gradient Background */}
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7); /* Lighter background */
          border: 1px solid rgba(229, 231, 235, 0.7); /* Light gray border */
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          box-shadow:
            0 4px 6px rgba(0, 0, 0, 0.05),
            0 1px 3px rgba(0, 0, 0, 0.03);
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
      <div className="p-6 mb-8 glass-card">
        <h1 className="flex items-center mb-6 text-4xl font-extrabold gradient-text">
          <Cpu className="mr-3 w-10 h-10 text-indigo-600" />
          AI Workflow Builder
        </h1>

        {/* Step Navigation Pills */}
        <div className="flex flex-wrap justify-between pb-2 -mx-2 space-x-0 space-y-2 border-b border-gray-200 md:justify-start md:space-x-4 md:space-y-0">
          {stepConfig.map(step => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 p-3 rounded-xl cursor-pointer transition-all duration-300 min-w-[150px]
                ${
                  currentStep === step.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div
                className={`font-bold ${currentStep === step.id ? 'text-white' : 'text-indigo-600'}`}
              >
                {step.id}.
              </div>
              <step.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{step.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area (Controlled by Step) */}
      <div className="space-y-6">{renderStepContent()}</div>

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
