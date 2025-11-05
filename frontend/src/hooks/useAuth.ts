/**
 * Custom hook for authentication
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import { setAuthToken, clearAuthToken } from '../api/client'
import type { User, LoginCredentials, RegisterData } from '../types'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Auto-login on mount if token exists
  useEffect(() => {
    const autoLogin = async () => {
      const token = localStorage.getItem('authToken') // Use 'authToken' key to match client.ts
      if (token) {
        try {
          const userData = await authApi.getProfile()
          setUser(userData)
        } catch (error) {
          // Token invalid or expired, clear it
          clearAuthToken()
          console.error('Auto-login failed:', error)
        }
      }
      setIsLoading(false)
    }

    autoLogin()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    console.log('🔑 useAuth.login called')
    const response = await authApi.login(credentials)
    console.log('📦 Login response:', response)
    console.log('📦 response.data:', response.data)
    
    // The response structure is: { success, message, data: { user, tokens: { accessToken, refreshToken } } }
    const { user, tokens } = response.data
    const token = tokens?.accessToken
    
    console.log('👤 user:', user)
    console.log('🔑 token:', token)
    
    if (!user || !token) {
      console.error('❌ Invalid response structure:', response)
      console.error('❌ user is:', user)
      console.error('❌ token is:', token)
      throw new Error('Invalid login response')
    }
    
    console.log('✅ Setting token and user:', { user, token })
    setAuthToken(token) // Save to localStorage AND set in Axios headers
    setUser(user)
    // Navigation handled in Login page
  }

  const register = async (data: RegisterData) => {
    console.log('🔑 useAuth.register called')
    const response = await authApi.register(data)
    console.log('📦 Register response:', response)
    
    // The response structure is: { success, message, data: { user, tokens: { accessToken, refreshToken } } }
    const { user, tokens } = response.data
    const token = tokens?.accessToken
    
    if (!user || !token) {
      console.error('❌ Invalid response structure:', response)
      throw new Error('Invalid register response')
    }
    
    console.log('✅ Setting token and user:', { user, token })
    setAuthToken(token) // Save to localStorage AND set in Axios headers
    setUser(user)
    // Navigation handled in Register page
  }

  const logout = () => {
    authApi.logout()
    clearAuthToken() // Clear token from localStorage AND Axios headers
    setUser(null)
    navigate('/login')
  }

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      // Optionally refresh from server
      try {
        const freshData = await authApi.getProfile()
        setUser(freshData)
      } catch (error) {
        console.error('Failed to refresh user:', error)
      }
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  }
}
