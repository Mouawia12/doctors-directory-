import { api } from '@/lib/http'
import type { ApiListResponse, ApiResponse } from '@/types/api'
import type { Category, Doctor } from '@/types/doctor'
import type { AdminDoctorFilters, AdminDoctorPayload } from '@/features/admin/types'

export const fetchAdminDoctors = async (filters: AdminDoctorFilters = {}) => {
  const { status, q, page = 1, perPage = 10 } = filters
  const { data } = await api.get<ApiListResponse<Doctor[]>>('/api/admin/doctors', {
    params: {
      status: status && status !== 'all' ? status : undefined,
      q,
      page,
      per_page: perPage,
    },
  })
  return data.data
}

export const fetchAdminDoctor = async (doctorId: number | string) => {
  const { data } = await api.get<ApiResponse<Doctor>>(`/api/admin/doctors/${doctorId}`)
  return data.data
}

export const createAdminDoctor = async (payload: AdminDoctorPayload) => {
  const { data } = await api.post<ApiResponse<Doctor>>('/api/admin/doctors', payload)
  return data.data
}

export const updateAdminDoctor = async (doctorId: number, payload: AdminDoctorPayload) => {
  const { data } = await api.put<ApiResponse<Doctor>>(`/api/admin/doctors/${doctorId}`, payload)
  return data.data
}

export const deleteAdminDoctor = async (doctorId: number) => {
  await api.delete(`/api/admin/doctors/${doctorId}`)
}

export const approveDoctor = async (doctorId: number) => {
  await api.post(`/api/admin/doctors/${doctorId}/approve`)
}

export const rejectDoctor = async (doctorId: number, note?: string) => {
  await api.post(`/api/admin/doctors/${doctorId}/reject`, { note })
}

export const createCategory = async (payload: Partial<Category>) => {
  const { data } = await api.post<ApiResponse<Category>>('/api/admin/categories', payload)
  return data.data
}

export const updateCategory = async (categoryId: number, payload: Partial<Category>) => {
  const { data } = await api.put<ApiResponse<Category>>(`/api/admin/categories/${categoryId}`, payload)
  return data.data
}

export const deleteCategory = async (categoryId: number) => {
  await api.delete(`/api/admin/categories/${categoryId}`)
}
