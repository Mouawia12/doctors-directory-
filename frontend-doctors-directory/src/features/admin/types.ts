import type { DoctorStatus, Doctor } from '@/types/doctor'

export interface AdminDoctorFilters {
  status?: DoctorStatus | 'all'
  page?: number
  perPage?: number
  q?: string
}

export interface AdminDoctorClinicInput {
  id?: number
  address: string
  city: string
  lat?: number | null
  lng?: number | null
  work_hours?: Record<string, string[]>
}

export interface AdminDoctorPayload {
  user_id?: number | null
  full_name: string
  bio?: string | null
  specialty: string
  sub_specialty?: string | null
  qualifications?: string[]
  license_number?: string | null
  languages: string[]
  gender: Doctor['gender']
  years_of_experience: number
  insurances?: string[]
  city: string
  lat?: number | null
  lng?: number | null
  website?: string | null
  phone: string
  whatsapp?: string | null
  email?: string | null
  is_verified: boolean
  status: DoctorStatus
  status_note?: string | null
  categories?: number[]
  clinics: AdminDoctorClinicInput[]
}

export type AdminDoctorResponse = {
  items: Doctor[]
  pagination: {
    page: number
    per_page: number
    total: number
  }
}
