import axios from 'axios'
import { api } from '@/lib/http'
import type { ApiListResponse } from '@/types/api'
import type { Doctor } from '@/types/doctor'

const emptyFavorites = {
  items: [] as Doctor[],
  pagination: {
    page: 1,
    per_page: 0,
    total: 0,
  },
}

export const fetchFavorites = async () => {
  if (!api.defaults.headers.common.Authorization) {
    return emptyFavorites
  }
  try {
    const { data } = await api.get<ApiListResponse<Doctor[]>>('/api/favorites')
    return data.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return emptyFavorites
    }
    throw error
  }
}

export const addFavorite = async (doctorId: number) => {
  await api.post(`/api/doctors/${doctorId}/favorite`)
}

export const removeFavorite = async (doctorId: number) => {
  await api.delete(`/api/doctors/${doctorId}/favorite`)
}
