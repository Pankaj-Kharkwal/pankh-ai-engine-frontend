/**
 * ThemeContext - Dark mode theme management
 *
 * Provides theme state and toggle functionality across the application.
 * Persists theme preference to localStorage.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'pankh-theme-preference'

/**
 * Get system theme preference
 */
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Get stored theme preference or default to system
 */
const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system'

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch (error) {
    console.error('Failed to read theme preference from localStorage:', error)
  }

  return 'system'
}

/**
 * Calculate effective theme based on preference
 */
const getEffectiveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

interface Props {
  children: ReactNode
}

export const ThemeProvider: React.FC<Props> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(
    getEffectiveTheme(getStoredTheme())
  )

  // Update effective theme when theme changes
  useEffect(() => {
    const newEffectiveTheme = getEffectiveTheme(theme)
    setEffectiveTheme(newEffectiveTheme)

    // Apply theme class to document root
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newEffectiveTheme)

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newEffectiveTheme === 'dark' ? '#1a1a1a' : '#ffffff')
    }
  }, [theme])

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      setEffectiveTheme(e.matches ? 'dark' : 'light')
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch (error) {
      console.error('Failed to save theme preference to localStorage:', error)
    }
  }

  const toggleTheme = () => {
    // Simple toggle: light <-> dark (ignores system)
    setTheme(effectiveTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context
 *
 * @example
 * ```tsx
 * const { theme, effectiveTheme, setTheme, toggleTheme } = useTheme();
 *
 * // Toggle theme
 * <button onClick={toggleTheme}>
 *   {effectiveTheme === 'dark' ? 'Light' : 'Dark'} Mode
 * </button>
 *
 * // Set specific theme
 * <button onClick={() => setTheme('system')}>Use System Theme</button>
 * ```
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
