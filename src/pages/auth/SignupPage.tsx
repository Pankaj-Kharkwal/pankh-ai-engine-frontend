import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../contexts/AuthContext';

const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signup(fullName, email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to sign up. Please try again.');
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join Pankh AI Engine.{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Log in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="full-name" className="sr-only">
              Full name
            </label>
            <input
              id="full-name"
              name="full-name"
              type="text"
              autoComplete="name"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign up
          </button>
        </div>
      </form>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white dark:bg-gray-800">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div>
            <a
              href={`${import.meta.env.VITE_API_URL}/auth/google/authorize`}
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M533.5 278.4c0-18.5-1.5-36.3-4.4-53.6H272v101.4h147.4c-6.4 34.6-26.1 63.9-55.7 83.5v69.2h90c52.3-48.2 82-119.1 82-200.5z" fill="#4285F4"/>
                <path d="M272 544.3c74.4 0 136.8-24.6 182.4-66.7l-90-69.2c-25 16.8-57 26.7-92.4 26.7-71 0-131.2-47.9-152.6-112.2H28.9v70.7C74.2 486 167.8 544.3 272 544.3z" fill="#34A853"/>
                <path d="M119.4 323.1c-10.8-32.2-10.8-66.9 0-99.1V153.3H28.9c-39.5 77-39.5 169.6 0 246.6l90.5-76.8z" fill="#FBBC05"/>
                <path d="M272 107.8c39.8 0 75.5 13.7 103.7 40.6l77.8-77.8C408.8 24.3 346.4 0 272 0 167.8 0 74.2 58.3 28.9 153.3l90.5 70.7C140.8 155.7 201 107.8 272 107.8z" fill="#EA4335"/>
              </svg>
              <span className="sr-only">Sign up with Google</span>
            </a>
          </div>
          <div>
            <a
              href={`${import.meta.env.VITE_API_URL}/auth/github/authorize`}
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7b61ff" />
                    <stop offset="100%" stopColor="#00c6ff" />
                  </linearGradient>
                </defs>
                <path fill="url(#g1)" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.65 7.65 0 012.01-.27c.68 0 1.36.09 2.01.27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span className="sr-only">Sign up with GitHub</span>
            </a>
          </div>
          
          <div>
            <a
              href={`${import.meta.env.VITE_API_URL}/auth/microsoft/authorize`}
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="2" y="3" width="9" height="9" fill="#f25022" />
                <rect x="13" y="3" width="9" height="9" fill="#7fba00" />
                <rect x="2" y="13" width="9" height="9" fill="#00a4ef" />
                <rect x="13" y="13" width="9" height="9" fill="#ffb900" />
              </svg>
              <span className="sr-only">Sign up with Microsoft</span>
            </a>
          </div>
        </div>
      </div>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
