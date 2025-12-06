import { useEffect, useMemo, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { FieldErrors } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Select } from '@/components/ui/Select'
import { LocationPicker } from '@/components/common/LocationPicker'
import { useDoctorProfileQuery, useSaveDoctorProfile, useDoctorMediaUpload, useDoctorMediaDelete } from '@/features/doctor/hooks'
import { useCategoriesQuery } from '@/features/categories/hooks'
import type { ApiResponse } from '@/types/api'
import type { Category } from '@/types/doctor'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { FolderKanban, GraduationCap, HeartPulse, ShieldCheck, Star, UserRound, Wallet, X, type LucideIcon } from 'lucide-react'
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/lib/queryKeys'
import type { User } from '@/types/user'
import { therapyModalityLabels } from '@/data/therapyModalities'
import { therapySpecialties } from '@/data/therapySpecialties'
import { professionalRoles } from '@/data/professionalRoles'

const sectionOrder = ['about', 'finances', 'qualifications', 'specialties', 'clientFocus', 'treatment'] as const
type SectionId = (typeof sectionOrder)[number]

const RequiredAsterisk = () => <span className="text-rose-500" aria-hidden="true">*</span>

const calculateScore = (flags: boolean[]) => {
  if (flags.length === 0) return 0
  const completed = flags.filter(Boolean).length
  return completed / flags.length
}

const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
type DayKey = (typeof weekDays)[number]

type ClinicWorkHoursState = Record<DayKey, { from: string; to: string; enabled: boolean }>

const createWorkHoursState = (existing?: Record<string, string[] | undefined>): ClinicWorkHoursState =>
  weekDays.reduce((acc, day) => {
    const [from, to] = existing?.[day] ?? []
    acc[day] = {
      from: from ?? '09:00',
      to: to ?? '17:00',
      enabled: Boolean(existing?.[day]),
    }
    return acc
  }, {} as ClinicWorkHoursState)

const serializeWorkHours = (state?: ClinicWorkHoursState) => {
  if (!state) return undefined
  const payload: Record<string, string[]> = {}
  weekDays.forEach((day) => {
    const entry = state[day]
    if (entry?.enabled && entry.from && entry.to) {
      payload[day] = [entry.from, entry.to]
    }
  })
  return Object.keys(payload).length ? payload : undefined
}

const languageChoices = ['ar', 'en'] as const
type LanguageCode = (typeof languageChoices)[number]
const isLanguageCode = (value: string): value is LanguageCode =>
  languageChoices.includes(value as LanguageCode)


const buildSchema = (t: TFunction) =>
  z.object({
    full_name: z.string().min(3, t('doctorForm.validation.nameTooShort')),
    honorific_prefix: z.string().optional(),
    first_name: z.string().optional(),
    middle_name: z.string().optional(),
    last_name: z.string().optional(),
    credentials_suffix: z.string().optional(),
    preferred_pronouns: z.string().optional(),
    display_name_preference: z.enum(['personal', 'business']),
    business_name: z.string().optional(),
    tagline: z.string().max(160, t('doctorForm.validation.required')).optional(),
    bio: z.string().optional(),
    about_paragraph_one: z.string().max(640, t('doctorForm.validation.required')).optional(),
    about_paragraph_two: z.string().max(360, t('doctorForm.validation.required')).optional(),
    about_paragraph_three: z.string().optional(),
    specialty: z.string().min(3, t('doctorForm.validation.specialtyRequired')),
    sub_specialty: z.string().optional(),
    license_number: z.string().min(2, t('doctorForm.validation.licenseRequired')),
    license_state: z.string().optional(),
    license_expiration: z.string().optional(),
    qualifications_text: z.string().optional(),
    languages: z.string().min(2, t('doctorForm.validation.languageRequired')),
    gender: z.enum(['male', 'female']),
    years_of_experience: z.string().min(1, t('doctorForm.validation.yearsRequired')),
    phone: z.string().min(6, t('doctorForm.validation.phoneRequired')),
    mobile_phone: z.string().optional(),
    mobile_can_text: z.boolean(),
    whatsapp: z.string().optional(),
    city: z.string().min(2, t('doctorForm.validation.cityRequired')),
    website: z.string().optional(),
    email: z.string().optional(),
    appointment_email: z.string().optional(),
    accepts_email_messages: z.boolean(),
    service_delivery: z.enum(['in_person', 'online', 'hybrid']).optional(),
    new_clients_status: z.enum(['accepting', 'not_accepting', 'waitlist']).optional(),
    new_clients_intro: z.string().max(160, t('doctorForm.validation.required')).optional(),
    offers_intro_call: z.boolean(),
    professional_role: z.string().optional(),
    licensure_status: z.enum(['licensed', 'supervised', 'unlicensed']).optional(),
    qualifications_note: z.string().optional(),
    education_institution: z.string().optional(),
    education_degree: z.string().optional(),
    education_graduation_year: z.string().optional(),
    practice_start_year: z.string().optional(),
    fee_individual: z.string().optional(),
    fee_couples: z.string().optional(),
    offers_sliding_scale: z.boolean(),
    npi_number: z.string().optional(),
    liability_carrier: z.string().optional(),
    liability_expiration: z.string().optional(),
    specialties_note: z.string().optional(),
    treatment_note: z.string().optional(),
    insurances_text: z.string().optional(),
    identity_birth_year: z.string().optional(),
    identity_religion: z.string().optional(),
    identity_other: z.string().optional(),
  })

type FormValues = z.infer<ReturnType<typeof buildSchema>>

const findFirstErrorField = (errors: FieldErrors<FormValues>, parentPath = ''): string | null => {
  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue
    const path = parentPath ? `${parentPath}.${key}` : key
    if ('type' in value) {
      return path
    }
    if (typeof value === 'object') {
      const nested = findFirstErrorField(value as FieldErrors<FormValues>, path)
      if (nested) return nested
    }
  }
  return null
}

interface ClinicForm {
  id?: number
  address: string
  city: string
  lat?: number
  lng?: number
  work_hours?: ClinicWorkHoursState
}

const flattenCategories = (tree: Category[] = [], depth = 0): Array<Category & { depth: number }> => {
  return tree.flatMap((category) => [
    { ...category, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ])
}

const safeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

const createBlankClinic = (): ClinicForm => ({
  address: '',
  city: '',
  work_hours: createWorkHoursState(),
})

type MediaCollection = 'avatar' | 'intro_video' | 'documents' | 'gallery'
type PendingMediaFile = { file: File; preview?: string }

export const DoctorProfileFormPage = () => {
  const { data: doctor, isLoading } = useDoctorProfileQuery()
  const categoriesQuery = useCategoriesQuery()
  const saveProfile = useSaveDoctorProfile()
  const mediaUpload = useDoctorMediaUpload()
  const mediaDelete = useDoctorMediaDelete()
  const { t, i18n } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const [clinics, setClinics] = useState<ClinicForm[]>([createBlankClinic()])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [clientParticipants, setClientParticipants] = useState<string[]>([])
  const [clientAgeGroups, setClientAgeGroups] = useState<string[]>([])
  const [alliedCommunities, setAlliedCommunities] = useState<string[]>([])
  const [therapyModalities, setTherapyModalities] = useState<string[]>([])
  const [faithOrientation, setFaithOrientation] = useState<string>('any')
  const [genderIdentities, setGenderIdentities] = useState<string[]>([])
  const [ethnicities, setEthnicities] = useState<string[]>([])
  const [lgbtqIdentities, setLgbtqIdentities] = useState<string[]>([])
  const [additionalCredentials, setAdditionalCredentials] = useState<string[]>([''])
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageCode[]>(['ar'])
  const [pendingAvatarFile, setPendingAvatarFile] = useState<PendingMediaFile | null>(null)
  const [pendingIntroVideoFile, setPendingIntroVideoFile] = useState<PendingMediaFile | null>(null)
  const [pendingDocumentFiles, setPendingDocumentFiles] = useState<PendingMediaFile[]>([])
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<PendingMediaFile[]>([])
  const pendingAvatarRef = useRef<PendingMediaFile | null>(null)
  const pendingIntroVideoRef = useRef<PendingMediaFile | null>(null)
  const pendingDocumentRef = useRef<PendingMediaFile[]>([])
  const pendingGalleryRef = useRef<PendingMediaFile[]>([])
  const [mediaErrors, setMediaErrors] = useState<Record<MediaCollection, string | null>>({
    avatar: null,
    intro_video: null,
    documents: null,
    gallery: null,
  })
  const [isMediaUploading, setMediaUploading] = useState(false)
  const pronounOptions = useMemo(() => ['she', 'he', 'they'], [])
  const serviceDeliveryOptions = useMemo(() => ['in_person', 'online', 'hybrid'] as const, [])
  const newClientsStatusOptions = useMemo(() => ['accepting', 'waitlist', 'not_accepting'] as const, [])
  const paymentMethodOptions = useMemo(
    () => ['ACH', 'Check', 'Cash', 'Apple Cash', 'Amex', 'Visa', 'Mastercard', 'Discover', 'Zelle', 'Venmo', 'PayPal', 'HSA'],
    [],
  )
  const participantOptions = useMemo(() => ['individuals', 'couples', 'groups'], [])
  const ageGroupOptions = useMemo(() => ['kids', 'teens', 'adults'], [])
  const alliedCommunityOptions = useMemo(
    () => ['lgbtq', 'hard_of_hearing', 'racial_justice', 'veterans', 'disabilities', 'trauma_survivors'],
    [],
  )
  const therapyModalityOptions = useMemo(() => therapyModalityLabels, [])
  const therapySpecialtyOptions = useMemo(
    () =>
      therapySpecialties.map((option) => ({
        id: option.id,
        value: option.ar,
        label: i18n.language.startsWith('ar') ? option.ar : option.en,
      })),
    [i18n.language],
  )
  const professionalRoleOptions = useMemo(
    () =>
      professionalRoles.map((option) => ({
        id: option.id,
        value: option.ar,
        label: i18n.language.startsWith('ar') ? option.ar : option.en,
      })),
    [i18n.language],
  )
  const faithOrientationOptions = useMemo(
    () => ['any', 'islamic', 'christian', 'jewish', 'spiritual'],
    [],
  )
  const identityGenderOptions = useMemo(() => ['female', 'male', 'nonbinary', 'trans'], [])
  const identityEthnicityOptions = useMemo(() => ['arab', 'white', 'black', 'asian', 'latino', 'mixed'], [])
  const identityLgbtqOptions = useMemo(() => ['lgbtq', 'ally', 'questioning'], [])
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)
  const lastHydratedDoctorId = useRef<number | null>(null)
  const isSaving = saveProfile.isPending || isMediaUploading
  const revokePreview = (item?: PendingMediaFile | null) => {
    if (item?.preview) {
      URL.revokeObjectURL(item.preview)
    }
  }

  const createPendingMedia = (file: File): PendingMediaFile => ({
    file,
    preview: file.type.startsWith('image/') || file.type.startsWith('video/') ? URL.createObjectURL(file) : undefined,
  })

  const resetMediaError = (collection: MediaCollection) =>
    setMediaErrors((prev) => ({ ...prev, [collection]: null }))

  const isUnsupportedImage = (file: File) => file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')
  useEffect(() => {
    pendingAvatarRef.current = pendingAvatarFile
  }, [pendingAvatarFile])
  useEffect(() => {
    pendingIntroVideoRef.current = pendingIntroVideoFile
  }, [pendingIntroVideoFile])
  useEffect(() => {
    pendingDocumentRef.current = pendingDocumentFiles
  }, [pendingDocumentFiles])
  useEffect(() => {
    pendingGalleryRef.current = pendingGalleryFiles
  }, [pendingGalleryFiles])
  useEffect(() => {
    return () => {
      revokePreview(pendingAvatarRef.current)
      revokePreview(pendingIntroVideoRef.current)
      pendingDocumentRef.current.forEach((item) => revokePreview(item))
      pendingGalleryRef.current.forEach((item) => revokePreview(item))
    }
  }, [])

  const flattenedCategories = useMemo(
    () => flattenCategories(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    shouldUnregister: false,
    defaultValues: {
      gender: 'male',
      display_name_preference: 'personal',
      licensure_status: 'licensed',
      service_delivery: 'hybrid',
      new_clients_status: 'accepting',
      offers_intro_call: false,
      mobile_can_text: false,
      accepts_email_messages: true,
      offers_sliding_scale: false,
      languages: '',
      years_of_experience: '',
      qualifications_text: '',
      insurances_text: '',
    },
  })

  useEffect(() => {
    setValue('languages', selectedLanguages.join(', '), { shouldValidate: true })
  }, [selectedLanguages, setValue])

  const displayPreference = watch('display_name_preference')
  const watchedValues = useWatch({ control })
  const selectClasses = (hasError?: boolean) =>
    cn(
      'w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary-400 focus:ring-primary-100',
      hasError && 'border-red-400 focus:border-red-400 focus:ring-red-100',
    )

  useEffect(() => {
    if (!doctor) return
    if (doctor.id === lastHydratedDoctorId.current) return
    lastHydratedDoctorId.current = doctor.id

    reset({
      full_name: doctor.full_name ?? '',
      honorific_prefix: doctor.honorific_prefix ?? '',
      first_name: doctor.first_name ?? '',
      middle_name: doctor.middle_name ?? '',
      last_name: doctor.last_name ?? '',
      credentials_suffix: doctor.credentials_suffix ?? '',
      preferred_pronouns: doctor.preferred_pronouns ?? '',
      display_name_preference: (doctor.display_name_preference as 'personal' | 'business') ?? 'personal',
      business_name: doctor.business_name ?? '',
      tagline: doctor.tagline ?? '',
      bio: doctor.bio ?? '',
      about_paragraph_one: doctor.about_paragraph_one ?? '',
      about_paragraph_two: doctor.about_paragraph_two ?? '',
      about_paragraph_three: doctor.about_paragraph_three ?? '',
      specialty: doctor.specialty ?? '',
      sub_specialty: doctor.sub_specialty ?? '',
      license_number: doctor.license_number ?? '',
      license_state: doctor.license_state ?? '',
      license_expiration: doctor.license_expiration ?? '',
      qualifications_text: doctor.qualifications?.join('\n') ?? '',
      languages: doctor.languages?.join(', ') ?? '',
      gender: (doctor.gender as 'male' | 'female') ?? 'male',
      years_of_experience: doctor.years_of_experience?.toString() ?? '',
      phone: doctor.phone ?? '',
      mobile_phone: doctor.mobile_phone ?? '',
      mobile_can_text: doctor.mobile_can_text ?? false,
      whatsapp: doctor.whatsapp ?? '',
      city: doctor.city ?? '',
      website: doctor.website ?? '',
      email: doctor.email ?? '',
      appointment_email: doctor.appointment_email ?? '',
      accepts_email_messages: doctor.accepts_email_messages ?? true,
      service_delivery: (doctor.service_delivery as FormValues['service_delivery']) ?? 'hybrid',
      new_clients_status: (doctor.new_clients_status as FormValues['new_clients_status']) ?? 'accepting',
      new_clients_intro: doctor.new_clients_intro ?? '',
      offers_intro_call: doctor.offers_intro_call ?? false,
      professional_role: doctor.professional_role ?? '',
      licensure_status: (doctor.licensure_status as FormValues['licensure_status']) ?? 'licensed',
      qualifications_note: doctor.qualifications_note ?? '',
      education_institution: doctor.education_institution ?? '',
      education_degree: doctor.education_degree ?? '',
      education_graduation_year: doctor.education_graduation_year?.toString() ?? '',
      practice_start_year: doctor.practice_start_year?.toString() ?? '',
      fee_individual: doctor.fee_individual?.toString() ?? '',
      fee_couples: doctor.fee_couples?.toString() ?? '',
      offers_sliding_scale: doctor.offers_sliding_scale ?? false,
      npi_number: doctor.npi_number ?? '',
      liability_carrier: doctor.liability_carrier ?? '',
      liability_expiration: doctor.liability_expiration ?? '',
      specialties_note: doctor.specialties_note ?? '',
      treatment_note: doctor.treatment_note ?? '',
      insurances_text: doctor.insurances?.join('\n') ?? '',
      identity_birth_year:
        doctor.identity_traits && typeof doctor.identity_traits?.birth_year !== 'undefined'
          ? String(doctor.identity_traits?.birth_year as string | number)
          : '',
      identity_religion: (doctor.identity_traits?.religion as string) ?? '',
      identity_other: (doctor.identity_traits?.other as string) ?? '',
    })

    setClinics(
      doctor.clinics?.map((clinic) => ({
        id: clinic.id,
        address: clinic.address,
        city: clinic.city,
        lat: clinic.lat ?? undefined,
        lng: clinic.lng ?? undefined,
        work_hours: createWorkHoursState(clinic.work_hours ?? undefined),
      })) ?? [createBlankClinic()],
    )
    setSelectedCategories(doctor.categories?.map((category) => category.id) ?? [])
    setPaymentMethods(doctor.payment_methods ?? [])
    setClientParticipants(doctor.client_participants ?? [])
    setClientAgeGroups(doctor.client_age_groups ?? [])
    setAlliedCommunities(doctor.allied_communities ?? [])
    setTherapyModalities(doctor.therapy_modalities ?? [])
    setFaithOrientation(doctor.faith_orientation ?? 'any')
    setGenderIdentities(safeStringArray(doctor.identity_traits?.gender_identity))
    setEthnicities(safeStringArray(doctor.identity_traits?.ethnicity))
    setLgbtqIdentities(safeStringArray(doctor.identity_traits?.lgbtqia))
    setAdditionalCredentials(
      doctor.additional_credentials && doctor.additional_credentials.length > 0
        ? doctor.additional_credentials
        : [''],
    )
    const normalizedLanguages = (doctor.languages ?? []).filter(isLanguageCode)
    setSelectedLanguages(normalizedLanguages.length > 0 ? [...new Set(normalizedLanguages)] : ['ar'])
  }, [doctor, reset])

  const handleFormErrors = (formErrors: FieldErrors<FormValues>) => {
    const firstField = findFirstErrorField(formErrors)
    if (firstField) {
      const element = document.querySelector(`[name="${firstField}"]`) as HTMLElement | null
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        if ('focus' in element && typeof element.focus === 'function') {
          element.focus({ preventScroll: true })
        }
      }
    }
    toast.error(t('doctorForm.toasts.formError'))
  }

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiResponse<unknown> | undefined
      const fieldErrors = data?.errors
      if (fieldErrors) {
        return Object.values(fieldErrors)
          .flat()
          .join('\n')
      }
      if (data?.message) return data.message
    }
    return fallback
  }

  const normalizeTextList = (text?: string | null) => {
    return text
      ?.split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  const onSubmit = async (values: FormValues) => {
    const {
      qualifications_text,
      insurances_text,
      identity_birth_year,
      identity_religion,
      identity_other,
      ...baseValues
    } = values

    const languagesList = selectedLanguages

    if (languagesList.length === 0) {
      toast.error(t('doctorForm.validation.languageRequired'))
      return
    }

    const cleanedClinics = clinics
      .map((clinic) => ({
        id: clinic.id,
        address: clinic.address.trim(),
        city: clinic.city.trim(),
        lat: clinic.lat ?? null,
        lng: clinic.lng ?? null,
        work_hours: serializeWorkHours(clinic.work_hours),
      }))
      .filter((clinic) => clinic.address !== '' && clinic.city !== '')

    if (cleanedClinics.length === 0) {
      toast.error(t('doctorForm.validation.clinicRequired'))
      return
    }

    const identityPayload = {
      birth_year: identity_birth_year ? Number(identity_birth_year) : undefined,
      gender_identity: genderIdentities,
      ethnicity: ethnicities,
      religion: identity_religion?.trim() || undefined,
      lgbtqia: lgbtqIdentities,
      other: identity_other?.trim() || undefined,
    }

    const sanitizedIdentity = Object.fromEntries(
      Object.entries(identityPayload).filter(([, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0
        }
        return value !== undefined && value !== ''
      }),
    )

    const payload = {
      ...baseValues,
      qualifications: normalizeTextList(qualifications_text) ?? [],
      additional_credentials: additionalCredentials.map((cred) => cred.trim()).filter((cred) => cred.length > 0),
      insurances: normalizeTextList(insurances_text) ?? [],
      languages: languagesList,
      years_of_experience: Number(baseValues.years_of_experience),
      fee_individual: baseValues.fee_individual ? Number(baseValues.fee_individual) : null,
      fee_couples: baseValues.fee_couples ? Number(baseValues.fee_couples) : null,
      education_graduation_year: baseValues.education_graduation_year
        ? Number(baseValues.education_graduation_year)
        : null,
      practice_start_year: baseValues.practice_start_year ? Number(baseValues.practice_start_year) : null,
      categories: selectedCategories,
      clinics: cleanedClinics,
      payment_methods: paymentMethods,
      client_participants: clientParticipants,
      client_age_groups: clientAgeGroups,
      allied_communities: alliedCommunities,
      therapy_modalities: therapyModalities,
      identity_traits: Object.keys(sanitizedIdentity).length ? sanitizedIdentity : null,
      faith_orientation: faithOrientation !== 'any' ? faithOrientation : null,
    }

    try {
      const savedDoctor = await saveProfile.mutateAsync(payload)
      toast.success(t('doctorForm.toasts.saveSuccess'))
      setActiveSection(null)
      queryClient.setQueryData<User | null>(queryKeys.auth, (prev) =>
        prev ? { ...prev, doctor_profile: savedDoctor } : prev,
      )
    } catch (error) {
      toast.error(getErrorMessage(error, t('doctorForm.toasts.saveError')))
    }
  }

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleWithLimit = (value: string, setter: Dispatch<SetStateAction<string[]>>, limit?: number) => {
    setter((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value)
      }
      if (limit && prev.length >= limit) {
        toast.warning(t('doctorForm.validation.selectionLimit', { count: limit }))
        return prev
      }
      return [...prev, value]
    })
  }

  const toggleLanguage = (lang: LanguageCode) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(lang)) {
        if (prev.length === 1) {
          toast.warning(t('doctorForm.contact.languageMin'))
          return prev
        }
        return prev.filter((item) => item !== lang)
      }
      return [...prev, lang]
    })
  }

  const handleClinicChange = (index: number, field: keyof ClinicForm, value: string) => {
    setClinics((prev) =>
      prev.map((clinic, idx) => (idx === index ? { ...clinic, [field]: value } : clinic)),
    )
  }

  const handleClinicLocationChange = (index: number, payload: Partial<ClinicForm>) => {
    setClinics((prev) =>
      prev.map((clinic, idx) =>
        idx === index
          ? {
              ...clinic,
              ...payload,
            }
          : clinic,
      ),
    )
  }

  const addClinic = () => {
    setClinics((prev) => [...prev, createBlankClinic()])
  }

  const removeClinic = (index: number) => {
    if (!window.confirm(t('doctorForm.clinics.removeConfirm'))) return
    setClinics((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleWorkHoursToggle = (clinicIndex: number, day: DayKey, enabled: boolean) => {
    setClinics((prev) =>
      prev.map((clinic, idx) => {
        if (idx !== clinicIndex) return clinic
        const workHours = clinic.work_hours ?? createWorkHoursState()
        return {
          ...clinic,
          work_hours: {
            ...workHours,
            [day]: {
              ...workHours[day],
              enabled,
            },
          },
        }
      }),
    )
  }

  const handleWorkHoursTimeChange = (clinicIndex: number, day: DayKey, field: 'from' | 'to', value: string) => {
    setClinics((prev) =>
      prev.map((clinic, idx) => {
        if (idx !== clinicIndex) return clinic
        const workHours = clinic.work_hours ?? createWorkHoursState()
        return {
          ...clinic,
          work_hours: {
            ...workHours,
            [day]: {
              ...workHours[day],
              [field]: value,
            },
          },
        }
      }),
    )
  }

  const handleAvatarSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (isUnsupportedImage(file)) {
      toast.error(t('doctorForm.media.webpUnsupported'))
      event.target.value = ''
      return
    }
    const pending = createPendingMedia(file)
    setPendingAvatarFile((prev) => {
      revokePreview(prev)
      return pending
    })
    resetMediaError('avatar')
    event.target.value = ''
  }

  const removePendingAvatarFile = () => {
    setPendingAvatarFile((prev) => {
      revokePreview(prev)
      return null
    })
  }

  const handleIntroVideoSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const pending = createPendingMedia(file)
    setPendingIntroVideoFile((prev) => {
      revokePreview(prev)
      return pending
    })
    resetMediaError('intro_video')
    event.target.value = ''
  }

  const removePendingIntroVideoFile = () => {
    setPendingIntroVideoFile((prev) => {
      revokePreview(prev)
      return null
    })
  }

  const handleDocumentSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (isUnsupportedImage(file)) {
      toast.error(t('doctorForm.media.webpUnsupported'))
      event.target.value = ''
      return
    }
    setPendingDocumentFiles([createPendingMedia(file)])
    resetMediaError('documents')
    event.target.value = ''
  }

  const removePendingDocumentFile = (index: number) => {
    setPendingDocumentFiles((prev) => {
      const target = prev[index]
      revokePreview(target)
      return prev.filter((_, idx) => idx !== index)
    })
  }

  const handleGallerySelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return
    const files = Array.from(event.target.files).reduce<PendingMediaFile[]>((acc, file) => {
      if (isUnsupportedImage(file) && file.type.startsWith('image/')) {
        toast.error(t('doctorForm.media.webpUnsupported'))
        return acc
      }
      acc.push(createPendingMedia(file))
      return acc
    }, [])
    if (files.length === 0) {
      event.target.value = ''
      return
    }
    setPendingGalleryFiles((prev) => [...prev, ...files])
    resetMediaError('gallery')
    event.target.value = ''
  }

  const removePendingGalleryFile = (index: number) => {
    setPendingGalleryFiles((prev) => {
      const target = prev[index]
      revokePreview(target)
      return prev.filter((_, idx) => idx !== index)
    })
  }

  const clearPendingCollection = (collection: MediaCollection) => {
    setMediaErrors((prev) => ({ ...prev, [collection]: null }))
    switch (collection) {
      case 'avatar':
        setPendingAvatarFile((prev) => {
          revokePreview(prev)
          return null
        })
        break
      case 'intro_video':
        setPendingIntroVideoFile((prev) => {
          revokePreview(prev)
          return null
        })
        break
      case 'documents':
        setPendingDocumentFiles((prev) => {
          prev.forEach((item) => revokePreview(item))
          return []
        })
        break
      case 'gallery':
        setPendingGalleryFiles((prev) => {
          prev.forEach((item) => revokePreview(item))
          return []
        })
        break
      default:
        break
    }
  }

  const uploadPendingMedia = async () => {
    const payloads: Array<{ collection: MediaCollection; files: File[] }> = []
    if (pendingAvatarFile) payloads.push({ collection: 'avatar', files: [pendingAvatarFile.file] })
    if (pendingIntroVideoFile) payloads.push({ collection: 'intro_video', files: [pendingIntroVideoFile.file] })
    if (pendingDocumentFiles.length > 0)
      payloads.push({ collection: 'documents', files: pendingDocumentFiles.map((item) => item.file) })
    if (pendingGalleryFiles.length > 0)
      payloads.push({ collection: 'gallery', files: pendingGalleryFiles.map((item) => item.file) })

    if (payloads.length === 0) return true
    setMediaUploading(true)
    let currentCollection: MediaCollection | null = null
    try {
      for (const payload of payloads) {
        currentCollection = payload.collection
        const formData = new FormData()
        formData.append('collection', payload.collection)
        payload.files.forEach((file) => formData.append('files[]', file))
        await mediaUpload.mutateAsync(formData)
        clearPendingCollection(payload.collection)
      }
      return true
    } catch (error) {
      const message = getErrorMessage(error, t('doctorForm.toasts.uploadError'))
      if (currentCollection) {
        const failedCollection: MediaCollection = currentCollection
        setMediaErrors((prev) => ({ ...prev, [failedCollection]: message }))
      }
      toast.error(message)
      return false
    } finally {
      setMediaUploading(false)
    }
  }

  const handleMediaDelete = (mediaId: number) => {
    mediaDelete.mutate(mediaId, {
      onSuccess: () => toast.success(t('doctorForm.toasts.deleteSuccess')),
    })
  }

  if (isLoading) {
    return <div className="text-slate-500">{t('doctorForm.loading')}</div>
  }

  const languagesCount = selectedLanguages.length
  const hasParagraph =
    Boolean(
      watchedValues.bio?.trim() ||
        watchedValues.about_paragraph_one?.trim() ||
        watchedValues.about_paragraph_two?.trim() ||
        watchedValues.about_paragraph_three?.trim(),
    )
  const hasClinics = clinics.some(
    (clinic) => clinic.address.trim().length > 0 && clinic.city.trim().length > 0,
  )
  const aboutScore = calculateScore([
    Boolean(watchedValues.full_name?.trim()),
    Boolean(watchedValues.specialty?.trim()),
    Boolean(watchedValues.phone?.trim()),
    Boolean(watchedValues.city?.trim()),
    languagesCount > 0,
    hasParagraph,
    hasClinics,
  ])
  const financesScore = calculateScore([
    paymentMethods.length > 0,
    Boolean(watchedValues.fee_individual?.trim()),
    Boolean(watchedValues.insurances_text?.trim()),
  ])
  const qualificationsScore = calculateScore([
    Boolean(watchedValues.qualifications_text?.trim()),
    Boolean(watchedValues.education_institution?.trim()),
  ])
  const specialtiesScore = selectedCategories.length > 0 ? 1 : 0
  const clientFocusScore = calculateScore([
    clientParticipants.length > 0,
    clientAgeGroups.length > 0,
    alliedCommunities.length > 0,
  ])
  const treatmentScore = calculateScore([
    therapyModalities.length > 0,
    Boolean(watchedValues.treatment_note?.trim()),
  ])

  const sectionScores: Record<SectionId, number> = {
    about: aboutScore,
    finances: financesScore,
    qualifications: qualificationsScore,
    specialties: specialtiesScore,
    clientFocus: clientFocusScore,
    treatment: treatmentScore,
  }

  const sectionCompletion = Object.entries(sectionScores).reduce(
    (acc, [key, value]) => {
      acc[key as SectionId] = value >= 1
      return acc
    },
    {} as Record<SectionId, boolean>,
  )
  const sectionProgress = sectionOrder.reduce(
    (acc, section) => {
      acc[section] = Math.round((sectionScores[section] || 0) * 100)
      return acc
    },
    {} as Record<SectionId, number>,
  )

  const completionValues = Object.values(sectionScores)
  const completedSections = Object.values(sectionCompletion).filter(Boolean).length
  const completionPercentage =
    Math.round(
      (completionValues.reduce((sum, value) => sum + value, 0) / Math.max(completionValues.length, 1)) * 100,
    ) || 0

  const summaryFallback = t('doctorForm.summary.empty')
  const sectionSummaries: Record<SectionId, string> = {
    about: watchedValues.full_name?.trim() || summaryFallback,
    finances: watchedValues.fee_individual?.trim()
      ? `${watchedValues.fee_individual} ${t('common.currency')}`
      : summaryFallback,
    qualifications:
      watchedValues.qualifications_text?.split('\n').filter(Boolean)[0]?.trim() || summaryFallback,
    specialties: selectedCategories.length
      ? t('doctorForm.specialties.categoriesTitle') + ': ' + selectedCategories.length
      : summaryFallback,
    clientFocus: clientParticipants.length
      ? clientParticipants
          .map((item) => t(`doctorForm.clientFocus.participantsOptions.${item}`))
          .join(t('common.comma'))
      : summaryFallback,
    treatment: therapyModalities.length ? therapyModalities.slice(0, 3).join(t('common.comma')) : summaryFallback,
  }

  const sectionIcons: Record<SectionId, LucideIcon> = {
    about: UserRound,
    finances: Wallet,
    qualifications: GraduationCap,
    specialties: Star,
    clientFocus: HeartPulse,
    treatment: FolderKanban,
  }

  const isNewDoctor = !doctor
  const isUnderReview = doctor?.status === 'pending'
  const isRejected = doctor?.status === 'rejected'
  const avatarMedia = doctor?.media?.avatar ?? null
  const introVideoMedia = doctor?.media?.intro_video ?? null
  const documentsMedia = doctor?.media?.documents ?? []
  const galleryMedia = doctor?.media?.gallery ?? []

  const renderSectionContent = (section: SectionId) => {
    switch (section) {
      case 'about':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">
                  {t('doctorForm.about.labels.fullPublicName')} <RequiredAsterisk />
                </label>
                <Input
                  {...register('full_name')}
                  placeholder={t('doctorForm.about.placeholders.fullPublicName')}
                  aria-invalid={!!errors.full_name}
                  aria-required="true"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.honorific')}</label>
                <Input {...register('honorific_prefix')} placeholder="Dr." aria-invalid={!!errors.honorific_prefix} />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.firstName')}</label>
                <Input
                  {...register('first_name')}
                  placeholder={t('doctorForm.about.placeholders.firstName')}
                  aria-invalid={!!errors.first_name}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.middleName')}</label>
                <Input
                  {...register('middle_name')}
                  placeholder={t('doctorForm.about.placeholders.middleName')}
                  aria-invalid={!!errors.middle_name}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.lastName')}</label>
                <Input
                  {...register('last_name')}
                  placeholder={t('doctorForm.about.placeholders.lastName')}
                  aria-invalid={!!errors.last_name}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.credentialSuffix')}</label>
                <Input
                  {...register('credentials_suffix')}
                  placeholder={t('doctorForm.about.placeholders.credentials')}
                  aria-invalid={!!errors.credentials_suffix}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.pronouns')}</label>
                <select {...register('preferred_pronouns')} className={selectClasses(!!errors.preferred_pronouns)}>
                  <option value="">{t('doctorForm.about.labels.pronounsPlaceholder')}</option>
                  {pronounOptions.map((option) => (
                    <option key={option} value={option}>
                      {t(`doctorForm.identity.pronouns.${option}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.displayName')}</label>
                <select
                  {...register('display_name_preference')}
                  className={selectClasses(!!errors.display_name_preference)}
                >
                  <option value="personal">{t('doctorForm.about.displayNameOptions.personal')}</option>
                  <option value="business">{t('doctorForm.about.displayNameOptions.business')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.businessName')}</label>
                <Input
                  {...register('business_name')}
                  disabled={displayPreference !== 'business'}
                  aria-invalid={!!errors.business_name}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.tagline')}</label>
                <Input
                  {...register('tagline')}
                  placeholder={t('doctorForm.about.placeholders.tagline')}
                  aria-invalid={!!errors.tagline}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">
                  {t('doctorForm.about.labels.primarySpecialty')} <RequiredAsterisk />
                </label>
                <Select
                  {...register('specialty', { required: t('doctorForm.validation.specialtyRequired') })}
                  aria-invalid={!!errors.specialty}
                >
                  <option value="">{t('doctorForm.about.placeholders.primarySpecialty')}</option>
                  {therapySpecialtyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {errors.specialty && <p className="text-xs text-rose-500">{errors.specialty.message}</p>}
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.secondarySpecialty')}</label>
                <Input
                  {...register('sub_specialty')}
                  placeholder={t('doctorForm.about.placeholders.secondarySpecialty')}
                  aria-invalid={!!errors.sub_specialty}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">
                  {t('doctorForm.about.labels.licenseNumber')} <RequiredAsterisk />
                </label>
                <Input {...register('license_number')} aria-invalid={!!errors.license_number} aria-required="true" />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.licenseState')}</label>
                <Input
                  {...register('license_state')}
                  placeholder={t('doctorForm.about.placeholders.licenseState')}
                  aria-invalid={!!errors.license_state}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.licenseExpiration')}</label>
                <Input type="date" {...register('license_expiration')} aria-invalid={!!errors.license_expiration} />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.professionalRole')}</label>
                <Select {...register('professional_role')} aria-invalid={!!errors.professional_role}>
                  <option value="">{t('doctorForm.about.placeholders.professionalRole')}</option>
                  {professionalRoleOptions.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.licensureStatus')}</label>
                <select {...register('licensure_status')} className={selectClasses(!!errors.licensure_status)}>
                  <option value="">{t('doctorForm.about.labels.licensureStatus')}</option>
                  <option value="licensed">{t('doctorForm.about.licensureOptions.licensed')}</option>
                  <option value="supervised">{t('doctorForm.about.licensureOptions.supervised')}</option>
                  <option value="unlicensed">{t('doctorForm.about.licensureOptions.unlicensed')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500">{t('doctorForm.about.labels.bio')}</label>
              <Textarea
                rows={4}
                {...register('bio')}
                placeholder={t('doctorForm.about.placeholders.bio')}
                aria-invalid={!!errors.bio}
              />
            </div>

            <div className="rounded-2xl border border-slate-100 p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">{t('doctorForm.about.labels.aboutHeading')}</h3>
                <p className="text-xs text-slate-500">{t('doctorForm.about.labels.aboutHint')}</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.paragraph1')}</label>
                <Textarea rows={3} {...register('about_paragraph_one')} aria-invalid={!!errors.about_paragraph_one} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.paragraph2')}</label>
                <Textarea rows={3} {...register('about_paragraph_two')} aria-invalid={!!errors.about_paragraph_two} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.paragraph3')}</label>
                <Textarea rows={3} {...register('about_paragraph_three')} aria-invalid={!!errors.about_paragraph_three} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-900">{t('doctorForm.media.headshotTitle')}</p>
                <p className="text-xs text-slate-500">{t('doctorForm.media.headshotHint')}</p>
                <div className="mt-3 space-y-2">
                  {pendingAvatarFile ? (
                    <div className="space-y-2">
                      <div className="relative">
                        {pendingAvatarFile.preview ? (
                          <img
                            src={pendingAvatarFile.preview}
                            alt={pendingAvatarFile.file.name}
                            className="h-48 w-full rounded-2xl object-cover"
                          />
                        ) : (
                          <p className="text-xs text-slate-500 truncate">{pendingAvatarFile.file.name}</p>
                        )}
                        <button
                          type="button"
                          className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-1 text-xs text-red-500"
                          onClick={removePendingAvatarFile}
                        >
                          {t('doctorForm.media.galleryPendingRemove')}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">{t('doctorForm.media.pendingUploadNote')}</p>
                    </div>
                  ) : avatarMedia ? (
                    <div className="relative">
                      <img src={avatarMedia.url} alt={avatarMedia.name} className="h-48 w-full rounded-2xl object-cover" />
                      <button
                        type="button"
                        className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-1 text-xs text-red-500"
                        onClick={() => handleMediaDelete(avatarMedia.id)}
                      >
                        {t('doctorForm.media.delete')}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">{t('doctorForm.media.noImage')}</p>
                  )}
                  <Input type="file" accept="image/*" onChange={handleAvatarSelection} disabled={isMediaUploading} />
                  {isMediaUploading && pendingAvatarFile && (
                    <p className="text-xs text-primary-600">{t('doctorForm.media.mediaUploading')}</p>
                  )}
                  {mediaErrors.avatar && (
                    <p className="text-xs text-rose-600">
                      {t('doctorForm.media.uploadErrorLabel')}: {mediaErrors.avatar}
                    </p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-900">{t('doctorForm.media.introVideoTitle')}</p>
                <p className="text-xs text-slate-500">{t('doctorForm.media.introVideoHint')}</p>
                <div className="mt-3 space-y-2">
                  {pendingIntroVideoFile ? (
                    <div className="space-y-2">
                      {pendingIntroVideoFile.preview ? (
                        <video controls className="w-full rounded-2xl" src={pendingIntroVideoFile.preview} />
                      ) : (
                        <p className="text-xs text-slate-500 truncate">{pendingIntroVideoFile.file.name}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{t('doctorForm.media.pendingUploadNote')}</span>
                        <button
                          type="button"
                          className="text-rose-600 hover:underline"
                          onClick={removePendingIntroVideoFile}
                        >
                          {t('doctorForm.media.galleryPendingRemove')}
                        </button>
                      </div>
                    </div>
                  ) : introVideoMedia ? (
                    <div className="space-y-2">
                      <video controls className="w-full rounded-2xl" src={introVideoMedia.url} />
                      <button
                        type="button"
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-red-500"
                        onClick={() => handleMediaDelete(introVideoMedia.id)}
                      >
                        {t('doctorForm.media.deleteVideo')}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">{t('doctorForm.media.noVideo')}</p>
                  )}
                  <Input
                    type="file"
                    accept="video/mp4,video/quicktime"
                    onChange={handleIntroVideoSelection}
                    disabled={isMediaUploading}
                  />
                  {isMediaUploading && pendingIntroVideoFile && (
                    <p className="text-xs text-primary-600">{t('doctorForm.media.mediaUploading')}</p>
                  )}
                  {mediaErrors.intro_video && (
                    <p className="text-xs text-rose-600">
                      {t('doctorForm.media.uploadErrorLabel')}: {mediaErrors.intro_video}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
              <div>
                <p className="font-semibold text-slate-900">{t('doctorForm.media.documentsTitle')}</p>
                <p className="text-xs text-slate-500">{t('doctorForm.media.documentsHint')}</p>
              </div>
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleDocumentSelection}
                disabled={isMediaUploading}
              />
            </div>
            {documentsMedia.length > 0 && (
              <div className="rounded-2xl border border-slate-100 p-4 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">{t('doctorForm.media.uploadedMediaTitle')}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {documentsMedia.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-primary-700 underline"
                      >
                        {document.name}
                      </a>
                      <button
                        type="button"
                        className="text-rose-600 hover:underline"
                        onClick={() => handleMediaDelete(document.id)}
                      >
                        {t('doctorForm.media.delete')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
              {pendingDocumentFiles.length > 0 && (
                <div className="rounded-2xl border border-slate-100 p-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700">{t('doctorForm.media.documentsPendingTitle')}</p>
                  <p className="text-[11px] text-slate-500">
                    {t('doctorForm.media.documentsPendingHint', { count: pendingDocumentFiles.length })}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {pendingDocumentFiles.map((item, index) => {
                      const fileExt = item.file.name.split('.').pop()?.toUpperCase()
                      const isImage = item.file.type.startsWith('image/')
                      return (
                        <div
                          key={`${item.file.name}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            {isImage && item.preview ? (
                              <img src={item.preview} alt={item.file.name} className="h-10 w-10 rounded-xl object-cover" />
                            ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-[11px] font-semibold text-slate-600">
                              {fileExt ?? 'FILE'}
                            </div>
                          )}
                          <span className="truncate text-slate-700">{item.file.name}</span>
                        </div>
                          <button
                            type="button"
                            className="text-rose-600 hover:underline"
                            onClick={() => removePendingDocumentFile(index)}
                          >
                            {t('doctorForm.media.galleryPendingRemove')}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">{t('doctorForm.media.pendingUploadNote')}</p>
                  {isMediaUploading && pendingDocumentFiles.length > 0 && (
                    <p className="mt-2 text-xs text-primary-600">{t('doctorForm.media.mediaUploading')}</p>
                  )}
                </div>
            )}
            {mediaErrors.documents && (
              <p className="text-xs text-rose-600">
                {t('doctorForm.media.uploadErrorLabel')}: {mediaErrors.documents}
              </p>
            )}

            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{t('doctorForm.media.galleryTitle')}</p>
                  <p className="text-xs text-slate-500">{t('doctorForm.media.galleryHint')}</p>
                </div>
                <Input type="file" multiple onChange={handleGallerySelection} disabled={isMediaUploading} />
              </div>
              {galleryMedia.length > 0 && (
                <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  {galleryMedia.map((media) => (
                    <div key={media.id} className="relative">
                      <img src={media.url} alt={media.name} className="h-24 w-full rounded-2xl object-cover" />
                      <button
                        type="button"
                        className="absolute right-2 top-2 rounded-full bg-white/80 px-2 py-1 text-[10px] text-rose-500"
                        onClick={() => handleMediaDelete(media.id)}
                      >
                        {t('doctorForm.media.delete')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {pendingGalleryFiles.length > 0 && (
                <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700">{t('doctorForm.media.galleryPendingTitle')}</p>
                  <p className="text-[11px] text-slate-500">
                    {t('doctorForm.media.galleryPendingHint', { count: pendingGalleryFiles.length })}
                  </p>
                  <div className="mt-2 grid gap-2 grid-cols-2 sm:grid-cols-3">
                    {pendingGalleryFiles.map((item, index) => {
                      const isImage = item.file.type.startsWith('image/')
                      const isVideo = item.file.type.startsWith('video/')
                      return (
                        <div
                          key={`${item.file.name}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-1"
                        >
                          <div className="flex items-center gap-2">
                            {item.preview && (isImage || isVideo) ? (
                              isImage ? (
                                <img src={item.preview} alt={item.file.name} className="h-10 w-10 rounded-xl object-cover" />
                              ) : (
                                <video src={item.preview} className="h-10 w-10 rounded-xl object-cover" muted loop />
                              )
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-[11px] font-semibold text-slate-600">
                                {item.file.name.split('.').pop()?.toUpperCase() ?? 'FILE'}
                              </div>
                            )}
                            <span className="truncate text-slate-700">{item.file.name}</span>
                          </div>
                          <button
                            type="button"
                            className="text-rose-600 hover:underline"
                            onClick={() => removePendingGalleryFile(index)}
                          >
                            {t('doctorForm.media.galleryPendingRemove')}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {isMediaUploading && pendingGalleryFiles.length > 0 && (
                <p className="mt-2 text-xs text-primary-600">{t('doctorForm.media.mediaUploading')}</p>
              )}
              {mediaErrors.gallery && (
                <p className="mt-2 text-xs text-rose-600">
                  {t('doctorForm.media.uploadErrorLabel')}: {mediaErrors.gallery}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900">{t('doctorForm.contact.title')}</h3>
              <p className="text-sm text-slate-500">{t('doctorForm.contact.description')}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">
                  {t('doctorForm.contact.mainPhone')} <RequiredAsterisk />
                </label>
                <Input
                  {...register('phone')}
                  placeholder="+966..."
                  aria-invalid={!!errors.phone}
                  aria-required="true"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.contact.mobilePhone')}</label>
                <Input
                  {...register('mobile_phone')}
                  placeholder={t('doctorForm.contact.mobileHint')}
                  aria-invalid={!!errors.mobile_phone}
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Checkbox {...register('mobile_can_text')} />
                <span className="text-xs text-slate-500">{t('doctorForm.contact.allowTexts')}</span>
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.contact.whatsapp')}</label>
                <Input
                  {...register('whatsapp')}
                  placeholder={t('doctorForm.contact.mobileHint')}
                  aria-invalid={!!errors.whatsapp}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.contact.primaryEmail')}</label>
                <Input {...register('email')} type="email" aria-invalid={!!errors.email} />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.contact.appointmentEmail')}</label>
                <Input {...register('appointment_email')} type="email" aria-invalid={!!errors.appointment_email} />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Checkbox {...register('accepts_email_messages')} defaultChecked />
                <span className="text-xs text-slate-500">{t('doctorForm.contact.allowEmail')}</span>
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.contact.website')}</label>
                <Input {...register('website')} placeholder="https://" aria-invalid={!!errors.website} />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.contact.quickIntro')}</label>
                <Input
                  {...register('new_clients_intro')}
                  placeholder={t('doctorForm.contact.quickIntro')}
                  aria-invalid={!!errors.new_clients_intro}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.contact.serviceDelivery')}</label>
                <select {...register('service_delivery')} className={selectClasses(!!errors.service_delivery)}>
                  <option value="">{t('doctorForm.contact.servicePlaceholder')}</option>
                  {serviceDeliveryOptions.map((option) => (
                    <option key={option} value={option}>
                      {t(`doctorForm.contact.serviceOptions.${option}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.contact.newClientsStatus')}</label>
                <select {...register('new_clients_status')} className={selectClasses(!!errors.new_clients_status)}>
                  <option value="">{t('doctorForm.contact.newClientsPlaceholder')}</option>
                  {newClientsStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {t(`doctorForm.contact.newClientOptions.${option}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Checkbox {...register('offers_intro_call')} />
                <span className="text-xs text-slate-500">{t('doctorForm.contact.offersIntroCall')}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">
                  {t('doctorForm.contact.baseCity')} <RequiredAsterisk />
                </label>
                <Input {...register('city')} aria-invalid={!!errors.city} aria-required="true" />
              </div>
              <div>
                <label className="text-xs text-slate-500">
                  {t('doctorForm.contact.languages')} <RequiredAsterisk />
                </label>
                <p className="text-xs text-slate-500">{t('doctorForm.contact.languageSelectHint')}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {languageChoices.map((lang) => {
                    const active = selectedLanguages.includes(lang)
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs transition',
                          active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                        )}
                        aria-pressed={active}
                      >
                        {t(`doctorForm.contact.languageOptions.${lang}`)}
                      </button>
                    )
                  })}
                </div>
                <input type="hidden" {...register('languages')} />
                {errors.languages && <p className="text-xs text-rose-500">{errors.languages.message}</p>}
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.contact.yearsExperience')}</label>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  {...register('years_of_experience')}
                  aria-invalid={!!errors.years_of_experience}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{t('doctorForm.clinics.title')}</h3>
                <Button type="button" variant="outline" onClick={addClinic}>
                  {t('doctorForm.clinics.add')}
                </Button>
              </div>
              {clinics.map((clinic, index) => (
                <div key={index} className="space-y-3 rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {t('doctorForm.clinics.city')} {index + 1}
                    </p>
                    {clinics.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-xs text-rose-600 hover:bg-rose-50"
                        onClick={() => removeClinic(index)}
                      >
                        {t('doctorForm.clinics.remove')}
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs text-slate-500">
                        {t('doctorForm.clinics.city')} <RequiredAsterisk />
                      </label>
                      <Input
                        value={clinic.city}
                        onChange={(e) => handleClinicChange(index, 'city', e.target.value)}
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">
                        {t('doctorForm.clinics.address')} <RequiredAsterisk />
                      </label>
                      <Input
                        value={clinic.address}
                        onChange={(e) => handleClinicChange(index, 'address', e.target.value)}
                        aria-required="true"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">{t('doctorForm.clinics.mapLabel')}</label>
                    <LocationPicker
                      value={{ lat: clinic.lat, lng: clinic.lng, address: clinic.address, city: clinic.city }}
                      onChange={(value) =>
                        handleClinicLocationChange(index, {
                          lat: value.lat,
                          lng: value.lng,
                          address: value.address ?? clinic.address,
                          city: value.city ?? clinic.city,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500">{t('doctorForm.clinics.hoursTitle')}</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {weekDays.map((day) => {
                        const hours = clinic.work_hours?.[day] ?? { from: '09:00', to: '17:00', enabled: false }
                        return (
                          <div key={day} className="space-y-1 rounded-2xl border border-dashed border-slate-200 p-3">
                            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                              <Checkbox
                                checked={hours.enabled}
                                onChange={(event) => handleWorkHoursToggle(index, day, event.target.checked)}
                              />
                              {t(`common.days.${day}`)}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="time"
                                value={hours.from}
                                disabled={!hours.enabled}
                                onChange={(event) => handleWorkHoursTimeChange(index, day, 'from', event.target.value)}
                                aria-label={t('doctorForm.clinics.hoursFrom')}
                              />
                              <Input
                                type="time"
                                value={hours.to}
                                disabled={!hours.enabled}
                                onChange={(event) => handleWorkHoursTimeChange(index, day, 'to', event.target.value)}
                                aria-label={t('doctorForm.clinics.hoursTo')}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      case 'finances':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.finances.individualFee')}</label>
                <Input
                  type="number"
                  min={0}
                  {...register('fee_individual')}
                  placeholder="0"
                  aria-invalid={!!errors.fee_individual}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.finances.coupleFee')}</label>
                <Input
                  type="number"
                  min={0}
                  {...register('fee_couples')}
                  placeholder="0"
                  aria-invalid={!!errors.fee_couples}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.finances.slidingScale')}</label>
                <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
                  <Checkbox {...register('offers_sliding_scale')} />
                  <span className="text-xs text-slate-500">
                    {watch('offers_sliding_scale')
                      ? t('doctorForm.finances.slidingYes')
                      : t('doctorForm.finances.slidingNo')}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs text-slate-500 mb-3">{t('doctorForm.finances.paymentMethods')}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {paymentMethodOptions.map((method) => (
                  <label key={method} className="flex items-center gap-2 text-sm text-slate-700">
                    <Checkbox
                      checked={paymentMethods.includes(method)}
                      onChange={() =>
                        setPaymentMethods((prev) =>
                          prev.includes(method) ? prev.filter((item) => item !== method) : [...prev, method],
                        )
                      }
                    />
                    {t(`doctorForm.finances.paymentChoices.${method}`)}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">{t('doctorForm.finances.insurances')}</label>
              <Textarea
                rows={3}
                {...register('insurances_text')}
                placeholder={t('doctorForm.finances.insurancesPlaceholder')}
                aria-invalid={!!errors.insurances_text}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.finances.npi')}</label>
                <Input {...register('npi_number')} aria-invalid={!!errors.npi_number} />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.finances.liabilityCarrier')}</label>
                <Input {...register('liability_carrier')} aria-invalid={!!errors.liability_carrier} />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.finances.liabilityExpiration')}</label>
                <Input type="date" {...register('liability_expiration')} aria-invalid={!!errors.liability_expiration} />
              </div>
            </div>
          </>
        )
      case 'qualifications':
        return (
          <>
            <div>
              <label className="text-xs text-slate-500">{t('doctorForm.qualifications.mainQualifications')}</label>
              <Textarea
                rows={3}
                {...register('qualifications_text')}
                placeholder={t('doctorForm.qualifications.placeholders.qualifications')}
                aria-invalid={!!errors.qualifications_text}
              />
            </div>
            <div className="rounded-2xl border border-slate-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">
                  {t('doctorForm.qualifications.additionalCredentials')}
                </p>
                {additionalCredentials.length < 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-3 py-1 text-xs"
                    onClick={() => setAdditionalCredentials((prev) => [...prev, ''])}
                  >
                    {t('doctorForm.qualifications.addCredential')}
                  </Button>
                )}
              </div>
              {additionalCredentials.map((cred, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={cred}
                    onChange={(event) =>
                      setAdditionalCredentials((prev) => prev.map((item, idx) => (idx === index ? event.target.value : item)))
                    }
                    placeholder={t('doctorForm.qualifications.placeholders.institution')}
                  />
                  {additionalCredentials.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-1 text-xs"
                  onClick={() =>
                    setAdditionalCredentials((prev) =>
                      prev.filter((_credential, idx) => idx !== index || prev.length === 1),
                    )
                  }
                >
                      {t('doctorForm.qualifications.removeCredential')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.qualifications.note')}</label>
                <Textarea rows={3} {...register('qualifications_note')} aria-invalid={!!errors.qualifications_note} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-500">{t('doctorForm.qualifications.lastInstitution')}</label>
                <Input
                  {...register('education_institution')}
                  placeholder={t('doctorForm.qualifications.placeholders.institution')}
                  aria-invalid={!!errors.education_institution}
                />
                <label className="text-xs text-slate-500">{t('doctorForm.qualifications.degreeType')}</label>
                <Input
                  {...register('education_degree')}
                  placeholder={t('doctorForm.qualifications.placeholders.degree')}
                  aria-invalid={!!errors.education_degree}
                />
                <label className="text-xs text-slate-500">{t('doctorForm.qualifications.graduationYear')}</label>
                <Input
                  type="number"
                  {...register('education_graduation_year')}
                  aria-invalid={!!errors.education_graduation_year}
                />
                <label className="text-xs text-slate-500">{t('doctorForm.qualifications.practiceStartYear')}</label>
                <Input
                  type="number"
                  {...register('practice_start_year')}
                  aria-invalid={!!errors.practice_start_year}
                />
              </div>
            </div>
          </>
        )
      case 'specialties':
        return (
          <>
            <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
              <div>
                <h4 className="font-semibold text-slate-900">{t('doctorForm.specialties.categoriesTitle')}</h4>
                <p className="text-xs text-slate-500">{t('doctorForm.specialties.categoriesHint')}</p>
              </div>
              {categoriesQuery.isLoading ? (
                <p className="text-sm text-slate-500">{t('doctorForm.specialties.loading')}</p>
              ) : flattenedCategories.length > 0 ? (
                <div className="max-h-[320px] space-y-2 overflow-y-auto pr-2">
                  {flattenedCategories.map((category) => (
                    <label key={category.id} className="flex items-center gap-3 text-sm text-slate-700">
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                      />
                      <span
                        className="flex flex-1 items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-1"
                        style={{ marginInlineStart: `${category.depth * 12}px` }}
                      >
                        <span>{category.name}</span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                            category.depth === 0 ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-600',
                          )}
                        >
                          {category.depth === 0
                            ? t('doctorForm.specialties.rootBadge')
                            : t('doctorForm.specialties.childBadge')}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">{t('doctorForm.specialties.empty')}</p>
              )}
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.specialties.noteLabel')}</label>
                <Textarea
                  rows={3}
                  {...register('specialties_note')}
                  placeholder={t('doctorForm.specialties.notePlaceholder')}
                  aria-invalid={!!errors.specialties_note}
                />
              </div>
            </div>
          </>
        )
      case 'clientFocus':
        return (
          <>
            <div className="rounded-2xl border border-slate-100 p-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500">{t('doctorForm.clientFocus.participants')}</p>
                <div className="flex flex-wrap gap-4">
                  {participantOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                      <Checkbox
                        checked={clientParticipants.includes(option)}
                        onChange={() => toggleWithLimit(option, setClientParticipants, 3)}
                      />
                      {t(`doctorForm.clientFocus.participantsOptions.${option}`)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('doctorForm.clientFocus.ageGroups')}</p>
                <div className="flex flex-wrap gap-4">
                  {ageGroupOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                      <Checkbox
                        checked={clientAgeGroups.includes(option)}
                        onChange={() =>
                          setClientAgeGroups((prev) =>
                            prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
                          )
                        }
                      />
                      {t(`doctorForm.clientFocus.ageOptions.${option}`)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('doctorForm.clientFocus.faith')}</p>
                <div className="flex flex-wrap gap-2">
                  {faithOrientationOptions.map((option) => {
                    const isActive = faithOrientation === option
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFaithOrientation(option)}
                        className={cn(
                          'rounded-2xl border px-4 py-2 text-sm transition',
                          isActive
                            ? 'border-primary-200 bg-primary-50 text-primary-700 shadow-card'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300',
                        )}
                        aria-pressed={isActive}
                      >
                        {t(`doctorForm.clientFocus.faithOptions.${option}`)}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('doctorForm.clientFocus.allied')}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {alliedCommunityOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                      <Checkbox
                        checked={alliedCommunities.includes(option)}
                        onChange={() =>
                          setAlliedCommunities((prev) =>
                            prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
                          )
                        }
                      />
                      {t(`doctorForm.clientFocus.alliedOptions.${option}`)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{t('doctorForm.identity.title')}</h3>
              <p className="text-sm text-slate-500">{t('doctorForm.identity.description')}</p>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-500">{t('doctorForm.identity.birthYear')}</label>
                    <Input
                      type="number"
                      {...register('identity_birth_year')}
                      placeholder="1987"
                      aria-invalid={!!errors.identity_birth_year}
                    />
                </div>
                <div>
                  <label className="text-xs text-slate-500">{t('doctorForm.identity.religion')}</label>
                  <Input {...register('identity_religion')} aria-invalid={!!errors.identity_religion} />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('doctorForm.identity.gender')}</p>
                <div className="flex flex-wrap gap-4">
                  {identityGenderOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                      <Checkbox
                        checked={genderIdentities.includes(option)}
                        onChange={() =>
                          setGenderIdentities((prev) =>
                            prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
                          )
                        }
                      />
                      {t(`doctorForm.identity.genderOptions.${option}`)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('doctorForm.identity.ethnicity')}</p>
                <div className="flex flex-wrap gap-4">
                  {identityEthnicityOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                      <Checkbox
                        checked={ethnicities.includes(option)}
                        onChange={() =>
                          setEthnicities((prev) =>
                            prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
                          )
                        }
                      />
                      {t(`doctorForm.identity.ethnicityOptions.${option}`)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('doctorForm.identity.lgbtq')}</p>
                <div className="flex flex-wrap gap-4">
                  {identityLgbtqOptions.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                      <Checkbox
                        checked={lgbtqIdentities.includes(option)}
                        onChange={() =>
                          setLgbtqIdentities((prev) =>
                            prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
                          )
                        }
                      />
                      {t(`doctorForm.identity.lgbtqOptions.${option}`)}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.identity.other')}</label>
                <Textarea rows={2} {...register('identity_other')} aria-invalid={!!errors.identity_other} />
              </div>
            </div>
          </>
        )
      case 'treatment':
        return (
          <>
            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="grid gap-2 md:grid-cols-2">
                {therapyModalityOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                    <Checkbox
                      checked={therapyModalities.includes(option)}
                      onChange={() =>
                        setTherapyModalities((prev) =>
                          prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
                        )
                      }
                    />
                    {option}
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <label className="text-xs text-slate-500">{t('doctorForm.treatment.noteLabel')}</label>
                <Textarea
                  rows={3}
                  {...register('treatment_note')}
                  placeholder={t('doctorForm.treatment.notePlaceholder')}
                  aria-invalid={!!errors.treatment_note}
                />
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  const handleOpenSection = (section: SectionId) => {
    setActiveSection(section)
  }

  const handleCloseDrawer = () => {
    if (!isSaving) {
      setActiveSection(null)
    }
  }

  const handleDrawerSave = async () => {
    if (isSaving) return
    const uploaded = await uploadPendingMedia()
    if (!uploaded) return
    handleSubmit(onSubmit, handleFormErrors)()
  }

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const uploaded = await uploadPendingMedia()
    if (!uploaded) return
    handleSubmit(onSubmit, handleFormErrors)(event)
  }
  const ActiveSectionIcon = activeSection ? sectionIcons[activeSection] : null

  return (
    <div className="space-y-8" dir={i18n.dir()}>
      {isNewDoctor && (
        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
          {t('doctorForm.pendingBanner')}
        </div>
      )}
      {isUnderReview && (
        <div className="flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <div className="rounded-2xl bg-white/80 p-2 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-emerald-900">{t('doctorForm.reviewBanner.title')}</p>
            <p className="text-sm text-emerald-700">{t('doctorForm.reviewBanner.description')}</p>
          </div>
        </div>
      )}
      {isRejected && (
        <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <div className="rounded-2xl bg-white/80 p-2 text-rose-600">
            <X className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-rose-900">{t('doctorForm.rejectedBanner.title')}</p>
            <p className="text-sm text-rose-700">{t('doctorForm.rejectedBanner.description')}</p>
            {doctor?.status_note && (
              <p className="mt-2 text-sm font-medium text-rose-800">
                {t('doctorForm.rejectedBanner.notePrefix')} {doctor.status_note}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-slate-900">{t('doctorForm.completionTitle')}</p>
            <p className="text-sm text-slate-500">
              {t('doctorForm.completionStep', { current: completedSections, total: sectionOrder.length })}
            </p>
          </div>
          <div className="text-sm text-slate-500">
            {completionPercentage}
            {t('doctorForm.completionPercentSuffix')}
          </div>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary-500 transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sectionOrder.map((section) => {
            const completed = sectionCompletion[section]
            const Icon = sectionIcons[section]
            const progressValue = sectionProgress[section] ?? 0
            return (
              <div key={section} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{t(`doctorForm.tabs.${section}`)}</p>
                    <p className="text-sm text-slate-500">{t(`doctorForm.tabs.${section}Desc`)}</p>
                  </div>
                  <div
                    className={cn(
                      'rounded-2xl p-3',
                      completed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600">{sectionSummaries[section]}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{t('doctorForm.sectionProgressLabel')}</span>
                    <span>
                      {progressValue}
                      {t('doctorForm.completionPercentSuffix')}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100" role="progressbar" aria-valuenow={progressValue} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        completed ? 'bg-emerald-500' : 'bg-primary-400',
                      )}
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs">
                  <span className={completed ? 'text-emerald-600' : 'text-amber-600'}>
                    {completed ? t('doctorForm.summary.ready') : t('doctorForm.summary.todo')}
                  </span>
                  <Button type="button" variant="outline" className="text-xs px-3 py-1.5" onClick={() => handleOpenSection(section)}>
                    {completed ? t('common.actions.edit') : t('common.actions.add')}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? t('doctorForm.buttons.saving') : t('doctorForm.buttons.save')}
          </Button>
        </div>
      </form>
      {activeSection && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-slate-900/40" onClick={handleCloseDrawer} />
          <div className="ml-auto flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                {ActiveSectionIcon && (
                  <div className="rounded-2xl bg-primary-50 p-3 text-primary-600">
                    <ActiveSectionIcon className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-slate-900">{t(`doctorForm.tabs.${activeSection}`)}</p>
                  <p className="text-sm text-slate-500">{t(`doctorForm.tabs.${activeSection}Desc`)}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-900"
                onClick={handleCloseDrawer}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">{renderSectionContent(activeSection)}</div>
            <div className="flex items-center justify-between border-t border-slate-100 p-4">
              <Button type="button" variant="ghost" onClick={handleCloseDrawer}>
                {t('common.actions.close')}
              </Button>
              <Button type="button" onClick={handleDrawerSave} disabled={isSaving}>
                {isSaving ? t('doctorForm.buttons.saving') : t('doctorForm.buttons.sectionSave')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorProfileFormPage
