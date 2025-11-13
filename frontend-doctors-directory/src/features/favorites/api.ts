import { api } from '@/lib/http'
import type { ApiListResponse } from '@/types/api'
import type { Doctor } from '@/types/doctor'

export const fetchFavorites = async () => {
  const { data } = await api.get<ApiListResponse<Doctor[]>>('/api/favorites')
  return data.data
}

export const addFavorite = async (doctorId: number) => {
  await api.post(`/api/doctors/${doctorId}/favorite`)
}

export const removeFavorite = async (doctorId: number) => {
  await api.delete(`/api/doctors/${doctorId}/favorite`)
}
