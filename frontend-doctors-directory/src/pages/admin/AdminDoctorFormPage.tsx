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

interface DoctorFormValues {
  full_name: string
  bio: string
  specialty: string
  sub_specialty?: string
  languagesInput: string
  qualificationsInput: string
  insurancesInput: string
  license_number: string
  gender: 'male' | 'female'
  years_of_experience: number
  city: string
  lat?: string
  lng?: string
  website?: string
  phone: string
  whatsapp?: string
  email?: string
  status: DoctorStatus
  status_note?: string
  is_verified: boolean
  categories: string[]
  clinics: Array<{ id?: number; city: string; address: string; lat?: string; lng?: string }>
  user_id?: string
}

const defaultValues: DoctorFormValues = {
  full_name: '',
  bio: '',
  specialty: '',
  sub_specialty: '',
  languagesInput: 'ar',
  qualificationsInput: '',
  insurancesInput: '',
  license_number: '',
  gender: 'male',
  years_of_experience: 0,
  city: '',
  lat: '',
  lng: '',
  website: '',
  phone: '',
  whatsapp: '',
  email: '',
  status: 'pending',
  status_note: '',
  is_verified: false,
  categories: [],
  clinics: [{ city: '', address: '', lat: '', lng: '' }],
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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<DoctorFormValues>({
    defaultValues,
  })

  const clinicsArray = useFieldArray({
    control,
    name: 'clinics',
  })

  const createMutation = useCreateAdminDoctor()
  const updateMutation = useUpdateAdminDoctor()

  useEffect(() => {
    if (doctor && isEditMode) {
      reset({
        full_name: doctor.full_name ?? '',
        bio: doctor.bio ?? '',
        specialty: doctor.specialty ?? '',
        sub_specialty: doctor.sub_specialty ?? '',
        languagesInput: (doctor.languages ?? []).join(', '),
        qualificationsInput: (doctor.qualifications ?? []).join('\n'),
        insurancesInput: (doctor.insurances ?? []).join(', '),
        license_number: doctor.license_number ?? '',
        gender: (doctor.gender as 'male' | 'female') ?? 'male',
        years_of_experience: doctor.years_of_experience ?? 0,
        city: doctor.city ?? '',
        lat: doctor.lat?.toString() ?? '',
        lng: doctor.lng?.toString() ?? '',
        website: doctor.website ?? '',
        phone: doctor.phone ?? '',
        whatsapp: doctor.whatsapp ?? '',
        email: doctor.email ?? '',
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

    const payload: AdminDoctorPayload = {
      full_name: values.full_name,
      bio: normalizeText(values.bio ?? ''),
      specialty: values.specialty,
      sub_specialty: normalizeText(values.sub_specialty),
      qualifications: splitByLine(values.qualificationsInput),
      license_number: values.license_number,
      languages,
      gender: values.gender,
      years_of_experience: values.years_of_experience,
      insurances: splitByComma(values.insurancesInput),
      city: values.city,
      lat: toNumber(values.lat),
      lng: toNumber(values.lng),
      website: normalizeText(values.website),
      phone: values.phone,
      whatsapp: normalizeText(values.whatsapp),
      email: normalizeText(values.email),
      is_verified: values.is_verified,
      status: values.status,
      status_note: normalizeText(values.status_note),
      categories: (values.categories ?? []).map((id) => Number(id)),
      clinics: values.clinics.map((clinic) => ({
        id: clinic.id,
        city: clinic.city,
        address: clinic.address,
        lat: toNumber(clinic.lat),
        lng: toNumber(clinic.lng),
      })),
      user_id: values.user_id ? Number(values.user_id) : null,
    }

    if (isEditMode && doctorId) {
      updateMutation.mutate(
        { doctorId: Number(doctorId), payload },
        {
          onSuccess: () => {
            toast.success(t('adminDoctorForm.toasts.updateSuccess'))
            navigate(`/admin/doctors/${doctorId}`)
          },
          onError: () => toast.error(t('adminDoctorForm.toasts.updateError')),
        },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: (createdDoctor) => {
          toast.success(t('adminDoctorForm.toasts.createSuccess'))
          navigate(`/admin/doctors/${createdDoctor.id}`)
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
        <Card className="space-y-4">
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorForm.sections.basic')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{t('adminDoctorForm.sections.professional')}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.fullName')}</label>
              <Input {...register('full_name', { required: t('adminDoctorForm.validations.required') })} />
              {errors.full_name && <p className="text-xs text-rose-500">{errors.full_name.message}</p>}
            </div>
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
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.yearsExperience')}</label>
              <Input type="number" min={0} {...register('years_of_experience', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-sm text-slate-600">
                {t('adminDoctorForm.labels.languages')}
              </label>
              <Input {...register('languagesInput', { required: t('adminDoctorForm.validations.languageRequired') })} />
              {errors.languagesInput && <p className="text-xs text-rose-500">{errors.languagesInput.message}</p>}
            </div>
            <div>
              <label className="text-sm text-slate-600">
                {t('adminDoctorForm.labels.insurances')}
              </label>
              <Input {...register('insurancesInput')} />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.qualifications')}</label>
            <Textarea rows={3} {...register('qualificationsInput')} />
          </div>
          <div>
            <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.bio')}</label>
            <Textarea rows={4} {...register('bio')} />
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorForm.sections.contact')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{t('adminDoctorForm.sections.channels')}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.licenseNumber')}</label>
              <Input {...register('license_number', { required: t('adminDoctorForm.validations.required') })} />
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
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.city')}</label>
              <Input {...register('city', { required: t('adminDoctorForm.validations.required') })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.latitude')}</label>
                <Input type="number" step="any" {...register('lat')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.longitude')}</label>
                <Input type="number" step="any" {...register('lng')} />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.phone')}</label>
              <Input {...register('phone', { required: t('adminDoctorForm.validations.required') })} />
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
              <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.website')}</label>
              <Input type="url" {...register('website')} />
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
              onClick={() => clinicsArray.append({ city: '', address: '', lat: '', lng: '' })}
              disabled={clinicsArray.fields.length >= 3}
            >
              {t('adminDoctorForm.addClinic')}
            </Button>
          </div>
          <div className="space-y-4">
            {clinicsArray.fields.map((field, index) => (
              <div key={field.id} className="rounded-2xl border border-slate-100 p-4">
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
                <div className="mt-3 grid gap-3 md:grid-cols-2">
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
                  <div>
                    <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.latitude')}</label>
                    <Input type="number" step="any" {...register(`clinics.${index}.lat` as const)} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">{t('adminDoctorForm.labels.longitude')}</label>
                    <Input type="number" step="any" {...register(`clinics.${index}.lng` as const)} />
                  </div>
                </div>
              </div>
            ))}
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
