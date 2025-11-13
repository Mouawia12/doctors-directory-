import { api } from '@/lib/http'
import type { ApiResponse } from '@/types/api'
import type { Category } from '@/types/doctor'

export const fetchCategories = async () => {
  const { data } = await api.get<ApiResponse<{ items: Category[] }>>('/api/categories')
  return data.data.items
}
