import type { User } from '@/types/user'

export interface AdminUserFilters {
  q?: string
  role?: string
  status?: 'all' | 'active' | 'disabled'
  page?: number
  perPage?: number
}

export type AdminUserListResponse = {
  items: User[]
  pagination: {
    page: number
    per_page: number
    total: number
  }
}
