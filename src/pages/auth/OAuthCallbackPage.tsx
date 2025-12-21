import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { checkAuthStatus } from '../../services/authService'

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL params
        const error = searchParams.get('error')
        if (error) {
          setStatus('error')
          setErrorMessage(error === 'access_denied' ? 'Access was denied' : `Authentication error: ${error}`)
          return
        }

        // Tokens may be in URL params (backup) or already set as cookies
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')

        if (accessToken) {
          // If tokens are in URL, they're also set as cookies by backend
          // Just log for debugging
          console.log('[OAuth] Tokens received in URL, cookies should be set')
        }

        // Verify authentication by checking current user
        // This uses cookies that were set by the backend redirect
        try {
          const user = await checkAuthStatus()
          if (user) {
            console.log('[OAuth] Authentication successful:', user.email)
            setStatus('success')
            // Small delay to show success state
            setTimeout(() => {
              navigate('/', { replace: true })
            }, 500)
            return
          }
        } catch (authError) {
          console.warn('[OAuth] Auth check failed:', authError)
        }

        // If we have tokens in URL but auth check failed, there might be a cookie issue
        if (accessToken) {
          console.warn('[OAuth] Tokens in URL but auth check failed - possible cookie issue')
          setStatus('error')
          setErrorMessage('Authentication completed but session could not be established. Please try logging in again.')
          return
        }

        // No tokens and auth check failed
        setStatus('error')
        setErrorMessage('No authentication data received. Please try again.')
      } catch (err) {
        console.error('[OAuth] Callback error:', err)
        setStatus('error')
        setErrorMessage('An unexpected error occurred during authentication.')
      }
    }

    handleCallback()
  }, [navigate, searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Completing authentication...
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we verify your credentials.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication successful!
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication failed
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {errorMessage || 'An error occurred during authentication.'}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default OAuthCallbackPage
