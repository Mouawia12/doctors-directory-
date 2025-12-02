import { useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAdminDoctorQuery, useCreateAdminDoctor, useUpdateAdminDoctor } from '@/features/admin/hooks'
import { useCategoriesQuery } from '@/features/categories/hooks'
import type { DoctorStatus, Category } from '@/types/doctor'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/common/EmptyState'
import type { AdminDoctorPayload } from '@/features/admin/types'
import { Card } from '@/components/ui/Card'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { LocationPicker } from '@/components/common/LocationPicker'

type DayKey = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

type ClinicWorkHoursForm = Record<
  DayKey,
  {
    enabled: boolean
    from: string
    to: string
  }
>

interface ClinicFormValues {
  id?: number
  city: string
  address: string
  lat?: string
  lng?: string
  work_hours: ClinicWorkHoursForm
}

interface DoctorFormValues {
  full_name: string
  honorific_prefix?: string
  first_name?: string
  middle_name?: string
  last_name?: string
  credentials_suffix?: string
  preferred_pronouns?: string
  display_name_preference: 'personal' | 'business'
  business_name?: string
  tagline?: string
  bio: string
  about_paragraph_one?: string
  about_paragraph_two?: string
  about_paragraph_three?: string
  specialty: string
  sub_specialty?: string
  languagesInput: string
  qualificationsInput: string
  additionalCredentialsInput: string
  insurancesInput: string
  license_number: string
  license_state?: string
  license_expiration?: string
  professional_role?: string
  licensure_status: 'licensed' | 'supervised' | 'unlicensed'
  years_of_experience: number
  qualificationsNoteInput?: string
  education_institution?: string
  education_degree?: string
  education_graduation_year?: string
  practice_start_year?: string
  gender: 'male' | 'female'
  service_delivery: 'in_person' | 'online' | 'hybrid'
  new_clients_status: 'accepting' | 'not_accepting' | 'waitlist'
  offers_intro_call: boolean
  new_clients_intro?: string
  city: string
  lat?: string
  lng?: string
  website?: string
  phone: string
  mobile_phone?: string
  mobile_can_text: boolean
  whatsapp?: string
  email?: string
  appointment_email?: string
  accepts_email_messages: boolean
  paymentMethodsInput: string
  fee_individual?: string
  fee_couples?: string
  offers_sliding_scale: boolean
  npi_number?: string
  liability_carrier?: string
  liability_expiration?: string
  specialties_note?: string
  clientParticipantsInput: string
  clientAgeGroupsInput: string
  faith_orientation?: string
  alliedCommunitiesInput: string
  therapyModalitiesInput: string
  treatment_note?: string
  identityBirthYear?: string
  identityReligion?: string
  identityOther?: string
  identityGenderInput: string
  identityEthnicityInput: string
  identityLgbtqInput: string
  status: DoctorStatus
  status_note?: string
  is_verified: boolean
  categories: string[]
  clinics: ClinicFormValues[]
  user_id?: string
}

type LanguageChoice = 'ar' | 'en'
const languageChoices: LanguageChoice[] = ['ar', 'en']
const participantOptions = ['individuals', 'couples', 'groups'] as const
const ageGroupOptions = ['kids', 'teens', 'adults'] as const
const alliedCommunityOptions = ['lgbtq', 'hard_of_hearing', 'racial_justice', 'veterans', 'disabilities', 'trauma_survivors'] as const
const therapyModalityOptions = ['CBT', 'DBT', 'EMDR', 'ACT', 'IFS', 'Mindfulness', 'Intervention', 'Coaching'] as const
const faithOrientationOptions = ['any', 'islamic', 'christian', 'jewish', 'spiritual'] as const

const weekDays: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const createWorkHoursDefaults = (existing?: Record<string, string[]>): ClinicWorkHoursForm => {
  return weekDays.reduce<ClinicWorkHoursForm>((acc, day) => {
    const [from, to] = existing?.[day] ?? []
    acc[day] = {
      enabled: Boolean(existing?.[day]),
      from: from ?? '09:00',
      to: to ?? '17:00',
    }
    return acc
  }, {})
}

const serializeWorkHours = (state?: ClinicWorkHoursForm) => {
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

const defaultClinic: ClinicFormValues = {
  city: '',
  address: '',
  lat: '',
  lng: '',
  work_hours: createWorkHoursDefaults(),
}

const defaultValues: DoctorFormValues = {
  full_name: '',
  honorific_prefix: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  credentials_suffix: '',
  preferred_pronouns: '',
  display_name_preference: 'personal',
  business_name: '',
  tagline: '',
  bio: '',
  about_paragraph_one: '',
  about_paragraph_two: '',
  about_paragraph_three: '',
  specialty: '',
  sub_specialty: '',
  languagesInput: 'ar',
  qualificationsInput: '',
  additionalCredentialsInput: '',
  insurancesInput: '',
  license_number: '',
  license_state: '',
  license_expiration: '',
  professional_role: '',
  licensure_status: 'licensed',
  years_of_experience: 0,
  qualificationsNoteInput: '',
  education_institution: '',
  education_degree: '',
  education_graduation_year: '',
  practice_start_year: '',
  gender: 'male',
  service_delivery: 'hybrid',
  new_clients_status: 'accepting',
  offers_intro_call: false,
  new_clients_intro: '',
  city: '',
  lat: '',
  lng: '',
  website: '',
  phone: '',
  mobile_phone: '',
  mobile_can_text: false,
  whatsapp: '',
  email: '',
  appointment_email: '',
  accepts_email_messages: true,
  paymentMethodsInput: '',
  fee_individual: '',
  fee_couples: '',
  offers_sliding_scale: false,
  npi_number: '',
  liability_carrier: '',
  liability_expiration: '',
  specialties_note: '',
  clientParticipantsInput: '',
  clientAgeGroupsInput: '',
  faith_orientation: '',
  alliedCommunitiesInput: '',
  therapyModalitiesInput: '',
  treatment_note: '',
  identityBirthYear: '',
  identityReligion: '',
  identityOther: '',
  identityGenderInput: '',
  identityEthnicityInput: '',
  identityLgbtqInput: '',
  status: 'pending',
  status_note: '',
  is_verified: false,
  categories: [],
  clinics: [defaultClinic],
  user_id: '',
}

const flattenCategories = (tree: Category[] = [], depth = 0): Array<Category & { depth: number }> =>
  tree.flatMap((category) => [
    { ...category, depth },
    ...(category.children ? flattenCategories(category.children, depth + 1) : []),
  ])

const splitByComma = (value?: string) =>
  (value ?? '')
    .split(/[,،]/)
    .map((item) => item.trim())
    .filter(Boolean)

const splitByLine = (value?: string) =>
  (value ?? '')
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)

const toNumber = (value?: string) => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const normalizeText = (value?: string) => (value && value.trim().length > 0 ? value.trim() : null)

export const AdminDoctorFormPage = () => {
  const { t } = useTranslation()
  const { doctorId } = useParams()
  const isEditMode = Boolean(doctorId)
  const navigate = useNavigate()

  const { data: doctor, isLoading } = useAdminDoctorQuery(doctorId, { enabled: isEditMode })
  const categoriesQuery = useCategoriesQuery()
  const categories = useMemo(
    () => flattenCategories(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  )

  const statusOptions = useMemo(
    () => [
      { value: 'draft' as DoctorStatus, label: t('common.statuses.draft') },
      { value: 'pending' as DoctorStatus, label: t('common.statuses.pending') },
      { value: 'approved' as DoctorStatus, label: t('common.statuses.approved') },
      { value: 'rejected' as DoctorStatus, label: t('common.statuses.rejected') },
    ],
    [t],
  )

  const genderOptions = useMemo(
    () => [
      { value: 'male' as const, label: t('adminDoctorForm.genderOptions.male') },
      { value: 'female' as const, label: t('adminDoctorForm.genderOptions.female') },
    ],
    [t],
  )

  const displayNameOptions = useMemo(
    () => [
      { value: 'personal' as const, label: t('adminDoctorForm.displayNameOptions.personal') },
      { value: 'business' as const, label: t('adminDoctorForm.displayNameOptions.business') },
    ],
    [t],
  )

  const licensureOptions = useMemo(
    () => [
      { value: 'licensed' as const, label: t('adminDoctorForm.licensureOptions.licensed') },
      { value: 'supervised' as const, label: t('adminDoctorForm.licensureOptions.supervised') },
      { value: 'unlicensed' as const, label: t('adminDoctorForm.licensureOptions.unlicensed') },
    ],
    [t],
  )

  const serviceDeliveryOptions = useMemo(
    () => [
      { value: 'in_person' as const, label: t('adminDoctorForm.serviceDelivery.inPerson') },
      { value: 'online' as const, label: t('adminDoctorForm.serviceDelivery.online') },
      { value: 'hybrid' as const, label: t('adminDoctorForm.serviceDelivery.hybrid') },
    ],
    [t],
  )

  const newClientsStatusOptions = useMemo(
    () => [
      { value: 'accepting' as const, label: t('adminDoctorForm.newClientsStatus.accepting') },
      { value: 'waitlist' as const, label: t('adminDoctorForm.newClientsStatus.waitlist') },
      { value: 'not_accepting' as const, label: t('adminDoctorForm.newClientsStatus.notAccepting') },
    ],
    [t],
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<DoctorFormValues>({
    defaultValues,
  })

  const clinicsArray = useFieldArray({
    control,
    name: 'clinics',
  })

  const watchedLanguages = watch('languagesInput')
  const selectedLanguages = useMemo(() => splitByComma(watchedLanguages).map((lang) => lang.toLowerCase()), [watchedLanguages])
  const clinicsValues = watch('clinics')
  const participantsValue = watch('clientParticipantsInput')
  const selectedParticipants = useMemo(() => splitByComma(participantsValue), [participantsValue])
  const ageGroupsValue = watch('clientAgeGroupsInput')
  const selectedAgeGroups = useMemo(() => splitByComma(ageGroupsValue), [ageGroupsValue])
  const alliedCommunitiesValue = watch('alliedCommunitiesInput')
  const selectedAlliedCommunities = useMemo(() => splitByLine(alliedCommunitiesValue), [alliedCommunitiesValue])
  const therapyModalitiesValue = watch('therapyModalitiesInput')
  const selectedTherapyModalities = useMemo(() => splitByLine(therapyModalitiesValue), [therapyModalitiesValue])
  const faithOrientationValue = watch('faith_orientation') ?? ''
  const activeFaithOrientation = faithOrientationValue || 'any'

  const toggleLanguage = (language: LanguageChoice) => {
    const next = new Set(selectedLanguages)
    if (next.has(language)) {
      if (next.size === 1) {
        toast.error(t('adminDoctorForm.validations.languageRequired'))
        return
      }
      next.delete(language)
    } else {
      next.add(language)
    }
    setValue('languagesInput', Array.from(next).join(', '), { shouldDirty: true })
  }

  const toggleCommaField = (
    field: 'clientParticipantsInput' | 'clientAgeGroupsInput',
    selectedValues: string[],
    option: string,
  ) => {
    const next = new Set(selectedValues)
    if (next.has(option)) {
      next.delete(option)
    } else {
      next.add(option)
    }
    setValue(field, Array.from(next).join(', '), { shouldDirty: true })
  }

  const toggleLineField = (
    field: 'alliedCommunitiesInput' | 'therapyModalitiesInput',
    selectedValues: string[],
    option: string,
  ) => {
    const next = new Set(selectedValues)
    if (next.has(option)) {
      next.delete(option)
    } else {
      next.add(option)
    }
    setValue(field, Array.from(next).join('\n'), { shouldDirty: true })
  }

  const handleFaithOrientationSelect = (value: (typeof faithOrientationOptions)[number]) => {
    setValue('faith_orientation', value === 'any' ? '' : value, { shouldDirty: true })
  }

  const handleClinicLocationChange = (
    index: number,
    value: { lat?: number; lng?: number; address?: string; city?: string },
  ) => {
    if (typeof value.lat !== 'undefined') {
      setValue(
        `clinics.${index}.lat`,
        typeof value.lat === 'number' && !Number.isNaN(value.lat) ? value.lat.toString() : '',
        { shouldDirty: true },
      )
    }

    if (typeof value.lng !== 'undefined') {
      setValue(
        `clinics.${index}.lng`,
        typeof value.lng === 'number' && !Number.isNaN(value.lng) ? value.lng.toString() : '',
        { shouldDirty: true },
      )
    }

    if (typeof value.address !== 'undefined') {
      setValue(`clinics.${index}.address`, value.address ?? '', { shouldDirty: true })
    }

    if (typeof value.city !== 'undefined') {
      setValue(`clinics.${index}.city`, value.city ?? '', { shouldDirty: true })
    }
  }

  const createMutation = useCreateAdminDoctor()
  const updateMutation = useUpdateAdminDoctor()
  const avatarMedia = doctor?.media?.avatar ?? null
  const introVideoMedia = doctor?.media?.intro_video ?? null
  const documentsMedia = doctor?.media?.documents ?? []
  const galleryMedia = doctor?.media?.gallery ?? []

  useEffect(() => {
    if (doctor && isEditMode) {
      const identityTraits = (doctor.identity_traits as Record<string, unknown> | undefined) ?? {}
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
        languagesInput: (doctor.languages ?? []).join(', '),
        qualificationsInput: (doctor.qualifications ?? []).join('\n'),
        additionalCredentialsInput: (doctor.additional_credentials ?? []).join('\n'),
        insurancesInput: (doctor.insurances ?? []).join(', '),
        license_number: doctor.license_number ?? '',
        license_state: doctor.license_state ?? '',
        license_expiration: doctor.license_expiration ?? '',
        professional_role: doctor.professional_role ?? '',
        licensure_status: (doctor.licensure_status as DoctorFormValues['licensure_status']) ?? 'licensed',
        years_of_experience: doctor.years_of_experience ?? 0,
        qualificationsNoteInput: doctor.qualifications_note ?? '',
        education_institution: doctor.education_institution ?? '',
        education_degree: doctor.education_degree ?? '',
        education_graduation_year: doctor.education_graduation_year?.toString() ?? '',
        practice_start_year: doctor.practice_start_year?.toString() ?? '',
        gender: (doctor.gender as 'male' | 'female') ?? 'male',
        service_delivery: (doctor.service_delivery as DoctorFormValues['service_delivery']) ?? 'hybrid',
        new_clients_status: (doctor.new_clients_status as DoctorFormValues['new_clients_status']) ?? 'accepting',
        offers_intro_call: doctor.offers_intro_call ?? false,
        new_clients_intro: doctor.new_clients_intro ?? '',
        city: doctor.city ?? '',
        lat: doctor.lat?.toString() ?? '',
        lng: doctor.lng?.toString() ?? '',
        website: doctor.website ?? '',
        phone: doctor.phone ?? '',
        mobile_phone: doctor.mobile_phone ?? '',
        mobile_can_text: doctor.mobile_can_text ?? false,
        whatsapp: doctor.whatsapp ?? '',
        email: doctor.email ?? '',
        appointment_email: doctor.appointment_email ?? '',
        accepts_email_messages: doctor.accepts_email_messages ?? true,
        paymentMethodsInput: (doctor.payment_methods ?? []).join('\n'),
        fee_individual: doctor.fee_individual?.toString() ?? '',
        fee_couples: doctor.fee_couples?.toString() ?? '',
        offers_sliding_scale: doctor.offers_sliding_scale ?? false,
        npi_number: doctor.npi_number ?? '',
        liability_carrier: doctor.liability_carrier ?? '',
        liability_expiration: doctor.liability_expiration ?? '',
        specialties_note: doctor.specialties_note ?? '',
        clientParticipantsInput: (doctor.client_participants ?? []).join(', '),
        clientAgeGroupsInput: (doctor.client_age_groups ?? []).join(', '),
        faith_orientation: doctor.faith_orientation ?? '',
        alliedCommunitiesInput: (doctor.allied_communities ?? []).join('\n'),
        therapyModalitiesInput: (doctor.therapy_modalities ?? []).join('\n'),
        treatment_note: doctor.treatment_note ?? '',
        identityBirthYear:
          typeof identityTraits.birth_year !== 'undefined' ? String(identityTraits.birth_year) : '',
        identityReligion: (identityTraits.religion as string) ?? '',
        identityOther: (identityTraits.other as string) ?? '',
        identityGenderInput: Array.isArray(identityTraits.gender_identity)
          ? (identityTraits.gender_identity as string[]).join(', ')
          : '',
        identityEthnicityInput: Array.isArray(identityTraits.ethnicity)
          ? (identityTraits.ethnicity as string[]).join(', ')
          : '',
        identityLgbtqInput: Array.isArray(identityTraits.lgbtqia)
          ? (identityTraits.lgbtqia as string[]).join(', ')
          : '',
        status: doctor.status,
        status_note: doctor.status_note ?? '',
        is_verified: doctor.is_verified,
        categories: (doctor.categories ?? []).map((category) => String(category.id)),
        clinics:
          doctor.clinics && doctor.clinics.length > 0
            ? doctor.clinics.map((clinic) => ({
                id: clinic.id,
                city: clinic.city ?? '',
                address: clinic.address ?? '',
                lat: clinic.lat?.toString() ?? '',
                lng: clinic.lng?.toString() ?? '',
                work_hours: createWorkHoursDefaults(clinic.work_hours ?? undefined),
              }))
            : defaultValues.clinics,
        user_id: doctor.user?.id ? String(doctor.user.id) : '',
      })
    }
  }, [doctor, isEditMode, reset])

  const onSubmit = (values: DoctorFormValues) => {
    const languages = splitByComma(values.languagesInput)

    if (languages.length === 0) {
      toast.error(t('adminDoctorForm.validations.languageRequired'))
      return
    }

    const clinicsPayload = values.clinics.map((clinic) => ({
      id: clinic.id,
      city: clinic.city,
      address: clinic.address,
      lat: toNumber(clinic.lat),
      lng: toNumber(clinic.lng),
      work_hours: serializeWorkHours(clinic.work_hours),
    }))

    const identityPayload = {
      birth_year: values.identityBirthYear ? Number(values.identityBirthYear) : undefined,
      religion: normalizeText(values.identityReligion),
      other: normalizeText(values.identityOther),
      gender_identity: splitByComma(values.identityGenderInput),
      ethnicity: splitByComma(values.identityEthnicityInput),
      lgbtqia: splitByComma(values.identityLgbtqInput),
    }

    const sanitizedIdentity = Object.fromEntries(
      Object.entries(identityPayload).filter(([, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0
        }
        return value !== undefined && value !== null && value !== ''
      }),
    )

    const payload: AdminDoctorPayload = {
      user_id: values.user_id ? Number(values.user_id) : null,
      full_name: values.full_name,
      honorific_prefix: normalizeText(values.honorific_prefix),
      first_name: normalizeText(values.first_name),
      middle_name: normalizeText(values.middle_name),
      last_name: normalizeText(values.last_name),
      credentials_suffix: normalizeText(values.credentials_suffix),
      preferred_pronouns: normalizeText(values.preferred_pronouns),
      display_name_preference: values.display_name_preference,
      business_name: normalizeText(values.business_name),
      tagline: normalizeText(values.tagline),
      bio: normalizeText(values.bio),
      about_paragraph_one: normalizeText(values.about_paragraph_one),
      about_paragraph_two: normalizeText(values.about_paragraph_two),
      about_paragraph_three: normalizeText(values.about_paragraph_three),
      specialty: values.specialty,
      sub_specialty: normalizeText(values.sub_specialty),
      qualifications: splitByLine(values.qualificationsInput),
      additional_credentials: splitByLine(values.additionalCredentialsInput),
      license_number: values.license_number,
      license_state: normalizeText(values.license_state),
      license_expiration: normalizeText(values.license_expiration),
      professional_role: normalizeText(values.professional_role),
      licensure_status: values.licensure_status,
      qualifications_note: normalizeText(values.qualificationsNoteInput),
      education_institution: normalizeText(values.education_institution),
      education_degree: normalizeText(values.education_degree),
      education_graduation_year: toNumber(values.education_graduation_year),
      practice_start_year: toNumber(values.practice_start_year),
      languages,
      gender: values.gender,
      years_of_experience: values.years_of_experience,
      insurances: splitByComma(values.insurancesInput),
      service_delivery: values.service_delivery,
      new_clients_status: values.new_clients_status,
      offers_intro_call: values.offers_intro_call,
      new_clients_intro: normalizeText(values.new_clients_intro),
      city: values.city,
      lat: toNumber(values.lat),
      lng: toNumber(values.lng),
      website: normalizeText(values.website),
      phone: values.phone,
      mobile_phone: normalizeText(values.mobile_phone),
      mobile_can_text: values.mobile_can_text,
      whatsapp: normalizeText(values.whatsapp),
      email: normalizeText(values.email),
      appointment_email: normalizeText(values.appointment_email),
      accepts_email_messages: values.accepts_email_messages,
      payment_methods: splitByLine(values.paymentMethodsInput),
      fee_individual: toNumber(values.fee_individual),
      fee_couples: toNumber(values.fee_couples),
      offers_sliding_scale: values.offers_sliding_scale,
      npi_number: normalizeText(values.npi_number),
      liability_carrier: normalizeText(values.liability_carrier),
      liability_expiration: normalizeText(values.liability_expiration),
      specialties_note: normalizeText(values.specialties_note),
      client_participants: splitByComma(values.clientParticipantsInput),
      client_age_groups: splitByComma(values.clientAgeGroupsInput),
      faith_orientation: normalizeText(values.faith_orientation),
      allied_communities: splitByLine(values.alliedCommunitiesInput),
      therapy_modalities: splitByLine(values.therapyModalitiesInput),
      treatment_note: normalizeText(values.treatment_note),
      identity_traits: Object.keys(sanitizedIdentity).length ? sanitizedIdentity : null,
      is_verified: values.is_verified,
      status: values.status,
      status_note: normalizeText(values.status_note),
      categories: (values.categories ?? []).map((id) => Number(id)),
      clinics: clinicsPayload,
    }

    if (isEditMode && doctorId) {
      updateMutation.mutate(
        { doctorId: Number(doctorId), payload },
        {
          onSuccess: (response) => {
            const message = response.generated_password
              ? t('adminDoctorForm.toasts.updateWithPassword', { password: response.generated_password })
              : t('adminDoctorForm.toasts.updateSuccess')
            toast.success(message)
            navigate(`/admin/doctors/${response.doctor.id}`)
          },
          onError: () => toast.error(t('adminDoctorForm.toasts.updateError')),
        },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: (response) => {
          const message = response.generated_password
            ? t('adminDoctorForm.toasts.createWithPassword', { password: response.generated_password })
            : t('adminDoctorForm.toasts.createSuccess')
          toast.success(message)
          navigate(`/admin/doctors/${response.doctor.id}`)
        },
        onError: () => toast.error(t('adminDoctorForm.toasts.createError')),
      })
    }
  }

  if (isEditMode && isLoading) {
    return <div className="text-slate-500">{t('adminDoctorForm.loading')}</div>
  }

  if (isEditMode && !doctor) {
    return <EmptyState title={t('adminDoctorForm.notFound')} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {isEditMode ? t('adminDoctorForm.editTitle') : t('adminDoctorForm.addTitle')}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEditMode ? doctor?.full_name : t('adminDoctorForm.newDoctor')}
          </h1>
        </div>
        <Button variant="ghost" onClick={() => navigate('/admin/doctors')} className="justify-center">
          {t('adminDoctorForm.back')}
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{t('doctorForm.about.title')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{t('adminDoctorForm.sections.identityDetails')}</h3>
            <p className="text-sm text-slate-500">{t('doctorForm.about.description')}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.fullName')}</label>
              <Input {...register('full_name', { required: t('adminDoctorForm.validations.required') })} />
              {errors.full_name && <p className="text-xs text-rose-500">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.displayName')}</label>
              <Select {...register('display_name_preference')}>
                {displayNameOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.businessName')}</label>
              <Input {...register('business_name')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.honorific')}</label>
              <Input {...register('honorific_prefix')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.firstName')}</label>
              <Input {...register('first_name')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.middleName')}</label>
              <Input {...register('middle_name')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.lastName')}</label>
              <Input {...register('last_name')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.credentials')}</label>
              <Input {...register('credentials_suffix')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.pronouns')}</label>
              <Input {...register('preferred_pronouns')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.tagline')}</label>
              <Input {...register('tagline')} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.specialty')}</label>
              <Input {...register('specialty', { required: t('adminDoctorForm.validations.required') })} />
              {errors.specialty && <p className="text-xs text-rose-500">{errors.specialty.message}</p>}
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.subSpecialty')}</label>
              <Input {...register('sub_specialty')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.professionalRole')}</label>
              <Input {...register('professional_role')} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.yearsExperience')}</label>
              <Input type="number" min={0} {...register('years_of_experience', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.gender')}</label>
              <Select {...register('gender')}>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.licensureStatus')}</label>
              <Select {...register('licensure_status')}>
                {licensureOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.licenseNumber')}</label>
              <Input {...register('license_number', { required: t('adminDoctorForm.validations.required') })} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.licenseState')}</label>
              <Input {...register('license_state')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.licenseExpiration')}</label>
              <Input type="date" {...register('license_expiration')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.languages')}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {languageChoices.map((lang) => {
                  const active = selectedLanguages.includes(lang)
                  return (
                    <button
                      key={lang}
                      type="button"
                      className={cn(
                        'rounded-full px-3 py-1 text-xs transition',
                        active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      )}
                      onClick={() => toggleLanguage(lang)}
                    >
                      {t(`doctorForm.contact.languageOptions.${lang}`)}
                    </button>
                  )
                })}
              </div>
              <input type="hidden" {...register('languagesInput', { required: t('adminDoctorForm.validations.languageRequired') })} />
              {errors.languagesInput && <p className="text-xs text-rose-500">{errors.languagesInput.message}</p>}
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.insurances')}</label>
              <Input {...register('insurancesInput')} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.qualifications')}</label>
              <Textarea rows={3} {...register('qualificationsInput')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.additionalCredentials')}</label>
              <Textarea rows={3} {...register('additionalCredentialsInput')} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.qualificationsNote')}</label>
              <Textarea rows={2} {...register('qualificationsNoteInput')} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.educationInstitution')}</label>
                <Input {...register('education_institution')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.educationDegree')}</label>
                <Input {...register('education_degree')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.educationYear')}</label>
                <Input type="number" {...register('education_graduation_year')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.practiceStart')}</label>
                <Input type="number" {...register('practice_start_year')} />
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.bio')}</label>
              <Textarea rows={4} {...register('bio')} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.aboutParagraphOne')}</label>
                <Textarea rows={2} {...register('about_paragraph_one')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.aboutParagraphTwo')}</label>
                <Textarea rows={2} {...register('about_paragraph_two')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.aboutParagraphThree')}</label>
                <Textarea rows={2} {...register('about_paragraph_three')} />
              </div>
            </div>
          </div>
        </Card>


        <Card className="space-y-6">
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorForm.sections.finances')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{t('adminDoctorForm.sections.fees')}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.feeIndividual')}</label>
              <Input type="number" {...register('fee_individual')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.feeCouples')}</label>
              <Input type="number" {...register('fee_couples')} />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
              <Checkbox {...register('offers_sliding_scale')} />
              {t('adminDoctorForm.labels.offersSlidingScale')}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.paymentMethods')}</label>
              <Textarea rows={3} {...register('paymentMethodsInput')} />
            </div>
            <div className="grid gap-4">
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.npi')}</label>
                <Input {...register('npi_number')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.liabilityCarrier')}</label>
                <Input {...register('liability_carrier')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.liabilityExpiration')}</label>
                <Input type="date" {...register('liability_expiration')} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{t('doctorForm.clientFocus.title')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{t('doctorForm.clientFocus.description')}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.specialtiesNote')}</label>
              <Textarea rows={2} {...register('specialties_note')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.treatmentNote')}</label>
              <Textarea rows={2} {...register('treatment_note')} />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500">{t('doctorForm.clientFocus.participants')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {participantOptions.map((option) => {
                  const active = selectedParticipants.includes(option)
                  return (
                    <button
                      key={option}
                      type="button"
                      className={cn(
                        'rounded-full px-3 py-1 text-xs transition',
                        active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      )}
                      onClick={() => toggleCommaField('clientParticipantsInput', selectedParticipants, option)}
                    >
                      {t(`doctorForm.clientFocus.participantsOptions.${option}`)}
                    </button>
                  )
                })}
              </div>
              <input type="hidden" {...register('clientParticipantsInput')} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('doctorForm.clientFocus.ageGroups')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ageGroupOptions.map((option) => {
                  const active = selectedAgeGroups.includes(option)
                  return (
                    <button
                      key={option}
                      type="button"
                      className={cn(
                        'rounded-full px-3 py-1 text-xs transition',
                        active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      )}
                      onClick={() => toggleCommaField('clientAgeGroupsInput', selectedAgeGroups, option)}
                    >
                      {t(`doctorForm.clientFocus.ageOptions.${option}`)}
                    </button>
                  )
                })}
              </div>
              <input type="hidden" {...register('clientAgeGroupsInput')} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('doctorForm.clientFocus.faith')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {faithOrientationOptions.map((option) => {
                  const active = activeFaithOrientation === option
                  return (
                    <button
                      key={option}
                      type="button"
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs transition',
                        active
                          ? 'border-primary-200 bg-primary-50 text-primary-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300',
                      )}
                      onClick={() => handleFaithOrientationSelect(option)}
                    >
                      {t(`doctorForm.clientFocus.faithOptions.${option}`)}
                    </button>
                  )
                })}
              </div>
              <input type="hidden" {...register('faith_orientation')} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('doctorForm.clientFocus.allied')}</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {alliedCommunityOptions.map((option) => {
                  const active = selectedAlliedCommunities.includes(option)
                  return (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                      <Checkbox checked={active} onChange={() => toggleLineField('alliedCommunitiesInput', selectedAlliedCommunities, option)} />
                      {t(`doctorForm.clientFocus.alliedOptions.${option}`)}
                    </label>
                  )
                })}
              </div>
              <input type="hidden" {...register('alliedCommunitiesInput')} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('doctorForm.clientFocus.modalities')}</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {therapyModalityOptions.map((option) => {
                  const active = selectedTherapyModalities.includes(option)
                  return (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                      <Checkbox checked={active} onChange={() => toggleLineField('therapyModalitiesInput', selectedTherapyModalities, option)} />
                      {option}
                    </label>
                  )
                })}
              </div>
              <input type="hidden" {...register('therapyModalitiesInput')} />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">{t('doctorForm.identity.title')}</p>
            <p className="text-sm text-slate-500">{t('doctorForm.identity.description')}</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.identityBirthYear')}</label>
                <Input type="number" {...register('identityBirthYear')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.identityReligion')}</label>
                <Input {...register('identityReligion')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.identityOther')}</label>
                <Input {...register('identityOther')} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.identityGender')}</label>
                <Input {...register('identityGenderInput')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.identityEthnicity')}</label>
                <Input {...register('identityEthnicityInput')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.identityLgbtq')}</label>
                <Input {...register('identityLgbtqInput')} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorForm.sections.contact')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{t('adminDoctorForm.sections.channels')}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.city')}</label>
              <Input {...register('city', { required: t('adminDoctorForm.validations.required') })} />
            </div>
            <div className="md:col-span-1">
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.latitude')}</label>
              <Input type="number" step="any" {...register('lat')} />
            </div>
            <div className="md:col-span-1">
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.longitude')}</label>
              <Input type="number" step="any" {...register('lng')} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.phone')}</label>
              <Input {...register('phone', { required: t('adminDoctorForm.validations.required') })} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.mobilePhone')}</label>
              <Input {...register('mobile_phone')} />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
              <Checkbox {...register('mobile_can_text')} />
              {t('adminDoctorForm.labels.mobileCanText')}
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.whatsapp')}</label>
              <Input {...register('whatsapp')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.email')}</label>
              <Input type="email" {...register('email')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.appointmentEmail')}</label>
              <Input type="email" {...register('appointment_email')} />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
              <Checkbox {...register('accepts_email_messages')} />
              {t('adminDoctorForm.labels.acceptEmails')}
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.website')}</label>
              <Input type="url" {...register('website')} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.newClientsIntro')}</label>
              <Textarea rows={2} {...register('new_clients_intro')} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.serviceDelivery')}</label>
                <Select {...register('service_delivery')}>
                  {serviceDeliveryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.newClientsStatus')}</label>
                <Select {...register('new_clients_status')}>
                  {newClientsStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 md:col-span-2">
                <Checkbox {...register('offers_intro_call')} />
                {t('adminDoctorForm.labels.offersIntroCall')}
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorForm.sections.verification')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{t('adminDoctorForm.sections.status')}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.status')}</label>
              <Select {...register('status')}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
              <Checkbox {...register('is_verified')} />
              {t('adminDoctorForm.labels.verified')}
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.statusNote')}</label>
              <Textarea rows={2} {...register('status_note')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.userId')}</label>
              <Input type="number" {...register('user_id')} placeholder={t('adminDoctorForm.placeholders.optional')} />
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">{t('adminDoctorForm.sections.workplaces')}</p>
              <h3 className="text-lg font-semibold text-slate-900">{t('adminDoctorForm.sections.clinics')}</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => clinicsArray.append({ city: '', address: '', lat: '', lng: '', work_hours: createWorkHoursDefaults() })}
              disabled={clinicsArray.fields.length >= 3}
            >
              {t('adminDoctorForm.addClinic')}
            </Button>
          </div>
          <div className="space-y-4">
            {clinicsArray.fields.map((field, index) => {
              const clinicValue = clinicsValues?.[index]
              return (
              <div key={field.id} className="rounded-2xl border border-slate-100 p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-slate-800">
                    {t('adminDoctorForm.labels.clinic')} {index + 1}
                  </p>
                  {clinicsArray.fields.length > 1 && (
                    <Button type="button" variant="ghost" onClick={() => clinicsArray.remove(index)}>
                      {t('adminDoctorForm.remove')}
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.city')}</label>
                    <Input
                      {...register(`clinics.${index}.city` as const, { required: t('adminDoctorForm.validations.required') })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.address')}</label>
                    <Input
                      {...register(`clinics.${index}.address` as const, { required: t('adminDoctorForm.validations.required') })}
                    />
                  </div>
                </div>
                <div>
                  <LocationPicker
                    value={{
                      lat: clinicValue?.lat ? Number(clinicValue.lat) : undefined,
                      lng: clinicValue?.lng ? Number(clinicValue.lng) : undefined,
                      address: clinicValue?.address,
                      city: clinicValue?.city,
                    }}
                    onChange={(value) => handleClinicLocationChange(index, value)}
                  />
                  <input type="hidden" {...register(`clinics.${index}.lat` as const)} />
                  <input type="hidden" {...register(`clinics.${index}.lng` as const)} />
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('adminDoctorForm.labels.workHours')}
                  </p>
                  <div className="mt-3 space-y-2">
                    {weekDays.map((day) => (
                      <div
                        key={`${field.id}-${day}`}
                        className="grid items-center gap-2 text-sm sm:grid-cols-[minmax(0,160px),1fr,1fr]"
                      >
                        <label className="flex items-center gap-2 text-slate-600">
                          <Checkbox {...register(`clinics.${index}.work_hours.${day}.enabled` as const)} />
                          <span className="capitalize">{t(`common.days.${day}`)}</span>
                        </label>
                        <Input type="time" {...register(`clinics.${index}.work_hours.${day}.from` as const)} />
                        <Input type="time" {...register(`clinics.${index}.work_hours.${day}.to` as const)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )})}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorForm.sections.categoriesNote')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{t('adminDoctorForm.sections.categories')}</h3>
          </div>
          {categoriesQuery.isLoading ? (
            <p className="text-sm text-slate-500">{t('adminDoctorForm.categoriesLoading')}</p>
          ) : (
            <Controller
              name="categories"
              control={control}
              defaultValue={defaultValues.categories}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => {
                        const value = String(category.id)
                        if (field.value?.includes(value)) {
                          field.onChange(field.value.filter((item) => item !== value))
                        } else {
                          field.onChange([...(field.value ?? []), value])
                        }
                      }}
                      className={`rounded-full px-3 py-1 text-xs ${
                        field.value?.includes(String(category.id))
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      style={{ marginInlineStart: `${category.depth * 12}px` }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            />
          )}
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="w-full sm:w-auto"
          >
            {isEditMode ? t('adminDoctorForm.saveChanges') : t('adminDoctorForm.saveDoctor')}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            {t('common.actions.cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AdminDoctorFormPage
