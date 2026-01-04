export type DoctorStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export interface Clinic {
  id: number
  name?: string | null
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
  honorific_prefix?: string
  first_name?: string
  middle_name?: string
  last_name?: string
  credentials_suffix?: string
  preferred_pronouns?: string
  display_name_preference?: 'personal' | 'business'
  business_name?: string
  tagline?: string
  bio?: string
  about_paragraph_one?: string
  about_paragraph_two?: string
  about_paragraph_three?: string
  specialty: string[]
  sub_specialty?: string[]
  qualifications?: string[]
  additional_credentials?: string[]
  license_number?: string
  license_expiration?: string
  languages?: string[]
  gender?: string
  years_of_experience?: number
  professional_role?: string
  licensure_status?: 'licensed' | 'supervised' | 'unlicensed'
  insurances?: string[]
  identity_traits?: Record<string, unknown>
  payment_methods?: string[]
  fee_individual?: number
  fee_couples?: number
  offers_sliding_scale?: boolean
  service_delivery?: 'in_person' | 'online' | 'hybrid'
  new_clients_status?: 'accepting' | 'not_accepting' | 'waitlist'
  offers_intro_call?: boolean
  new_clients_intro?: string
  city?: string
  lat?: number
  lng?: number
  website?: string
  phone?: string
  mobile_phone?: string
  mobile_can_text?: boolean
  whatsapp?: string
  email?: string
  appointment_email?: string
  accepts_email_messages?: boolean
  npi_number?: string
  liability_carrier?: string
  liability_expiration?: string
  qualifications_note?: string
  education_institution?: string
  education_degree?: string
  education_graduation_year?: number
  practice_start_year?: number
  specialties_note?: string
  client_participants?: string[]
  client_age_groups?: string[]
  faith_orientation?: string
  allied_communities?: string[]
  therapy_modalities?: string[]
  treatment_note?: string
  is_verified: boolean
  status: DoctorStatus
  status_note?: string | null
  favorites_count?: number
  is_favorite?: boolean
  user?: DoctorUser | null
  clinics?: Clinic[]
  categories?: Category[]
  media?: {
    avatar?: MediaItem | null
    documents: MediaItem[]
    gallery: MediaItem[]
    intro_video?: MediaItem | null
  }
  created_at?: string
  updated_at?: string
}
