/**
 * Login Page
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuthContext()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({ email, password })
      // Navigate to dashboard after successful login
      navigate('/dashboard')
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-100">
            🎮 Login to Playo
          </h1>
          <p className="text-slate-400">
            Welcome back, hero!
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-4">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-2 font-semibold">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="hero@playo.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-slate-300 mb-2 font-semibold">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            className="bg-purple-600 hover:bg-purple-700 text-white w-full py-3 text-lg font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span>⚔️</span>
                Logging in...
              </span>
            ) : (
              '⚔️ Login'
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center pt-4 border-t border-slate-700">
          <p className="text-slate-400">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Back to Demo */}
        <div className="text-center">
          <Link 
            to="/demo" 
            className="text-slate-500 hover:text-slate-400 text-sm transition-colors"
          >
            ← Back to Demo
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
