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
  console.log('Access Token:', data.access_token)
  console.log('Refresh Token:', data.refresh_token)
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

  return response.json()
}

export const logout = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to log out')
  }

  return response.json()
}

export const checkAuthStatus = async () => {
  console.log('Checking auth status. Document cookies:', document.cookie)
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Not authenticated')
  }

  return response.json()
}
