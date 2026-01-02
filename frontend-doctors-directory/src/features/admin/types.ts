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
  honorific_prefix?: string | null
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  credentials_suffix?: string | null
  preferred_pronouns?: string | null
  display_name_preference?: 'personal' | 'business'
  business_name?: string | null
  tagline?: string | null
  bio?: string | null
  about_paragraph_one?: string | null
  about_paragraph_two?: string | null
  about_paragraph_three?: string | null
  specialty: string[]
  sub_specialty?: string[] | null
  qualifications?: string[]
  additional_credentials?: string[]
  license_number?: string | null
  license_state?: string | null
  license_expiration?: string | null
  professional_role?: string | null
  licensure_status?: 'licensed' | 'supervised' | 'unlicensed' | null
  qualifications_note?: string | null
  education_institution?: string | null
  education_degree?: string | null
  education_graduation_year?: number | null
  practice_start_year?: number | null
  languages: string[]
  gender: Doctor['gender']
  years_of_experience: number
  insurances?: string[]
  city: string
  lat?: number | null
  lng?: number | null
  website?: string | null
  phone: string
  mobile_phone?: string | null
  mobile_can_text?: boolean
  whatsapp?: string | null
  email?: string | null
  appointment_email?: string | null
  accepts_email_messages?: boolean
  new_clients_intro?: string | null
  service_delivery?: 'in_person' | 'online' | 'hybrid' | null
  new_clients_status?: 'accepting' | 'not_accepting' | 'waitlist' | null
  offers_intro_call?: boolean
  identity_traits?: Record<string, unknown> | null
  fee_individual?: number | null
  fee_couples?: number | null
  offers_sliding_scale?: boolean
  payment_methods?: string[]
  npi_number?: string | null
  liability_carrier?: string | null
  liability_expiration?: string | null
  specialties_note?: string | null
  client_participants?: string[]
  client_age_groups?: string[]
  faith_orientation?: string | null
  allied_communities?: string[]
  therapy_modalities?: string[]
  treatment_note?: string | null
  is_verified: boolean
  status: DoctorStatus
  status_note?: string | null
  categories?: number[]
  clinics: AdminDoctorClinicInput[]
}

export interface AdminDoctorResponseData {
  doctor: Doctor
  generated_password?: string | null
}

export type AdminDoctorResponse = {
  items: Doctor[]
  pagination: {
    page: number
    per_page: number
    total: number
  }
}
