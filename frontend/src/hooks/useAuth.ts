/**
 * Custom hook for authentication
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import type { User, LoginCredentials, RegisterData } from '../types'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Auto-login on mount if token exists
  useEffect(() => {
    const autoLogin = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await authApi.getProfile()
          setUser(userData)
        } catch (error) {
          // Token invalid or expired, clear it
          localStorage.removeItem('token')
          console.error('Auto-login failed:', error)
        }
      }
      setIsLoading(false)
    }

    autoLogin()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      // Navigation handled in Login page
    }
  }

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data)
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      // Navigation handled in Register page
    }
  }

  const logout = () => {
    authApi.logout()
    localStorage.removeItem('token')
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
