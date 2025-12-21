import { api } from '@/lib/http'
import type { ApiListResponse, ApiResponse } from '@/types/api'
import type { User } from '@/types/user'
import type { AdminUserFilters, AdminUserListResponse, CreateAdminPayload } from '@/features/adminUsers/types'

export const fetchAdminUsers = async (filters: AdminUserFilters = {}) => {
  const { q, role, status, page = 1, perPage = 15 } = filters
  const params = {
    q,
    role,
    status: status && status !== 'all' ? status : undefined,
    page,
    per_page: perPage,
  }
  const { data } = await api.get<ApiListResponse<User[]>>('/api/admin/users', { params })
  return {
    items: data.data.items,
    pagination: data.data.pagination,
  } satisfies AdminUserListResponse
}

export const updateAdminUserStatus = async (userId: number, isDisabled: boolean) => {
  const { data } = await api.post<ApiResponse<User>>(`/api/admin/users/${userId}/status`, {
    is_disabled: isDisabled,
  })
  return data.data
}

export const resetAdminUserPassword = async (userId: number) => {
  await api.post(`/api/admin/users/${userId}/reset-password`)
}

export const deleteAdminUser = async (userId: number) => {
  await api.delete(`/api/admin/users/${userId}`)
}

export const createAdminUser = async (payload: CreateAdminPayload) => {
  const { data } = await api.post<ApiResponse<User>>('/api/admin/users/admins', payload)
  return data.data
}
