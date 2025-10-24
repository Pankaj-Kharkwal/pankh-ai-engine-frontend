import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Play,
  Info,
  FileJson,
  TestTube,
  Save,
  Loader2,
  ChevronRight,
  Zap,
} from 'lucide-react';
// Assuming the following components/services exist:
// import { apiClient } from '../../services/api';
// import BlockParameterForm from '../blocks/BlockParameterForm';
// import BlockIOSchema from '../blocks/BlockIOSchema';
// import { BlockTestForm } from '../blocks/BlockTestForm';

// Dummy imports for compilation sake (replace with your actual imports)
const apiClient: any = { getBlockSchema: async (type: string) => ({ manifest: { config_schema: { properties: {} } } }) };
const BlockParameterForm = (props: any) => <div>Parameter Form (Using Schema)</div>;
const BlockIOSchema = (props: any) => <div>I/O Schema View</div>;
const BlockTestForm = (props: any) => <div>Test Form</div>;

interface NodeConfigPanelProps {
  nodeId: string | null;
  node: any;
  availableNodes?: any[];
  workflowEnvVars?: Record<string, any>;
  onUpdate: (nodeId: string, config: any) => void;
  onClose: () => void;
}

export default function NodeConfigPanel({
  nodeId,
  node,
  availableNodes = [],
  workflowEnvVars = {},
  onUpdate,
  onClose,
}: NodeConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<'configure' | 'io' | 'test'>('configure');
  const [config, setConfig] = useState<any>(node?.data?.config || {});
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // New state for success feedback
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (node?.data?.blockType) {
      loadBlockSchema();
      // Reset config when node changes to ensure fresh state
      setConfig(node.data.config || {});
    }
  }, [node?.data?.blockType]);

  const loadBlockSchema = async () => {
    if (!node?.data?.blockType) return;

    setLoading(true);
    try {
      const blockSchema = await apiClient.getBlockSchema(node.data.blockType);
      setSchema(blockSchema);
    } catch (error) {
      console.error('Failed to load block schema:', error);
      // Optional: Display error in the panel
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nodeId) return;

    setSaving(true);
    try {
      onUpdate(nodeId, config);
      setShowSuccess(true); // Show success indicator
      setTimeout(() => {
        setSaving(false);
        setShowSuccess(false); // Hide after a short duration
      }, 1000);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setSaving(false);
      setShowSuccess(false);
    }
  };

  const handleTestComplete = (result: any) => {
    if (nodeId) {
      onUpdate(nodeId, {
        ...node.data, // Preserve other data fields
        config: config, // Use the current form config
        lastTestResult: result,
        lastTestTimestamp: new Date().toISOString(),
      });
    }
  };

  // Filter available nodes to exclude current node and any unconnected nodes (optional: improve upstream logic)
  const upstreamNodes = availableNodes.filter((n: any) => n.id !== nodeId);

  if (!node) {
    return null;
  }

  // Improved Tab Classes for a cleaner look
  const getTabClasses = (tabName: 'configure' | 'io' | 'test') => {
    const isActive = activeTab === tabName;
    return `flex items-center space-x-2 px-5 py-3 border-b-2 font-medium transition-all duration-200 cursor-pointer 
            ${isActive
        ? 'border-blue-500 text-blue-700 bg-white/70'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`;
  };

  return (
    // Backdrop for blur and centering
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Semi-transparent blur background (backdrop-blur-sm is key) */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Main Panel - Centered and constrained */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl z-10 flex flex-col transform transition-all duration-300 scale-100 opacity-100"
        style={{ width: '900px' }} // Custom width for a wider panel
      >
        {/* Header (Clean, flat) */}
        <div className="flex-shrink-0 border-b border-gray-100 bg-white rounded-t-xl">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">{node.data?.label || 'Configure Node'}</h2>
                <p className="text-sm text-gray-500 font-mono">{node.data?.blockType}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs - Now using bottom border for active state */}
          <div className="flex border-b border-gray-200 px-5 bg-gray-50/50">
            <div onClick={() => setActiveTab('configure')} className={getTabClasses('configure')}>
              <Settings className="w-4 h-4" />
              <span className="text-sm">Configuration</span>
            </div>
            <div onClick={() => setActiveTab('io')} className={getTabClasses('io')}>
              <FileJson className="w-4 h-4" />
              <span className="text-sm">I/O Schema</span>
            </div>
            <div onClick={() => setActiveTab('test')} className={getTabClasses('test')}>
              <TestTube className="w-4 h-4" />
              <span className="text-sm">Test & Debug</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
              <span className="font-medium">Loading block metadata...</span>
            </div>
          ) : (
            <>
              {activeTab === 'configure' && (
                <div className="space-y-6">
                  {/* Info Banner - More prominent but clean */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 text-sm text-blue-900">
                        <p className="font-semibold mb-1">Data Referencing</p>
                        <ul className="text-blue-800 space-y-1 text-xs list-disc pl-4">
                          <li>Use <code className="bg-blue-100 p-0.5 rounded text-blue-800">$node["Node Label"].json</code> to reference **upstream data**.</li>
                          <li>Access global variables with <code className="bg-blue-100 p-0.5 rounded text-blue-800">$workflow</code>.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Upstream Node Data (Collapsible/Cleaner) */}
                  {upstreamNodes.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center cursor-pointer">
                        <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                        Available Upstream Data ({upstreamNodes.length})
                      </h3>
                      {/* Note: This should ideally be a collapsible section */}
                      <div className="space-y-2 max-h-48 overflow-y-auto border-t pt-3">
                        {upstreamNodes.map((upstreamNode: any) => (
                          <div
                            key={upstreamNode.id}
                            className="bg-gray-50 border border-gray-100 rounded p-2 transition-shadow hover:shadow-md"
                          >
                            <div className="text-xs font-bold text-gray-900 truncate">{upstreamNode.data?.label}</div>
                            <code className="text-[11px] text-blue-600 font-mono mt-1 block select-all">
                              $node["{upstreamNode.data?.label}"].json
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parameter Form */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Block Parameters</h3>
                    {schema?.manifest?.config_schema?.properties ? (
                      <BlockParameterForm
                        schema={schema.manifest.config_schema.properties}
                        values={config}
                        onChange={setConfig}
                        disabled={loading || saving}
                        availableNodes={upstreamNodes}
                        contextData={{ workflow: workflowEnvVars }}
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Settings className="w-10 h-10 mx-auto mb-3" />
                        <p className="text-sm font-medium">No configuration parameters for this block.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'io' && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <BlockIOSchema
                    block={{ type: node.data?.blockType, manifest: schema?.manifest }}
                    schema={schema}
                  />
                </div>
              )}

              {activeTab === 'test' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <TestTube className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 text-sm text-yellow-900">
                        <p className="font-semibold mb-1">Test & Validate</p>
                        <p className="text-yellow-800 text-xs">
                          Run a live test of the node's function with the **current configuration and mock input data**. Remember to **save changes** before testing.
                        </p>
                      </div>
                    </div>
                  </div>

                  <BlockTestForm
                    block={{
                      type: node.data?.blockType,
                      manifest: schema?.manifest,
                    }}
                    onTestComplete={handleTestComplete}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-100/70 p-4 rounded-b-xl">
          <div className="flex items-center justify-between space-x-3">
            {/* Save Status / Success Message */}
            <div className="min-w-[150px]">
              {showSuccess && (
                <span className="text-sm font-semibold text-green-600 animate-pulse">
                  <Save className="w-4 h-4 inline mr-1" />
                  Configuration Saved!
                </span>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-5 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
              >
                Close
              </button>

              <button
                onClick={() => setActiveTab('test')}
                className="flex items-center space-x-2 px-5 py-2 text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span>Quick Test</span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}