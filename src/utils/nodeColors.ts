/**
 * Chromatic Node Color System
 * Provides beautiful gradient colors for workflow nodes based on their category
 */

export interface NodeColorScheme {
  // Background gradient
  bgGradient: string
  // Border color
  border: string
  // Icon background
  iconBg: string
  // Icon color
  iconColor: string
  // Header gradient
  headerGradient: string
  // Shadow color (with opacity)
  shadow: string
  // Handle colors
  inputHandle: string
  outputHandle: string
  // Dark mode variants
  dark: {
    bgGradient: string
    border: string
    iconBg: string
    headerGradient: string
    shadow: string
  }
}

/**
 * Category color schemes using chromatic gradients
 * Each category has a unique hue range for visual distinction
 */
export const categoryColorSchemes: Record<string, NodeColorScheme> = {
  // AI & ML - Purple/Violet gradient (Innovation, Intelligence)
  ai: {
    bgGradient: 'bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50',
    border: 'border-purple-300',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
    iconColor: 'text-white',
    headerGradient: 'bg-gradient-to-r from-purple-100 via-violet-100 to-fuchsia-100',
    shadow: 'shadow-purple-200/60',
    inputHandle: '!bg-purple-500',
    outputHandle: '!bg-violet-500',
    dark: {
      bgGradient: 'dark:bg-gradient-to-br dark:from-purple-950 dark:via-violet-950 dark:to-fuchsia-950',
      border: 'dark:border-purple-700',
      iconBg: 'dark:bg-gradient-to-br dark:from-purple-600 dark:to-violet-700',
      headerGradient: 'dark:bg-gradient-to-r dark:from-purple-900 dark:via-violet-900 dark:to-fuchsia-900',
      shadow: 'dark:shadow-purple-900/40',
    },
  },

  // Data Processing - Blue/Cyan gradient (Information, Flow)
  data: {
    bgGradient: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50',
    border: 'border-blue-300',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    iconColor: 'text-white',
    headerGradient: 'bg-gradient-to-r from-blue-100 via-cyan-100 to-sky-100',
    shadow: 'shadow-blue-200/60',
    inputHandle: '!bg-blue-500',
    outputHandle: '!bg-cyan-500',
    dark: {
      bgGradient: 'dark:bg-gradient-to-br dark:from-blue-950 dark:via-cyan-950 dark:to-sky-950',
      border: 'dark:border-blue-700',
      iconBg: 'dark:bg-gradient-to-br dark:from-blue-600 dark:to-cyan-700',
      headerGradient: 'dark:bg-gradient-to-r dark:from-blue-900 dark:via-cyan-900 dark:to-sky-900',
      shadow: 'dark:shadow-blue-900/40',
    },
  },

  // Network & HTTP - Green/Emerald gradient (Connection, Success)
  network: {
    bgGradient: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
    border: 'border-green-300',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    iconColor: 'text-white',
    headerGradient: 'bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100',
    shadow: 'shadow-green-200/60',
    inputHandle: '!bg-green-500',
    outputHandle: '!bg-emerald-500',
    dark: {
      bgGradient: 'dark:bg-gradient-to-br dark:from-green-950 dark:via-emerald-950 dark:to-teal-950',
      border: 'dark:border-green-700',
      iconBg: 'dark:bg-gradient-to-br dark:from-green-600 dark:to-emerald-700',
      headerGradient: 'dark:bg-gradient-to-r dark:from-green-900 dark:via-emerald-900 dark:to-teal-900',
      shadow: 'dark:shadow-green-900/40',
    },
  },

  // Communication - Amber/Yellow gradient (Attention, Messaging)
  communication: {
    bgGradient: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
    border: 'border-amber-300',
    iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-600',
    iconColor: 'text-white',
    headerGradient: 'bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100',
    shadow: 'shadow-amber-200/60',
    inputHandle: '!bg-amber-500',
    outputHandle: '!bg-yellow-500',
    dark: {
      bgGradient: 'dark:bg-gradient-to-br dark:from-amber-950 dark:via-yellow-950 dark:to-orange-950',
      border: 'dark:border-amber-700',
      iconBg: 'dark:bg-gradient-to-br dark:from-amber-600 dark:to-yellow-700',
      headerGradient: 'dark:bg-gradient-to-r dark:from-amber-900 dark:via-yellow-900 dark:to-orange-900',
      shadow: 'dark:shadow-amber-900/40',
    },
  },

  // Utility - Slate/Gray gradient (Neutral, Functional)
  utility: {
    bgGradient: 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50',
    border: 'border-slate-300',
    iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
    iconColor: 'text-white',
    headerGradient: 'bg-gradient-to-r from-slate-100 via-gray-100 to-zinc-100',
    shadow: 'shadow-slate-200/60',
    inputHandle: '!bg-slate-500',
    outputHandle: '!bg-gray-500',
    dark: {
      bgGradient: 'dark:bg-gradient-to-br dark:from-slate-950 dark:via-gray-950 dark:to-zinc-950',
      border: 'dark:border-slate-600',
      iconBg: 'dark:bg-gradient-to-br dark:from-slate-600 dark:to-gray-700',
      headerGradient: 'dark:bg-gradient-to-r dark:from-slate-800 dark:via-gray-800 dark:to-zinc-800',
      shadow: 'dark:shadow-slate-900/40',
    },
  },

  // Math - Orange/Red gradient (Calculation, Energy)
  math: {
    bgGradient: 'bg-gradient-to-br from-orange-50 via-red-50 to-rose-50',
    border: 'border-orange-300',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-600',
    iconColor: 'text-white',
    headerGradient: 'bg-gradient-to-r from-orange-100 via-red-100 to-rose-100',
    shadow: 'shadow-orange-200/60',
    inputHandle: '!bg-orange-500',
    outputHandle: '!bg-red-500',
    dark: {
      bgGradient: 'dark:bg-gradient-to-br dark:from-orange-950 dark:via-red-950 dark:to-rose-950',
      border: 'dark:border-orange-700',
      iconBg: 'dark:bg-gradient-to-br dark:from-orange-600 dark:to-red-700',
      headerGradient: 'dark:bg-gradient-to-r dark:from-orange-900 dark:via-red-900 dark:to-rose-900',
      shadow: 'dark:shadow-orange-900/40',
    },
  },

  // Document - Indigo/Blue gradient (Files, Knowledge)
  document: {
    bgGradient: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-50',
    border: 'border-indigo-300',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    iconColor: 'text-white',
    headerGradient: 'bg-gradient-to-r from-indigo-100 via-blue-100 to-violet-100',
    shadow: 'shadow-indigo-200/60',
    inputHandle: '!bg-indigo-500',
    outputHandle: '!bg-blue-500',
    dark: {
      bgGradient: 'dark:bg-gradient-to-br dark:from-indigo-950 dark:via-blue-950 dark:to-violet-950',
      border: 'dark:border-indigo-700',
      iconBg: 'dark:bg-gradient-to-br dark:from-indigo-600 dark:to-blue-700',
      headerGradient: 'dark:bg-gradient-to-r dark:from-indigo-900 dark:via-blue-900 dark:to-violet-900',
      shadow: 'dark:shadow-indigo-900/40',
    },
  },

  // Security - Red/Rose gradient (Protection, Alert)
  security: {
    bgGradient: 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50',
    border: 'border-red-300',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
    iconColor: 'text-white',
    headerGradient: 'bg-gradient-to-r from-red-100 via-rose-100 to-pink-100',
    shadow: 'shadow-red-200/60',
    inputHandle: '!bg-red-500',
    outputHandle: '!bg-rose-500',
    dark: {
      bgGradient: 'dark:bg-gradient-to-br dark:from-red-950 dark:via-rose-950 dark:to-pink-950',
      border: 'dark:border-red-700',
      iconBg: 'dark:bg-gradient-to-br dark:from-red-600 dark:to-rose-700',
      headerGradient: 'dark:bg-gradient-to-r dark:from-red-900 dark:via-rose-900 dark:to-pink-900',
      shadow: 'dark:shadow-red-900/40',
    },
  },

  // Integration - Cyan/Teal gradient (Connectivity, Systems)
  integration: {
    bgGradient: 'bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50',
    border: 'border-cyan-300',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-teal-600',
    iconColor: 'text-white',
    headerGradient: 'bg-gradient-to-r from-cyan-100 via-teal-100 to-emerald-100',
    shadow: 'shadow-cyan-200/60',
    inputHandle: '!bg-cyan-500',
    outputHandle: '!bg-teal-500',
    dark: {
      bgGradient: 'dark:bg-gradient-to-br dark:from-cyan-950 dark:via-teal-950 dark:to-emerald-950',
      border: 'dark:border-cyan-700',
      iconBg: 'dark:bg-gradient-to-br dark:from-cyan-600 dark:to-teal-700',
      headerGradient: 'dark:bg-gradient-to-r dark:from-cyan-900 dark:via-teal-900 dark:to-emerald-900',
      shadow: 'dark:shadow-cyan-900/40',
    },
  },
}

// Default fallback scheme
const defaultScheme: NodeColorScheme = categoryColorSchemes.utility

/**
 * Get the color scheme for a block type
 * Determines category from block type string and returns appropriate colors
 */
export function getNodeColorScheme(blockType: string): NodeColorScheme {
  const type = blockType.toLowerCase()

  // AI category detection
  if (type.includes('ai') || type.includes('llm') || type.includes('chat') ||
      type.includes('gpt') || type.includes('azure_chat') || type.includes('summarize') ||
      type.includes('translate') || type.includes('analyze')) {
    return categoryColorSchemes.ai
  }

  // Data category detection
  if (type.includes('data') || type.includes('json') || type.includes('csv') ||
      type.includes('parse') || type.includes('filter') || type.includes('sort') ||
      type.includes('search') || type.includes('scrape')) {
    return categoryColorSchemes.data
  }

  // Network category detection
  if (type.includes('http') || type.includes('api') || type.includes('web') ||
      type.includes('network') || type.includes('webhook') || type.includes('request')) {
    return categoryColorSchemes.network
  }

  // Communication category detection
  if (type.includes('email') || type.includes('slack') || type.includes('discord') ||
      type.includes('sms') || type.includes('message') || type.includes('notification')) {
    return categoryColorSchemes.communication
  }

  // Math category detection
  if (type.includes('math') || type.includes('sum') || type.includes('statistic') ||
      type.includes('random') || type.includes('calculate')) {
    return categoryColorSchemes.math
  }

  // Document category detection
  if (type.includes('file') || type.includes('pdf') || type.includes('image') ||
      type.includes('document') || type.includes('read') || type.includes('write')) {
    return categoryColorSchemes.document
  }

  // Security category detection
  if (type.includes('hash') || type.includes('encrypt') || type.includes('jwt') ||
      type.includes('password') || type.includes('auth') || type.includes('security')) {
    return categoryColorSchemes.security
  }

  // Integration category detection
  if (type.includes('github') || type.includes('google') || type.includes('aws') ||
      type.includes('docker') || type.includes('k8s') || type.includes('kubernetes')) {
    return categoryColorSchemes.integration
  }

  // Utility - default for echo, delay, variable, condition, etc.
  if (type.includes('echo') || type.includes('delay') || type.includes('variable') ||
      type.includes('condition') || type.includes('loop') || type.includes('end')) {
    return categoryColorSchemes.utility
  }

  return defaultScheme
}

/**
 * Get category from block type for display purposes
 */
export function getCategoryFromBlockType(blockType: string): string {
  const type = blockType.toLowerCase()

  if (type.includes('ai') || type.includes('llm') || type.includes('chat') ||
      type.includes('gpt') || type.includes('summarize') || type.includes('translate')) {
    return 'ai'
  }
  if (type.includes('data') || type.includes('json') || type.includes('csv') ||
      type.includes('parse') || type.includes('filter') || type.includes('search')) {
    return 'data'
  }
  if (type.includes('http') || type.includes('api') || type.includes('web') ||
      type.includes('webhook')) {
    return 'network'
  }
  if (type.includes('email') || type.includes('slack') || type.includes('discord') ||
      type.includes('sms')) {
    return 'communication'
  }
  if (type.includes('math') || type.includes('sum') || type.includes('statistic') ||
      type.includes('random')) {
    return 'math'
  }
  if (type.includes('file') || type.includes('pdf') || type.includes('image') ||
      type.includes('document')) {
    return 'document'
  }
  if (type.includes('hash') || type.includes('encrypt') || type.includes('jwt') ||
      type.includes('password')) {
    return 'security'
  }
  if (type.includes('github') || type.includes('google') || type.includes('aws') ||
      type.includes('docker')) {
    return 'integration'
  }

  return 'utility'
}

/**
 * Build complete class string for a node based on its block type
 */
export function getNodeClasses(blockType: string, isSelected: boolean = false): string {
  const scheme = getNodeColorScheme(blockType)
  const dark = scheme.dark

  const baseClasses = [
    scheme.bgGradient,
    dark.bgGradient,
    `border-2`,
    scheme.border,
    dark.border,
    scheme.shadow,
    dark.shadow,
    'transition-all duration-300',
  ]

  if (isSelected) {
    baseClasses.push('ring-4 ring-blue-400 ring-offset-2 shadow-xl')
  }

  return baseClasses.join(' ')
}

/**
 * Get header classes for a node
 */
export function getNodeHeaderClasses(blockType: string): string {
  const scheme = getNodeColorScheme(blockType)
  return `${scheme.headerGradient} ${scheme.dark.headerGradient}`
}

/**
 * Get icon container classes for a node
 */
export function getNodeIconClasses(blockType: string): string {
  const scheme = getNodeColorScheme(blockType)
  return `${scheme.iconBg} ${scheme.dark.iconBg} ${scheme.iconColor}`
}

/**
 * Get handle classes for inputs and outputs
 */
export function getHandleClasses(blockType: string, type: 'input' | 'output'): string {
  const scheme = getNodeColorScheme(blockType)
  return type === 'input' ? scheme.inputHandle : scheme.outputHandle
}
