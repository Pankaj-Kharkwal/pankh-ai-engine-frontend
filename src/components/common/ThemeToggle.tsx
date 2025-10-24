/**
 * ThemeToggle - Theme switcher component
 *
 * Allows users to switch between light, dark, and system themes.
 */

import React, { useState } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme, Theme } from '../../contexts/ThemeContext'

interface Props {
  variant?: 'icon' | 'dropdown' | 'compact'
  className?: string
}

const ThemeToggle: React.FC<Props> = ({ variant = 'icon', className = '' }) => {
  const { theme, effectiveTheme, setTheme } = useTheme()
  const [showDropdown, setShowDropdown] = useState(false)

  const themes: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ]

  const currentTheme = themes.find(t => t.value === theme)
  const effectiveIcon =
    effectiveTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />

  // Icon-only variant (simple toggle)
  if (variant === 'icon') {
    return (
      <button
        onClick={() => setTheme(effectiveTheme === 'light' ? 'dark' : 'light')}
        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
        aria-label={`Switch to ${effectiveTheme === 'light' ? 'dark' : 'light'} theme`}
        title={`Switch to ${effectiveTheme === 'light' ? 'dark' : 'light'} theme`}
      >
        {effectiveIcon}
      </button>
    )
  }

  // Compact variant (shows current theme with icon)
  if (variant === 'compact') {
    return (
      <button
        onClick={() => setTheme(effectiveTheme === 'light' ? 'dark' : 'light')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
        aria-label={`Current theme: ${theme}`}
      >
        {effectiveIcon}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentTheme?.label || 'Theme'}
        </span>
      </button>
    )
  }

  // Dropdown variant (full theme selector)
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Select theme"
        aria-expanded={showDropdown}
      >
        {effectiveIcon}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentTheme?.label || 'Theme'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
            aria-hidden="true"
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
            {themes.map(themeOption => (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value)
                  setShowDropdown(false)
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                  ${theme === themeOption.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
                `}
              >
                <div className="flex items-center gap-3">
                  {themeOption.icon}
                  <span className="font-medium">{themeOption.label}</span>
                </div>
                {theme === themeOption.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ThemeToggle
