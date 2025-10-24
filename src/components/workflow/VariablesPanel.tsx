import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Edit2, Save, X } from 'lucide-react';

export interface WorkflowVariable {
  type: 'string' | 'number' | 'boolean' | 'secret' | 'json';
  default?: any;
  description?: string;
  required?: boolean;
}

interface VariablesPanelProps {
  variables: Record<string, WorkflowVariable>;
  onChange: (variables: Record<string, WorkflowVariable>) => void;
  readOnly?: boolean;
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  variables,
  onChange,
  readOnly = false,
}) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newVarName, setNewVarName] = useState('');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const addVariable = () => {
    if (!newVarName || variables[newVarName]) return;

    onChange({
      ...variables,
      [newVarName]: {
        type: 'string',
        default: '',
        description: '',
        required: false,
      },
    });
    setNewVarName('');
    setEditingKey(newVarName);
  };

  const removeVariable = (key: string) => {
    const { [key]: removed, ...rest } = variables;
    onChange(rest);
  };

  const updateVariable = (key: string, updates: Partial<WorkflowVariable>) => {
    onChange({
      ...variables,
      [key]: { ...variables[key], ...updates },
    });
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getVariableValue = (key: string, variable: WorkflowVariable) => {
    if (variable.type === 'secret' && !showSecrets[key]) {
      return '••••••••';
    }
    if (variable.type === 'boolean') {
      return variable.default ? 'true' : 'false';
    }
    if (variable.type === 'json') {
      return JSON.stringify(variable.default, null, 2);
    }
    return variable.default || '';
  };

  return (
    <div className="variables-panel">
      <div className="panel-header">
        <h3 className="text-lg font-semibold">Workflow Variables</h3>
        <p className="text-sm text-gray-500">
          Define variables accessible via <code>{'{{$vars.variable_name}}'}</code>
        </p>
      </div>

      <div className="variables-list mt-4 space-y-2">
        {Object.entries(variables).map(([key, variable]) => (
          <div
            key={key}
            className="variable-item border rounded-lg p-3 bg-white dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {key}
                  </code>
                  <select
                    value={variable.type}
                    onChange={(e) =>
                      updateVariable(key, {
                        type: e.target.value as WorkflowVariable['type'],
                      })
                    }
                    disabled={readOnly}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="secret">Secret</option>
                    <option value="json">JSON</option>
                  </select>
                  {variable.required && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      Required
                    </span>
                  )}
                </div>

                {variable.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {variable.description}
                  </p>
                )}

                <div className="mt-2">
                  <label className="text-xs text-gray-500">Default Value:</label>
                  <div className="flex items-center gap-2 mt-1">
                    {variable.type === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={variable.default || false}
                        onChange={(e) =>
                          updateVariable(key, { default: e.target.checked })
                        }
                        disabled={readOnly}
                        className="rounded"
                      />
                    ) : variable.type === 'json' ? (
                      <textarea
                        value={getVariableValue(key, variable)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            updateVariable(key, { default: parsed });
                          } catch {
                            // Invalid JSON, don't update
                          }
                        }}
                        disabled={readOnly}
                        className="flex-1 text-sm border rounded px-2 py-1 font-mono"
                        rows={3}
                      />
                    ) : (
                      <>
                        <input
                          type={
                            variable.type === 'number'
                              ? 'number'
                              : variable.type === 'secret' && !showSecrets[key]
                              ? 'password'
                              : 'text'
                          }
                          value={getVariableValue(key, variable)}
                          onChange={(e) =>
                            updateVariable(key, {
                              default:
                                variable.type === 'number'
                                  ? parseFloat(e.target.value)
                                  : e.target.value,
                            })
                          }
                          disabled={readOnly}
                          className="flex-1 text-sm border rounded px-2 py-1"
                          placeholder={`Enter ${variable.type} value`}
                        />
                        {variable.type === 'secret' && (
                          <button
                            onClick={() => toggleSecretVisibility(key)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {showSecrets[key] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!readOnly && (
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() =>
                      setEditingKey(editingKey === key ? null : key)
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit variable"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeVariable(key)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                    title="Remove variable"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {editingKey === key && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Description:</label>
                  <input
                    type="text"
                    value={variable.description || ''}
                    onChange={(e) =>
                      updateVariable(key, { description: e.target.value })
                    }
                    className="w-full text-sm border rounded px-2 py-1 mt-1"
                    placeholder="Describe this variable"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`required-${key}`}
                    checked={variable.required || false}
                    onChange={(e) =>
                      updateVariable(key, { required: e.target.checked })
                    }
                    className="rounded"
                  />
                  <label
                    htmlFor={`required-${key}`}
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Required at runtime
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={newVarName}
            onChange={(e) => setNewVarName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addVariable()}
            placeholder="variable_name"
            className="flex-1 text-sm border rounded px-3 py-2 font-mono"
          />
          <button
            onClick={addVariable}
            disabled={!newVarName || !!variables[newVarName]}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Variable
          </button>
        </div>
      )}

      {Object.keys(variables).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No variables defined</p>
          <p className="text-sm">Variables allow you to reuse values across your workflow</p>
        </div>
      )}
    </div>
  );
};

export default VariablesPanel;
