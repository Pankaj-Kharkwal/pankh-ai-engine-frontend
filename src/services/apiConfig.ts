const DEFAULT_API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://backend-dev.pankh.ai/api/v1'
).replace(/\/$/, '')
const DEFAULT_API_KEY = import.meta.env.VITE_API_KEY || ''

const STORAGE_KEYS = {
  apiBaseUrl: 'pankh-api-base-url',
  apiKey: 'pankh-api-key',
} as const

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, '')

const readStorage = (key: string) => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch (error) {
    return null
  }
}

const writeStorage = (key: string, value: string | null) => {
  if (typeof window === 'undefined') return
  try {
    if (value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, value)
    }
  } catch (error) {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

let apiBaseUrl = normalizeBaseUrl(readStorage(STORAGE_KEYS.apiBaseUrl) || DEFAULT_API_BASE_URL)
let apiKey = readStorage(STORAGE_KEYS.apiKey) || DEFAULT_API_KEY

export const getApiBaseUrl = () => apiBaseUrl
export const getApiKey = () => apiKey

export const setApiBaseUrl = (value: string) => {
  const next = normalizeBaseUrl(value.trim())
  apiBaseUrl = next
  writeStorage(STORAGE_KEYS.apiBaseUrl, next)
}

export const setApiKey = (value: string) => {
  const next = value.trim()
  apiKey = next
  writeStorage(STORAGE_KEYS.apiKey, next ? next : null)
}

export const getDefaultApiBaseUrl = () => DEFAULT_API_BASE_URL
export const getDefaultApiKey = () => DEFAULT_API_KEY
