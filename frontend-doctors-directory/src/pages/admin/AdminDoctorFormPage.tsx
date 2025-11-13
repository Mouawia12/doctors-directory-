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
import { useLocaleText } from '@/app/hooks/useLocaleText'

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
  const translate = useLocaleText()
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
      { value: 'pending' as DoctorStatus, label: translate('قيد المراجعة', 'Pending') },
      { value: 'approved' as DoctorStatus, label: translate('معتمد', 'Approved') },
      { value: 'rejected' as DoctorStatus, label: translate('مرفوض', 'Rejected') },
    ],
    [translate],
  )

  const genderOptions = useMemo(
    () => [
      { value: 'male' as const, label: translate('ذكر', 'Male') },
      { value: 'female' as const, label: translate('أنثى', 'Female') },
    ],
    [translate],
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
      toast.error(translate('أدخل لغة واحدة على الأقل', 'Enter at least one language'))
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
            toast.success(translate('تم تحديث بيانات الطبيب', 'Doctor updated'))
            navigate(`/admin/doctors/${doctorId}`)
          },
          onError: () => toast.error(translate('تعذر تحديث البيانات', 'Unable to update data')),
        },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: (createdDoctor) => {
          toast.success(translate('تمت إضافة الطبيب بنجاح', 'Doctor created successfully'))
          navigate(`/admin/doctors/${createdDoctor.id}`)
        },
        onError: () => toast.error(translate('تعذر إنشاء الطبيب', 'Failed to create doctor')),
      })
    }
  }

  if (isEditMode && isLoading) {
    return <div className="text-slate-500">{translate('جارٍ تحميل بيانات الطبيب...', 'Loading doctor data...')}</div>
  }

  if (isEditMode && !doctor) {
    return <EmptyState title={translate('لم يتم العثور على الطبيب', 'Doctor not found')} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {isEditMode ? translate('تعديل بيانات طبيب', 'Edit doctor') : translate('إضافة طبيب جديد', 'Add new doctor')}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEditMode ? doctor?.full_name : translate('طبيب جديد', 'New doctor')}
          </h1>
        </div>
        <Button variant="ghost" onClick={() => navigate('/admin/doctors')} className="justify-center">
          {translate('العودة للقائمة', 'Back to list')}
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-4">
          <div>
            <p className="text-xs text-slate-500">{translate('البيانات الأساسية', 'Basic info')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{translate('المعلومات المهنية', 'Professional info')}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{translate('الاسم الكامل', 'Full name')}</label>
              <Input {...register('full_name', { required: translate('مطلوب', 'Required') })} />
              {errors.full_name && <p className="text-xs text-rose-500">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="text-sm text-slate-600">{translate('التخصص', 'Specialty')}</label>
              <Input {...register('specialty', { required: translate('مطلوب', 'Required') })} />
              {errors.specialty && <p className="text-xs text-rose-500">{errors.specialty.message}</p>}
            </div>
            <div>
              <label className="text-sm text-slate-600">{translate('التخصص الفرعي', 'Sub specialty')}</label>
              <Input {...register('sub_specialty')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{translate('عدد سنوات الخبرة', 'Years of experience')}</label>
              <Input type="number" min={0} {...register('years_of_experience', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-sm text-slate-600">
                {translate('اللغات (استخدم فاصلة بين كل لغة)', 'Languages (comma separated)')}
              </label>
              <Input {...register('languagesInput', { required: translate('أدخل لغة واحدة على الأقل', 'Enter at least one language') })} />
              {errors.languagesInput && <p className="text-xs text-rose-500">{errors.languagesInput.message}</p>}
            </div>
            <div>
              <label className="text-sm text-slate-600">
                {translate('شركات التأمين (مفصولة بفاصلة)', 'Insurances (comma separated)')}
              </label>
              <Input {...register('insurancesInput')} />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-600">{translate('المؤهلات (سطر لكل مؤهل)', 'Qualifications (one per line)')}</label>
            <Textarea rows={3} {...register('qualificationsInput')} />
          </div>
          <div>
            <label className="text-sm text-slate-600">{translate('نبذة تعريفية', 'Bio')}</label>
            <Textarea rows={4} {...register('bio')} />
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs text-slate-500">{translate('معلومات الاتصال', 'Contact info')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{translate('القنوات والعناوين', 'Channels & addresses')}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{translate('رقم الترخيص', 'License number')}</label>
              <Input {...register('license_number', { required: translate('مطلوب', 'Required') })} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{translate('اختيار الجنس', 'Gender')}</label>
              <Select {...register('gender')}>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-600">{translate('المدينة', 'City')}</label>
              <Input {...register('city', { required: translate('مطلوب', 'Required') })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-600">{translate('خط العرض', 'Latitude')}</label>
                <Input type="number" step="any" {...register('lat')} />
              </div>
              <div>
                <label className="text-sm text-slate-600">{translate('خط الطول', 'Longitude')}</label>
                <Input type="number" step="any" {...register('lng')} />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">{translate('الهاتف', 'Phone')}</label>
              <Input {...register('phone', { required: translate('مطلوب', 'Required') })} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{translate('واتساب', 'WhatsApp')}</label>
              <Input {...register('whatsapp')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{translate('البريد الإلكتروني', 'Email')}</label>
              <Input type="email" {...register('email')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{translate('الموقع الإلكتروني', 'Website')}</label>
              <Input type="url" {...register('website')} />
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs text-slate-500">{translate('الاعتماد والصلاحيات', 'Verification')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{translate('حالة الملف', 'Profile status')}</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-600">{translate('الحالة', 'Status')}</label>
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
              {translate('تم التوثيق', 'Verified')}
            </div>
            <div>
              <label className="text-sm text-slate-600">{translate('ملاحظات الحالة', 'Status note')}</label>
              <Textarea rows={2} {...register('status_note')} />
            </div>
            <div>
              <label className="text-sm text-slate-600">{translate('معرّف المستخدم المرتبط', 'Linked user ID')}</label>
              <Input type="number" {...register('user_id')} placeholder={translate('اختياري', 'Optional')} />
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">{translate('أماكن العمل', 'Workplaces')}</p>
              <h3 className="text-lg font-semibold text-slate-900">{translate('العيادات', 'Clinics')}</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => clinicsArray.append({ city: '', address: '', lat: '', lng: '' })}
              disabled={clinicsArray.fields.length >= 3}
            >
              {translate('إضافة عيادة', 'Add clinic')}
            </Button>
          </div>
          <div className="space-y-4">
            {clinicsArray.fields.map((field, index) => (
              <div key={field.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-slate-800">
                    {translate('عيادة', 'Clinic')} {index + 1}
                  </p>
                  {clinicsArray.fields.length > 1 && (
                    <Button type="button" variant="ghost" onClick={() => clinicsArray.remove(index)}>
                      {translate('إزالة', 'Remove')}
                    </Button>
                  )}
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-slate-600">{translate('المدينة', 'City')}</label>
                    <Input
                      {...register(`clinics.${index}.city` as const, { required: translate('مطلوب', 'Required') })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">{translate('العنوان', 'Address')}</label>
                    <Input
                      {...register(`clinics.${index}.address` as const, { required: translate('مطلوب', 'Required') })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">{translate('خط العرض', 'Latitude')}</label>
                    <Input type="number" step="any" {...register(`clinics.${index}.lat` as const)} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">{translate('خط الطول', 'Longitude')}</label>
                    <Input type="number" step="any" {...register(`clinics.${index}.lng` as const)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-xs text-slate-500">{translate('التخصصات الفرعية', 'Sub specialties')}</p>
            <h3 className="text-lg font-semibold text-slate-900">{translate('التصنيفات', 'Categories')}</h3>
          </div>
          {categoriesQuery.isLoading ? (
            <p className="text-sm text-slate-500">{translate('جارٍ تحميل التصنيفات...', 'Loading categories...')}</p>
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
            {isEditMode ? translate('حفظ التغييرات', 'Save changes') : translate('حفظ الطبيب', 'Save doctor')}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
            {translate('إلغاء', 'Cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AdminDoctorFormPage
