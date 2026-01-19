import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/shared/api/client'
import type { User } from '@/domain/auth/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const isAuthenticated = !!user

  // fetch user
  useEffect(() => {
    refreshUser()
  }, [])

  const refreshUser = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get<{ user: User } | User>('/api/auth/me')
      const userData = 'user' in response.data ? response.data.user : response.data
      setUser(userData)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ token: string; user: User }>('/api/auth/login', {
        email,
        password,
      })

      const { user: userData, token } = response.data

      if (token) {
        localStorage.setItem('auth_token', token)
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }

      setUser(userData)
      queryClient.setQueryData(['user'], userData)

      navigate('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout')
    } catch {
    } finally {
      localStorage.removeItem('auth_token')
      delete apiClient.defaults.headers.common['Authorization']
      setUser(null)
      queryClient.clear()
      navigate('/login')
    }
  }

  // Restore token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
