import type { Doctor } from '@/types/doctor'

export interface User {
  id: number
  name: string
  email: string
  avatar_url?: string | null
  roles: string[]
  doctor_profile?: Doctor | null
}
