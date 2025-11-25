import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
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

const sectionOrder = ['about', 'finances', 'qualifications', 'specialties', 'clientFocus', 'treatment'] as const
type SectionId = (typeof sectionOrder)[number]


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

export const DoctorProfileFormPage = () => {
  const { data: doctor, isLoading } = useDoctorProfileQuery()
  const categoriesQuery = useCategoriesQuery()
  const saveProfile = useSaveDoctorProfile()
  const mediaUpload = useDoctorMediaUpload()
  const mediaDelete = useDoctorMediaDelete()
  const { t, i18n } = useTranslation()
  const schema = useMemo(() => buildSchema(t), [t])

  const [clinics, setClinics] = useState<ClinicForm[]>([{ address: '', city: '' }])
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
  const therapyModalityOptions = useMemo(
    () => ['CBT', 'DBT', 'EMDR', 'ACT', 'IFS', 'Mindfulness', 'Intervention', 'Coaching'],
    [],
  )
  const faithOrientationOptions = useMemo(
    () => ['any', 'islamic', 'christian', 'jewish', 'spiritual'],
    [],
  )
  const identityGenderOptions = useMemo(() => ['female', 'male', 'nonbinary', 'trans'], [])
  const identityEthnicityOptions = useMemo(() => ['arab', 'white', 'black', 'asian', 'latino', 'mixed'], [])
  const identityLgbtqOptions = useMemo(() => ['lgbtq', 'ally', 'questioning'], [])
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)

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

  const displayPreference = watch('display_name_preference')
  const watchedValues = useWatch({ control })
  const selectClasses = (hasError?: boolean) =>
    cn(
      'w-full rounded-2xl border border-slate-200 px-3 py-2 focus:border-primary-400 focus:ring-primary-100',
      hasError && 'border-red-400 focus:border-red-400 focus:ring-red-100',
    )

  useEffect(() => {
    if (!doctor) return

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
      })) ?? [{ address: '', city: '' }],
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

  const onSubmit = (values: FormValues) => {
    const {
      qualifications_text,
      insurances_text,
      identity_birth_year,
      identity_religion,
      identity_other,
      ...baseValues
    } = values

    const languagesList =
      values.languages?.split(',').map((lang) => lang.trim()).filter((lang) => lang.length > 0) ?? []

    if (languagesList.length === 0) {
      toast.error(t('doctorForm.validation.languageRequired'))
      return
    }

    const cleanedClinics = clinics
      .map((clinic) => ({
        ...clinic,
        address: clinic.address.trim(),
        city: clinic.city.trim(),
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

    saveProfile.mutate(payload, {
      onSuccess: (savedDoctor) => {
        toast.success(t('doctorForm.toasts.saveSuccess'))
        setActiveSection(null)
        queryClient.setQueryData<User | null>(queryKeys.auth, (prev) =>
          prev ? { ...prev, doctor_profile: savedDoctor } : prev,
        )
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, t('doctorForm.toasts.saveError')))
      },
    })
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
    setClinics((prev) => [...prev, { address: '', city: '' }])
  }

  const handleMediaUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    collection: 'documents' | 'gallery' | 'avatar' | 'intro_video',
  ) => {
    if (!event.target.files?.length) return
    const formData = new FormData()
    formData.append('collection', collection)
    Array.from(event.target.files).forEach((file) => formData.append('files[]', file))
    mediaUpload.mutate(formData, {
      onSuccess: () => toast.success(t('doctorForm.toasts.uploadSuccess')),
      onError: () => toast.error(t('doctorForm.toasts.uploadError')),
    })
  }

  const handleMediaDelete = (mediaId: number) => {
    mediaDelete.mutate(mediaId, {
      onSuccess: () => toast.success(t('doctorForm.toasts.deleteSuccess')),
    })
  }

  if (isLoading) {
    return <div className="text-slate-500">{t('doctorForm.loading')}</div>
  }

  const languagesCount =
    watchedValues.languages
      ?.split(',')
      .map((lang) => lang.trim())
      .filter((lang) => lang.length > 0).length ?? 0
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
  const sectionCompletion: Record<SectionId, boolean> = {
    about:
      Boolean(watchedValues.full_name?.trim()) &&
      Boolean(watchedValues.specialty?.trim()) &&
      Boolean(watchedValues.phone?.trim()) &&
      Boolean(watchedValues.city?.trim()) &&
      languagesCount > 0 &&
      hasParagraph &&
      hasClinics,
    finances:
      paymentMethods.length > 0 &&
      Boolean(watchedValues.fee_individual?.trim()) &&
      Boolean(watchedValues.insurances_text?.trim()),
    qualifications:
      Boolean(watchedValues.qualifications_text?.trim()) &&
      Boolean(watchedValues.education_institution?.trim()),
    specialties: selectedCategories.length > 0,
    clientFocus:
      clientParticipants.length > 0 && clientAgeGroups.length > 0 && alliedCommunities.length > 0,
    treatment: therapyModalities.length > 0 || Boolean(watchedValues.treatment_note?.trim()),
  }
  const completionValues = Object.values(sectionCompletion)
  const completedSections = completionValues.filter(Boolean).length
  const completionPercentage =
    Math.round((completedSections / Math.max(completionValues.length, 1)) * 100) || 0

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
  const avatarMedia = doctor?.media?.avatar ?? null
  const introVideoMedia = doctor?.media?.intro_video ?? null

  const renderSectionContent = (section: SectionId) => {
    switch (section) {
      case 'about':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.fullPublicName')}</label>
                <Input
                  {...register('full_name')}
                  placeholder={t('doctorForm.about.placeholders.fullPublicName')}
                  aria-invalid={!!errors.full_name}
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
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.primarySpecialty')}</label>
                <Input {...register('specialty')} aria-invalid={!!errors.specialty} />
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
                <label className="text-xs text-slate-500">{t('doctorForm.about.labels.licenseNumber')}</label>
                <Input {...register('license_number')} aria-invalid={!!errors.license_number} />
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
                <Input
                  {...register('professional_role')}
                  placeholder={t('doctorForm.about.placeholders.professionalRole')}
                  aria-invalid={!!errors.professional_role}
                />
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
                  {avatarMedia ? (
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
                  <Input type="file" accept="image/*" onChange={(event) => handleMediaUpload(event, 'avatar')} />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-900">{t('doctorForm.media.introVideoTitle')}</p>
                <p className="text-xs text-slate-500">{t('doctorForm.media.introVideoHint')}</p>
                <div className="mt-3 space-y-2">
                  {introVideoMedia ? (
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
                    onChange={(event) => handleMediaUpload(event, 'intro_video')}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
              <div>
                <p className="font-semibold text-slate-900">{t('doctorForm.media.documentsTitle')}</p>
                <p className="text-xs text-slate-500">{t('doctorForm.media.documentsHint')}</p>
              </div>
              <Input type="file" accept="image/*,application/pdf" onChange={(event) => handleMediaUpload(event, 'documents')} />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
              <div>
                <p className="font-semibold text-slate-900">{t('doctorForm.media.galleryTitle')}</p>
                <p className="text-xs text-slate-500">{t('doctorForm.media.galleryHint')}</p>
              </div>
              <Input type="file" multiple onChange={(event) => handleMediaUpload(event, 'gallery')} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900">{t('doctorForm.contact.title')}</h3>
              <p className="text-sm text-slate-500">{t('doctorForm.contact.description')}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.contact.mainPhone')}</label>
                <Input {...register('phone')} placeholder="+966..." aria-invalid={!!errors.phone} />
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
                <label className="text-xs text-slate-500">{t('doctorForm.contact.baseCity')}</label>
                <Input {...register('city')} aria-invalid={!!errors.city} />
              </div>
              <div>
                <label className="text-xs text-slate-500">{t('doctorForm.contact.languages')}</label>
                <Input {...register('languages')} placeholder="ar, en, fr" aria-invalid={!!errors.languages} />
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
                <div key={index} className="grid gap-4 rounded-2xl border border-slate-100 p-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-500">{t('doctorForm.clinics.city')}</label>
                    <Input value={clinic.city} onChange={(e) => handleClinicChange(index, 'city', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">{t('doctorForm.clinics.address')}</label>
                    <Input value={clinic.address} onChange={(e) => handleClinicChange(index, 'address', e.target.value)} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
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
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
                <Checkbox {...register('offers_sliding_scale')} />
                <span className="text-xs text-slate-500">
                  {watch('offers_sliding_scale')
                    ? t('doctorForm.finances.slidingYes')
                    : t('doctorForm.finances.slidingNo')}
                </span>
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
                      <span className="flex-1" style={{ paddingInlineStart: `${category.depth * 12}px` }}>
                        {category.name}
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
    if (!saveProfile.isPending) {
      setActiveSection(null)
    }
  }

  const handleDrawerSave = () => {
    handleSubmit(onSubmit, handleFormErrors)()
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
      <form onSubmit={handleSubmit(onSubmit, handleFormErrors)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sectionOrder.map((section) => {
            const completed = sectionCompletion[section]
            const Icon = sectionIcons[section]
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
          <Button type="submit" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? t('doctorForm.buttons.saving') : t('doctorForm.buttons.save')}
          </Button>
        </div>
      </form>
      {doctor?.media && doctor.media.gallery.length > 0 && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h3 className="font-semibold text-slate-900">{t('doctorForm.media.uploadedMediaTitle')}</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {doctor.media.gallery.map((media) => (
              <div key={media.id} className="relative">
                <img src={media.url} alt={media.name} className="h-32 w-full rounded-2xl object-cover" />
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-full bg-white/80 px-2 py-1 text-xs text-red-500"
                  onClick={() => handleMediaDelete(media.id)}
                >
                  {t('doctorForm.media.delete')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
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
              <Button type="button" onClick={handleDrawerSave} disabled={saveProfile.isPending}>
                {saveProfile.isPending ? t('doctorForm.buttons.saving') : t('doctorForm.buttons.sectionSave')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorProfileFormPage
