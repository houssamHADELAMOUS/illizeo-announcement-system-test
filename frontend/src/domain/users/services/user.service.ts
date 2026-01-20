import apiClient from '@/shared/api/client'
import type { User, CreateUserData, UsersResponse, UserResponse } from '../types'

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<UsersResponse>('/api/users')
    return response.data.users
  },

  async getById(id: number): Promise<User> {
    const response = await apiClient.get<{ user: User }>(`/api/users/${id}`)
    return response.data.user
  },

  async create(data: CreateUserData): Promise<User> {
    const response = await apiClient.post<UserResponse>('/api/users', data)
    return response.data.user
  },

  async delete(id: number): Promise<void> {
    // check tenant id before making request
    const tenantId = localStorage.getItem('tenant_id')
    if (!tenantId) {
      throw new Error('Tenant ID is missing. Please select a tenant or reload the app.')
    }
    await apiClient.delete(`/api/users/${id}`)
  },
}
