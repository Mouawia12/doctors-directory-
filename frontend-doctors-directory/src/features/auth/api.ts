import axios from 'axios'
import { api } from '@/lib/http'
import type { ApiResponse } from '@/types/api'
import type { User } from '@/types/user'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  type: 'doctor' | 'user'
}

export interface AuthSuccessPayload {
  user: User
  token: string
}

export interface SocialLoginPayload {
  token: string
  type?: 'doctor' | 'user'
}

export interface UpdatePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const { data } = await api.get<ApiResponse<User>>('/api/auth/me')
    return data.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null
    }
    throw error
  }
}

export const login = async (payload: LoginPayload): Promise<AuthSuccessPayload> => {
  const { data } = await api.post<ApiResponse<AuthSuccessPayload>>('/api/auth/login', payload)
  return data.data
}

export const register = async (payload: RegisterPayload): Promise<AuthSuccessPayload> => {
  const { data } = await api.post<ApiResponse<AuthSuccessPayload>>('/api/auth/register', payload)
  return data.data
}

export const loginWithGoogle = async (payload: SocialLoginPayload): Promise<AuthSuccessPayload> => {
  const { data } = await api.post<ApiResponse<AuthSuccessPayload>>('/api/auth/google', payload)
  return data.data
}

export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout')
}

export const updatePassword = async (payload: UpdatePasswordPayload): Promise<void> => {
  await api.put('/api/auth/password', payload)
}
