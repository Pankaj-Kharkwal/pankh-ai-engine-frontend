/**
 * ExpressionEditor - Enhanced editor for workflow expressions
 *
 * Features:
 * - Auto-completion for node outputs
 * - Syntax highlighting
 * - Error detection
 * - Variable suggestions
 */

import React, { useState, useRef, useEffect } from 'react';
import { Code, Lightbulb, AlertCircle } from 'lucide-react';

interface Node {
  id: string;
  type: string;
  data?: {
    label?: string;
    outputs?: Record<string, any>;
  };
}

interface Suggestion {
  text: string;
  type: 'node' | 'variable' | 'function';
  description?: string;
  insertText: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  nodes?: Node[];
  variables?: Record<string, any>;
  placeholder?: string;
  className?: string;
  error?: string;
}

const ExpressionEditor: React.FC<Props> = ({
  value,
  onChange,
  nodes = [],
  variables = {},
  placeholder = 'Enter expression (e.g., {{node_1.output}})',
  className = '',
  error,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Built-in functions
  const functions = [
    { name: 'sum', description: 'Sum of numbers', example: 'sum(1, 2, 3)' },
    { name: 'concat', description: 'Concatenate strings', example: 'concat("a", "b")' },
    { name: 'format', description: 'Format string', example: 'format("Hello {}", name)' },
    { name: 'now', description: 'Current timestamp', example: 'now()' },
    { name: 'random', description: 'Random number', example: 'random()' },
    { name: 'length', description: 'Array/string length', example: 'length(array)' },
    { name: 'upper', description: 'Uppercase string', example: 'upper("hello")' },
    { name: 'lower', description: 'Lowercase string', example: 'lower("HELLO")' },
    { name: 'trim', description: 'Trim whitespace', example: 'trim(" text ")' },
  ];

  // Generate suggestions based on current input
  useEffect(() => {
    if (!inputRef.current) return;

    const cursorPos = inputRef.current.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);

    // Check if we're inside {{ }}
    const lastOpen = textBeforeCursor.lastIndexOf('{{');
    const lastClose = textBeforeCursor.lastIndexOf('}}');

    if (lastOpen > lastClose) {
      // We're inside an expression
      const expressionText = textBeforeCursor.substring(lastOpen + 2);
      const currentWord = expressionText.split(/[\s.()\[\],]+/).pop() || '';

      const newSuggestions: Suggestion[] = [];

      // Node suggestions
      nodes.forEach((node) => {
        if (node.id.toLowerCase().includes(currentWord.toLowerCase())) {
          newSuggestions.push({
            text: node.data?.label || node.id,
            type: 'node',
            description: `Node: ${node.type}`,
            insertText: `${node.id}.output`,
          });
        }
      });

      // Variable suggestions
      Object.keys(variables).forEach((varName) => {
        if (varName.toLowerCase().includes(currentWord.toLowerCase())) {
          newSuggestions.push({
            text: varName,
            type: 'variable',
            description: `Variable: ${typeof variables[varName]}`,
            insertText: varName,
          });
        }
      });

      // Function suggestions
      functions.forEach((func) => {
        if (func.name.toLowerCase().includes(currentWord.toLowerCase())) {
          newSuggestions.push({
            text: func.name,
            type: 'function',
            description: func.description,
            insertText: func.example,
          });
        }
      });

      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }

    setCursorPosition(cursorPos);
  }, [value, nodes, variables]);

  const insertSuggestion = (suggestion: Suggestion) => {
    if (!inputRef.current) return;

    const cursorPos = inputRef.current.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);

    const lastOpen = textBeforeCursor.lastIndexOf('{{');
    const expressionText = textBeforeCursor.substring(lastOpen + 2);
    const currentWordStart = expressionText.lastIndexOf(expressionText.split(/[\s.()\[\],]+/).pop() || '');

    const insertPos = lastOpen + 2 + currentWordStart;
    const newValue =
      value.substring(0, insertPos) +
      suggestion.insertText +
      textAfterCursor;

    onChange(newValue);
    setShowSuggestions(false);

    // Set cursor position after inserted text
    setTimeout(() => {
      const newCursorPos = insertPos + suggestion.insertText.length;
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          insertSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  // Syntax highlighting (simple replacement for display)
  const highlightSyntax = (text: string): string => {
    return text
      .replace(/\{\{([^}]+)\}\}/g, '<span class="text-blue-600 dark:text-blue-400 font-semibold">{{$1}}</span>')
      .replace(/\b(sum|concat|format|now|random|length|upper|lower|trim)\b/g, '<span class="text-purple-600 dark:text-purple-400">$1</span>');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Label */}
        <div className="flex items-center gap-2 mb-2">
          <Code className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Expression
          </label>
          <Lightbulb className="w-4 h-4 text-yellow-500" title="Use {{ }} for expressions" />
        </div>

        {/* Input */}
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2 rounded-lg font-mono text-sm
            bg-white dark:bg-gray-800
            border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:border-blue-500 dark:focus:border-blue-400
            focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900
            resize-vertical
            min-h-[80px]
          `}
          rows={3}
        />

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 mt-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.text}`}
                onClick={() => insertSuggestion(suggestion)}
                className={`
                  w-full px-3 py-2 text-left text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  ${index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2 py-0.5 rounded text-xs font-medium
                      ${suggestion.type === 'node' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''}
                      ${suggestion.type === 'variable' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : ''}
                      ${suggestion.type === 'function' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' : ''}
                    `}>
                      {suggestion.type}
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {suggestion.text}
                    </span>
                  </div>
                </div>
                {suggestion.description && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {suggestion.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p>
          Use <code className="px-1 bg-gray-100 dark:bg-gray-700 rounded">{'{{ }}'}</code> for expressions.
          Examples: <code className="px-1 bg-gray-100 dark:bg-gray-700 rounded">{'{{node_1.output}}'}</code>,
          {' '}<code className="px-1 bg-gray-100 dark:bg-gray-700 rounded">{'{{sum(1, 2, 3)}}'}</code>
        </p>
        <p className="mt-1">
          Press <kbd className="px-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Space</kbd> for suggestions
        </p>
      </div>
    </div>
  );
};

export default ExpressionEditor;
