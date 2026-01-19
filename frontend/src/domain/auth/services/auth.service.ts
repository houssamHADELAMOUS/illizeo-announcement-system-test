import apiClient, { getCsrfCookie } from '@/shared/api/client'
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/domain/auth/types'

export interface LoginResponse {
  token: string
  user: User
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await getCsrfCookie()
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials)
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
    }
    
    return response.data
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    await getCsrfCookie()
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data)
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout')
    } finally {
      localStorage.removeItem('auth_token')
      delete apiClient.defaults.headers.common['Authorization']
    }
  },

  async getUser(): Promise<User> {
    const response = await apiClient.get<{ user: User } | User>('/api/auth/me')
    return 'user' in response.data ? response.data.user : response.data
  },

  // init auth
  initializeAuth(): void {
    const token = localStorage.getItem('auth_token')
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  },

  // check auth
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  },
}
