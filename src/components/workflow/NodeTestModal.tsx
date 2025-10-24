import React, { useState, useEffect } from "react";
import { X, Play, Loader2, CheckCircle, XCircle } from "lucide-react";
import { apiClient } from "../../services/api";
import BlockParameterForm from "../blocks/BlockParameterForm";

interface NodeTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: {
    id: string;
    type: string;
    data: {
      label?: string;
      parameters?: Record<string, any>;
    };
  };
}

export const NodeTestModal: React.FC<NodeTestModalProps> = ({
  isOpen,
  onClose,
  node,
}) => {
  const [testParams, setTestParams] = useState<Record<string, any>>({});
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Load block schema when modal opens
  useEffect(() => {
    if (isOpen && node) {
      loadSchema();
    }
  }, [isOpen, node?.type]);

  const loadSchema = async () => {
    setLoading(true);
    try {
      const schemaData = await apiClient.getBlockSchema(node.type);
      setSchema(schemaData);

      // Initialize with node's existing parameters or defaults
      const configSchema = schemaData?.manifest?.config_schema;
      const defaultParams: Record<string, any> = {};

      if (configSchema?.properties) {
        Object.entries(configSchema.properties).forEach(
          ([key, fieldSchema]: [string, any]) => {
            // Use existing parameter value, or fall back to default from schema
            if (node.data.parameters && key in node.data.parameters) {
              defaultParams[key] = node.data.parameters[key];
            } else if (fieldSchema.default !== undefined) {
              defaultParams[key] = fieldSchema.default;
            }
          }
        );
      }

      setTestParams(defaultParams);
    } catch (err) {
      console.error("Failed to load block schema:", err);
    } finally {
      setLoading(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await apiClient.testNode({
        block_type: node.type,
        parameters: testParams,
      });

      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || "Test failed",
      });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Test Node</h2>
            <p className="text-sm text-gray-600">
              {node.data.label || node.type} ({node.id})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Loading schema...</span>
            </div>
          ) : (
            <>
              {/* Parameter Form */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Test Parameters
                </h3>
                {schema?.manifest?.config_schema?.properties ? (
                  <BlockParameterForm
                    schema={schema.manifest.config_schema.properties}
                    values={testParams}
                    onChange={setTestParams}
                    disabled={testing}
                  />
                ) : (
                  <p className="text-sm text-gray-500">
                    No parameters required for this block
                  </p>
                )}
              </div>

              {/* Test Results */}
              {testResult && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Test Results
                  </h3>
                  <div
                    className={`rounded-lg p-4 border-2 ${
                      testResult.success
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    {/* Status Header */}
                    <div className="flex items-center gap-2 mb-3">
                      {testResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span
                        className={`font-semibold ${
                          testResult.success ? "text-green-900" : "text-red-900"
                        }`}
                      >
                        {testResult.success ? "Test Passed" : "Test Failed"}
                      </span>
                      {testResult.execution_time_ms && (
                        <span className="text-sm text-gray-600 ml-auto">
                          {testResult.execution_time_ms.toFixed(2)}ms
                        </span>
                      )}
                    </div>

                    {/* Output */}
                    {testResult.success && testResult.output && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Output:
                        </div>
                        <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                          {JSON.stringify(testResult.output, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Error */}
                    {!testResult.success && testResult.error && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-red-700 mb-1">
                          Error:
                        </div>
                        <pre className="text-xs bg-white p-2 rounded border text-red-700 overflow-auto">
                          {testResult.error}
                        </pre>
                      </div>
                    )}

                    {/* Logs */}
                    {testResult.logs && testResult.logs.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Logs:
                        </div>
                        <div className="text-xs bg-white p-2 rounded border max-h-32 overflow-auto font-mono">
                          {testResult.logs.map((log: string, idx: number) => (
                            <div key={idx} className="text-gray-700">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
            disabled={testing}
          >
            Close
          </button>
          <button
            onClick={runTest}
            disabled={testing || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Test...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Test</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeTestModal;
