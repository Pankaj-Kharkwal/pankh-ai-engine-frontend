import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Background, Controls, MiniMap } from '@xyflow/react';
import type { Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useBlocks, useBlockCategories } from '../hooks/useApi'; // Assuming these hooks are available
import BlockPalette from '../components/workflow/BlockPalette';
import WorkflowNode from '../components/workflow/WorkflowNode';
import NodeConfigPanel from '../components/workflow/NodeConfigPanel';
import CollaborationPanel from '../components/workflow/CollaborationPanel';
import ExecutionDebugger from '../components/workflow/ExecutionDebugger';
import ExecutionMonitor from '../components/workflow/ExecutionMonitor';

// Import icons (mocked, you'll need to install or replace with your actual icon library)
import { Save, Play, Loader, CheckCircle, Search, Volume2, Globe, MessageSquare } from 'lucide-react'; // Assuming lucide-react or similar

const initialNodes: Node[] = [
    {
        id: '1',
        position: { x: 100, y: 100 },
        data: { label: 'Start Here - Drag blocks from the left panel' },
        type: 'default',
    },
];
const initialEdges: Edge[] = [];

// Define custom node types
const nodeTypes = {
    workflowNode: WorkflowNode,
};

// --- Mock API Mutations (Replace with actual useMutation hooks) ---
const useCreateWorkflowMutation = () => {
    const [isPending, setIsPending] = useState(false);
    const mutateAsync = async (workflowData: any) => {
        setIsPending(true);
        console.log('Simulating API call to create/save workflow:', workflowData);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setIsPending(false);
        return { id: `wkf-${Date.now()}` }; // Return mock workflow object
    };
    return { mutateAsync, isPending };
};

const useRunWorkflowMutation = () => {
    const mutateAsync = async (workflowId: string) => {
        console.log('Simulating API call to run workflow:', workflowId);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        return { id: `exec-${Date.now()}`, status: 'completed', result: { final_output: 'Workflow finished successfully!' } }; // Return mock execution object
    };
    return { mutateAsync };
};
// -----------------------------------------------------------------

export default function WorkflowBuilder() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [paletteVisible, setPaletteVisible] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState(new Set(['utility', 'ai']));
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [workflowEnvVars] = useState<Record<string, any>>({}); // No setter needed for now
    const [collaborationVisible, setCollaborationVisible] = useState(false);
    const [debuggerVisible, setDebuggerVisible] = useState(false);
    const [monitorVisible, setMonitorVisible] = useState(false);
    const [executionData, setExecutionData] = useState<any>(null);

    // --- New State for Header/Execution ---
    const [workflowName, setWorkflowName] = useState("Untitled Workflow");
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<any>(null);
    const [nodeCounter, setNodeCounter] = useState(1); // Used for new node ID generation
    // -------------------------------------

    // --- Mock Mutations/Queries for Header Functions ---
    const createWorkflowMutation = useCreateWorkflowMutation();
    const runWorkflowMutation = useRunWorkflowMutation();
    // ---------------------------------------------------

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const { data: apiBlocks, isLoading: blocksLoading } = useBlocks();
    const { data: categoriesData } = useBlockCategories();

    const categories = useMemo(() => {
        if (!categoriesData) return [];
        return categoriesData;
    }, [categoriesData]);

    const dynamicBlockTypes = useMemo(() => {
        if (!apiBlocks) return [];
        return apiBlocks;
    }, [apiBlocks]);

    const onAddNode = useCallback((block: any) => {
        const newId = `${block.type}-${Date.now()}`;
        const newNode: Node = {
            id: newId,
            position: { x: Math.random() * 400 + 200, y: Math.random() * 400 + 200 },
            data: {
                label: block.manifest?.name || block.type,
                blockType: block.type,
                config: {},
                status: 'idle',
            },
            type: 'workflowNode', // Use custom node type
        };
        setNodes((nds) => [...nds, newNode]);
        setNodeCounter(prev => prev + 1);
    }, [setNodes]);

    // Handle node update from config panel
    const handleNodeUpdate = useCallback((nodeId: string, config: any) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, config, parameters: config } } // Keep 'parameters' for save/run structure
                    : node
            )
        );
    }, [setNodes]);

    // Handle node selection
    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    }, []);

    // Handle custom events from WorkflowNode
    useEffect(() => {
        const handleOpenConfig = (e: any) => {
            setSelectedNodeId(e.detail.nodeId);
        };

        const handleTestNode = (e: any) => {
            const nodeId = e.detail.nodeId;
            setSelectedNodeId(nodeId);
            // You could also trigger a test here
            console.log('Test node:', nodeId);
        };

        const handleDeleteNode = (e: any) => {
            const nodeId = e.detail.nodeId;
            setNodes((nds) => nds.filter((node) => node.id !== nodeId));
            setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
            if (selectedNodeId === nodeId) setSelectedNodeId(null);
        };

        window.addEventListener('openNodeConfig', handleOpenConfig);
        window.addEventListener('testNode', handleTestNode);
        window.addEventListener('deleteNode', handleDeleteNode);

        return () => {
            window.removeEventListener('openNodeConfig', handleOpenConfig);
            window.removeEventListener('testNode', handleTestNode);
            window.removeEventListener('deleteNode', handleDeleteNode);
        };
    }, [setNodes, setEdges, selectedNodeId]);

    const onToggleCategory = useCallback((category: string) => {
        setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    }, []);

    const onTogglePalette = useCallback(() => {
        setPaletteVisible((prev) => !prev);
    }, []);

    // --- New Workflow Actions ---
    // The getWorkflowData is unused but remains for context
    const getWorkflowData = useCallback(() => ({
        name: workflowName,
        graph: {
            nodes: nodes.map((node) => ({
                id: node.id,
                // Fallback for nodes that might not have a blockType yet (like the initial default node '1')
                type: node.data.blockType || 'default_type', 
                parameters: node.data.parameters || node.data.config || {}, 
            })),
            edges: edges.map((edge) => ({
                from_node: edge.source,
                to_node: edge.target,
            })),
        },
    }), [nodes, edges, workflowName]);

    const saveWorkflow = async () => {
        try {
            const workflowData = {
                name: workflowName,
                graph: {
                    nodes: nodes.map((node) => ({
                        id: node.id,
                        type: node.data.blockType,
                        parameters: node.data.parameters,
                    })),
                    edges: edges.map((edge) => ({
                        from_node: edge.source,
                        to_node: edge.target,
                    })),
                },
            };

            await createWorkflowMutation.mutateAsync(workflowData);
            alert("Workflow saved successfully!");
        } catch (error) {
            console.error("Failed to save workflow:", error);
            alert("Failed to save workflow. Please try again.");
        }
    };

    const runWorkflow = async () => {
        if (nodes.length === 0 || (nodes.length === 1 && nodes[0].id === '1')) { // Check for meaningful nodes
            alert("Please add some blocks to your workflow first.");
            return;
        }

        try {
            setIsExecuting(true);
            setExecutionResult(null);

            // First save the workflow
            const workflowData = {
                name: workflowName,
                graph: {
                    nodes: nodes.map((node) => ({
                        id: node.id,
                        type: node.data.blockType,
                        parameters: node.data.parameters,
                    })),
                    edges: edges.map((edge) => ({
                        from_node: edge.source,
                        to_node: edge.target,
                    })),
                },
            };

            const workflow = await createWorkflowMutation.mutateAsync(workflowData);

            // Then run it
            const execution = await runWorkflowMutation.mutateAsync(workflow.id);
            setExecutionResult(execution);
        } catch (error) {
            console.error("Failed to run workflow:", error);
            alert("Failed to run workflow. Please check your configuration.");
        } finally {
            setIsExecuting(false);
        }
    };

    const loadDemoWorkflow = useCallback((
        workflowType: "simple" | "ai_research" | "full_pipeline",
    ) => {
        setNodes([]);
        setEdges([]);
        setSelectedNodeId(null);
        setExecutionResult(null);

        let demoNodes: Node[] = [];
        let demoEdges: Edge[] = [];
        let name = "Demo Workflow";
        let count = 0;

        if (workflowType === "simple") {
            name = "Simple Search Demo";
            const searchNode: Node = {
                id: "search_demo",
                type: "workflowNode",
                position: { x: 100, y: 100 },
                data: {
                    label: "Search Demo (searxng_search)",
                    blockType: "searxng_search",
                    config: {
                        query: "machine learning tutorials 2025",
                        limit: 5,
                        timeout_sec: 15,
                    },
                    parameters: { // Added for save/run structure
                        query: "machine learning tutorials 2025",
                        limit: 5,
                        timeout_sec: 15,
                    },
                    status: 'idle',
                },
            };

            const echoNode: Node = {
                id: "display_results",
                type: "workflowNode",
                position: { x: 400, y: 100 },
                data: {
                    label: "Display Results (echo)",
                    blockType: "echo",
                    config: {
                        message: "Search Results: {{search_demo.output}}", // Assuming output variable name
                    },
                    parameters: {
                        message: "Search Results: {{search_demo.output}}",
                    },
                    status: 'idle',
                },
            };

            const edge: Edge = {
                id: "e-simple-1",
                source: "search_demo",
                target: "display_results",
            };

            demoNodes = [searchNode, echoNode];
            demoEdges = [edge];
            count = 2;

        } else if (workflowType === "ai_research") {
            name = "AI Research & Analysis";
            demoNodes = [
                {
                    id: "search_ai_news",
                    type: "workflowNode",
                    position: { x: 100, y: 100 },
                    data: {
                        label: "Search AI News (searxng_search)",
                        blockType: "searxng_search",
                        config: {
                            query: "artificial intelligence news 2025 latest developments",
                            limit: 6,
                            timeout_sec: 20,
                        },
                        parameters: {
                            query: "artificial intelligence news 2025 latest developments",
                            limit: 6,
                            timeout_sec: 20,
                        },
                        status: 'idle',
                    },
                },
                {
                    id: "scrape_articles",
                    type: "workflowNode",
                    position: { x: 400, y: 100 },
                    data: {
                        label: "Scrape Articles (scrape_urls)",
                        blockType: "scrape_urls",
                        config: {
                            top_n_from_searx: 4,
                            max_chars_per_doc: 4000,
                            timeout_sec: 25,
                        },
                        parameters: {
                            top_n_from_searx: 4,
                            max_chars_per_doc: 4000,
                            timeout_sec: 25,
                        },
                        status: 'idle',
                    },
                },
                {
                    id: "analyze_trends",
                    type: "workflowNode",
                    position: { x: 700, y: 100 },
                    data: {
                        label: "Analyze Trends (azure_chat)",
                        blockType: "azure_chat",
                        config: {
                            system: "You are an AI research analyst.",
                            prompt: "Analyze these AI developments: {context}",
                            temperature: 0.3,
                        },
                        parameters: {
                            system: "You are an AI research analyst.",
                            prompt: "Analyze these AI developments: {context}",
                            temperature: 0.3,
                        },
                        status: 'idle',
                    },
                },
            ];

            demoEdges = [
                { id: "e-ai-1", source: "search_ai_news", target: "scrape_articles" },
                { id: "e-ai-2", source: "scrape_articles", target: "analyze_trends" },
            ];
            count = 3;
        }

        // Add a final 'echo' node to display the analysis for AI research workflow
        if (workflowType === "ai_research") {
            const finalEcho: Node = {
                id: "final_report",
                type: "workflowNode",
                position: { x: 1000, y: 100 },
                data: {
                    label: "Final Report (echo)",
                    blockType: "echo",
                    config: {
                        message: "AI Analysis Complete: {{analyze_trends.output}}",
                    },
                    parameters: {
                        message: "AI Analysis Complete: {{analyze_trends.output}}",
                    },
                    status: 'idle',
                },
            };
            demoNodes.push(finalEcho);
            demoEdges.push({ id: "e-ai-3", source: "analyze_trends", target: "final_report" });
            count += 1;
        }


        setNodes(demoNodes);
        setEdges(demoEdges);
        setWorkflowName(name);
        setNodeCounter(count);
    }, [setNodes, setEdges]);
    // ------------------------------------

    return (
        // The outer div is the main container, set to full viewport height and flexible column layout.
     <div style={{ height: '100vh' }} className="flex flex-col bg-gray-50 overflow-hidden">
            {/* --- IMPROVED WORKFLOW HEADER UI --- 
            - Increased padding for a more spacious feel.
            - Added subtle border to the title input.
            - Aligned action buttons.
            */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-md z-20 flex-shrink-0"> 
                <div className="flex items-center justify-between">
                    {/* Left Section: Title and Name Input */}
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
                            Workflow Builder
                        </h1>
                        <input
                            value={workflowName}
                            onChange={(e) => setWorkflowName(e.target.value)}
                            className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors"
                            placeholder="Workflow name..."
                        />
                    </div>
                    
                    {/* Right Section: Action Buttons */}
                    <div className="flex space-x-3 items-center">
                        
                        {/* --- FIX: Load Demo Dropdown --- 
                        The parent div (relative group) now covers both the button and the dropdown area, 
                        and the dropdown itself has group-hover:block/group-hover:opacity-100.
                        I've simplified the transition to use 'hidden' and 'block' for reliability.
                        */}
                        <div className="relative group h-full"> 
                            <button
                                // Added `h-full` wrapper to the button to ensure it aligns vertically and covers the click area.
                                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-2 flex items-center space-x-2 rounded-lg transition-colors text-sm font-medium text-gray-700 h-full"
                            >
                                <Loader className="w-4 h-4 text-gray-500" />
                                <span>Load Demo</span>
                            </button>
                            {/* Dropdown Menu - Use `hidden` and `group-hover:block` for stable visibility */}
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl hidden group-hover:block z-50 transform origin-top-right transition-all duration-150 ease-out">
                                <button
                                    onClick={() => loadDemoWorkflow("simple")}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-t-lg"
                                >
                                    Simple Search
                                </button>
                                <button
                                    onClick={() => loadDemoWorkflow("ai_research")}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-b-lg"
                                >
                                    AI Research Pipeline
                                </button>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={saveWorkflow}
                            disabled={createWorkflowMutation.isPending || nodes.length === 0}
                            className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-2 flex items-center space-x-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
                        >
                            {createWorkflowMutation.isPending ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 text-gray-500" />
                            )}
                            <span>Save</span>
                        </button>

                        {/* Run Button - Primary Action */}
                        <button
                            onClick={runWorkflow}
                            disabled={isExecuting || nodes.length === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 flex items-center space-x-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md hover:shadow-lg"
                        >
                            {isExecuting ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                            <span>{isExecuting ? "Executing..." : "Run Workflow"}</span>
                        </button>

                        {/* Utility Icons (Toggle Panels) */}
                        <div className="border-l pl-3 ml-3 flex space-x-2">
                             <button
                                onClick={() => setCollaborationVisible(!collaborationVisible)}
                                title="Toggle Collaboration"
                                className={`p-2 rounded-full transition-colors ${collaborationVisible ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <MessageSquare className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setMonitorVisible(!monitorVisible)}
                                title="Toggle Execution Monitor"
                                className={`p-2 rounded-full transition-colors ${monitorVisible ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <Globe className="w-5 h-5" />
                            </button>
                            {/* <button // Add a toggle for the config panel state for completeness
                                onClick={() => setDebuggerVisible(!debuggerVisible)}
                                title="Toggle Debugger"
                                className={`p-2 rounded-full transition-colors ${debuggerVisible ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <Search className="w-5 h-5" />
                            </button> */}
                        </div>

                    </div>
                </div>

                {/* Execution Status moved to a smaller line below the actions */}
                <div className="mt-2 flex items-center justify-between text-xs">
                    <div className="text-gray-500">
                        Nodes: <span className="font-semibold text-gray-700">{nodes.length}</span> | 
                        Edges: <span className="font-semibold text-gray-700">{edges.length}</span>
                        {selectedNodeId && (
                            <span className="ml-4 text-purple-600 font-medium border-l pl-4">
                                Config Panel Open for: **{nodes.find(n => n.id === selectedNodeId)?.data.label || selectedNodeId}**
                            </span>
                        )}
                    </div>
                    {executionResult && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded-md flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-800">
                                Execution **{executionResult.status}**! ID: {executionResult.id.slice(-4)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {/* ---------------------------- */}

            {/* Main Content Area (Layout is already fixed from previous step) */}
            <div className="flex-1 flex overflow-hidden">
                <BlockPalette
                    blocks={dynamicBlockTypes}
                    categories={categories}
                    onAddNode={onAddNode}
                    expandedCategories={expandedCategories}
                    onToggleCategory={onToggleCategory}
                    onLoadDemoWorkflow={loadDemoWorkflow}
                    isVisible={paletteVisible}
                    onToggleVisibility={onTogglePalette}
                    className={paletteVisible ? "flex-shrink-0 w-64 border-r overflow-y-auto" : "hidden"} 
                />

                <div className="flex-1 relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        attributionPosition="bottom-left"
                    >
                        <Background color="#aaa" gap={10} />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                </div>

                {selectedNodeId && (
                    <NodeConfigPanel
                        nodeId={selectedNodeId}
                        node={nodes.find((n) => n.id === selectedNodeId) || null}
                        availableNodes={nodes}
                        workflowEnvVars={workflowEnvVars}
                        onUpdate={handleNodeUpdate}
                        onClose={() => setSelectedNodeId(null)}
                    />
                )}
            </div>
            
            {/* Overlay Panels (Assumed to be fixed/absolute positioned) */}
            <CollaborationPanel
                isVisible={collaborationVisible}
                onToggleVisibility={() => setCollaborationVisible(!collaborationVisible)}
                currentUserId="current-user-id"
                workflowId="workflow-123"
            />

            <ExecutionDebugger
                nodes={nodes}
                edges={edges}
                executionData={executionData}
                isVisible={debuggerVisible}
                onToggleVisibility={() => setDebuggerVisible(!debuggerVisible)}
            />

            <ExecutionMonitor
                nodes={nodes}
                edges={edges}
                executionData={executionData}
                isVisible={monitorVisible}
                onToggleVisibility={() => setMonitorVisible(!monitorVisible)}
            />
        </div>
    );
}