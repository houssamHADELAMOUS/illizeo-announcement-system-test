export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  announcements_count: number
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: 'admin' | 'user'
}

export interface UsersResponse {
  users: User[]
}

export interface UserResponse {
  user: User
  message?: string
}
