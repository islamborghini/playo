/**
 * Register Page
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    characterName: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register } = useAuthContext()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await register(formData)
      // Navigate to dashboard after successful registration
      navigate('/dashboard')
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Registration failed. Please try again.')
      console.error('Register error:', err)
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
            ⚔️ Create Your Hero
          </h1>
          <p className="text-slate-400">
            Begin your epic journey!
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-4">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-2 font-semibold">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="hero@playo.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-slate-300 mb-2 font-semibold">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="heroname"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-slate-300 mb-2 font-semibold">
              Character Name
            </label>
            <input
              type="text"
              name="characterName"
              value={formData.characterName}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Sir Lancelot"
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={6}
            />
            <p className="text-slate-500 text-sm mt-1">
              Minimum 6 characters
            </p>
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
                Creating Hero...
              </span>
            ) : (
              '⚔️ Create Hero'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center pt-4 border-t border-slate-700">
          <p className="text-slate-400">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Login here
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

export default Register
