export type DoctorStatus = 'pending' | 'approved' | 'rejected'

export interface Clinic {
  id: number
  address: string
  city: string
  lat: number | null
  lng: number | null
  work_hours?: Record<string, string[]>
}

export interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  children?: Category[]
}

export interface DoctorUser {
  id: number
  name: string
  email: string
  roles: string[]
}

export interface MediaItem {
  id: number
  name: string
  url: string
  thumb_url?: string
  mime_type: string
  size: number
}

export interface Doctor {
  id: number
  full_name: string
  bio?: string
  specialty: string
  sub_specialty?: string
  qualifications?: string[]
  license_number?: string
  languages?: string[]
  gender?: string
  years_of_experience?: number
  insurances?: string[]
  city?: string
  lat?: number
  lng?: number
  website?: string
  phone?: string
  whatsapp?: string
  email?: string
  is_verified: boolean
  status: DoctorStatus
  status_note?: string | null
  favorites_count?: number
  is_favorite?: boolean
  user?: DoctorUser | null
  clinics?: Clinic[]
  categories?: Category[]
  media?: {
    documents: MediaItem[]
    gallery: MediaItem[]
  }
  created_at?: string
  updated_at?: string
}
