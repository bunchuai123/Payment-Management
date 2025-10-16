'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, LoginCredentials, RegisterData } from '@/lib/types'
import api from '@/lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth on mount
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('Attempting login with:', { username: credentials.username })
      
      const formData = new FormData()
      formData.append('username', credentials.username)
      formData.append('password', credentials.password)

      console.log('Sending request to:', `${api.defaults.baseURL}/api/auth/login`)

      const response = await api.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('Login successful:', response.data)

      const { access_token, user: userData } = response.data
      
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message)
      const message = error.response?.data?.detail || error.response?.data?.message || 'Login failed'
      throw new Error(message)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/api/auth/register', data)
      // After successful registration, you might want to auto-login
      // or redirect to login page
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed'
      throw new Error(message)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
