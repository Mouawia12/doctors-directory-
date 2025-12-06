import { api } from '@/lib/http'
import type { ApiListResponse, ApiResponse } from '@/types/api'
import type { Doctor } from '@/types/doctor'

export interface DoctorFilters {
  q?: string
  city?: string
  specialty?: string
  gender?: string
  languages?: string[]
  issues?: number[]
  therapy_modalities?: string[]
  age_groups?: string[]
  session_types?: Array<'in_person' | 'online' | 'hybrid'>
  insurances?: string[]
  price_min?: number
  price_max?: number
  min_exp?: number
  has_media?: boolean
  page?: number
  per_page?: number
}

const serializeFilters = (filters: DoctorFilters) => {
  const search = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        search.append(`${key}[]`, String(item))
      })
      return
    }

    if (typeof value === 'boolean') {
      search.append(key, value ? '1' : '0')
      return
    }

    search.append(key, String(value))
  })

  return search.toString()
}

export const fetchDoctors = async (filters: DoctorFilters) => {
  const { data } = await api.get<ApiListResponse<Doctor[]>>('/api/doctors', {
    params: filters,
    paramsSerializer: (params) => serializeFilters(params as DoctorFilters),
  })

  return data.data
}

export const fetchDoctor = async (id: string | number) => {
  const { data } = await api.get<ApiResponse<Doctor>>(`/api/doctors/${id}`)
  return data.data
}
