import type { Doctor } from '@/types/doctor'

export interface UserFavorite {
  id: number
  doctor_id: number
  doctor?: Doctor | null
  created_at?: string
}

export interface User {
  id: number
  name: string
  email: string
  avatar_url?: string | null
  roles: string[]
  is_disabled?: boolean
  last_login_at?: string | null
  created_at?: string
  favorites_count?: number
  favorites?: UserFavorite[]
  doctor_profile?: Doctor | null
}
