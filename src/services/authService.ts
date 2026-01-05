const API_URL = import.meta.env.VITE_API_URL

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: email,
      password: password,
    }),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to log in')
  }

  const data = await response.json()
  
  // Store tokens in localStorage for Bearer auth fallback
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token)
  }
  if (data.refresh_token) {
    localStorage.setItem('refresh_token', data.refresh_token)
  }
  
  return data
}

export const signup = async (fullName: string, email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      full_name: fullName,
      email: email,
      password: password,
    }),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to sign up')
  }

  const data = await response.json()
  
  // Store tokens in localStorage for Bearer auth fallback
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token)
  }
  if (data.refresh_token) {
    localStorage.setItem('refresh_token', data.refresh_token)
  }

  return data
}

export const logout = async () => {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    // Always clear local tokens
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  return { success: true }
}

export const checkAuthStatus = async () => {
  const headers: Record<string, string> = {}

  // Add Bearer token from localStorage for authentication
  const token = localStorage.getItem('access_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/users/me`, {
    method: 'GET',
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    throw new Error('Not authenticated')
  }

  return response.json()
}
