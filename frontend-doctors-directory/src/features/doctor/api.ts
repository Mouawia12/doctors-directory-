import { api } from '@/lib/http'
import type { ApiResponse } from '@/types/api'
import type { Doctor } from '@/types/doctor'

export const fetchDoctorProfile = async () => {
  const { data } = await api.get<ApiResponse<Doctor | null>>('/api/doctor/profile')
  return data.data
}

export const saveDoctorProfile = async (payload: Record<string, unknown>) => {
  const { data } = await api.post<ApiResponse<Doctor>>('/api/doctor/profile', payload)
  return data.data
}

export const uploadDoctorMedia = async (formData: FormData) => {
  const { data } = await api.post<ApiResponse<Doctor>>('/api/doctor/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data.data
}

export const deleteDoctorMedia = async (mediaId: number) => {
  await api.delete(`/api/doctor/media/${mediaId}`)
}

export const joinDoctorProgram = async () => {
  const { data } = await api.post<ApiResponse<Doctor>>('/api/doctor/join')
  return data.data
}
