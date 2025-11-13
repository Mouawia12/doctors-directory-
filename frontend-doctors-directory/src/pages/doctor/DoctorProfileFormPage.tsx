import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useDoctorProfileQuery, useSaveDoctorProfile, useDoctorMediaUpload, useDoctorMediaDelete } from '@/features/doctor/hooks'
import { toast } from 'sonner'
import type { ApiResponse } from '@/types/api'
import { useNavigate } from 'react-router-dom'
import { LocationPicker } from '@/components/common/LocationPicker'
import { Checkbox } from '@/components/ui/Checkbox'
import { useCategoriesQuery } from '@/features/categories/hooks'
import type { Category } from '@/types/doctor'

const schema = z.object({
  full_name: z.string().min(3, 'الاسم مطلوب'),
  specialty: z.string().min(3, 'أدخل تخصصاً واضحاً'),
  license_number: z.string().min(2, 'أدخل رقم الترخيص'),
  gender: z.enum(['male', 'female']),
  bio: z.string().optional(),
  phone: z.string().min(6, 'الهاتف مطلوب'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  languages: z.string().min(2, 'أدخل لغة واحدة على الأقل'),
  years_of_experience: z.string().min(1, 'سنوات الخبرة مطلوبة'),
})

type FormValues = z.infer<typeof schema>

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

export const DoctorProfileFormPage = () => {
  const navigate = useNavigate()
  const { data: doctor, isLoading } = useDoctorProfileQuery()
  const categoriesQuery = useCategoriesQuery()
  const saveProfile = useSaveDoctorProfile()
  const mediaUpload = useDoctorMediaUpload()
  const mediaDelete = useDoctorMediaDelete()

  const [clinics, setClinics] = useState<ClinicForm[]>([{ address: '', city: '' }])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const flattenedCategories = useMemo(
    () => flattenCategories(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  )

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { gender: 'male' },
  })

  useEffect(() => {
    if (doctor) {
      reset({
        full_name: doctor.full_name,
        specialty: doctor.specialty,
        bio: doctor.bio ?? '',
        license_number: doctor.license_number ?? '',
        gender: (doctor.gender as 'male' | 'female') ?? 'male',
        phone: doctor.phone ?? '',
        city: doctor.city ?? '',
        languages: doctor.languages?.join(',') ?? '',
        years_of_experience: doctor.years_of_experience?.toString() ?? '',
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
    }
  }, [doctor, reset])

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

  const onSubmit = (values: FormValues) => {
    const languagesList =
      values.languages?.split(',').map((lang) => lang.trim()).filter((lang) => lang.length > 0) ?? []

    if (languagesList.length === 0) {
      toast.error('أدخل لغة واحدة على الأقل')
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
      toast.error('أضف عيادة واحدة على الأقل مع المدينة والعنوان')
      return
    }

    const payload = {
      ...values,
      languages: languagesList,
      categories: selectedCategories,
      clinics: cleanedClinics,
      insurances: doctor?.insurances ?? [],
      qualifications: doctor?.qualifications ?? [],
      years_of_experience: Number(values.years_of_experience),
    }
    saveProfile.mutate(payload, {
      onSuccess: (savedDoctor) => {
        toast.success('تم حفظ الملف وإرساله للمراجعة')
        if (savedDoctor.status === 'pending') {
          navigate('/doctor/pending', { replace: true })
        }
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, 'تعذر حفظ الملف'))
      },
    })
  }

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
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

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>, collection: 'documents' | 'gallery') => {
    if (!event.target.files?.length) return
    const formData = new FormData()
    formData.append('collection', collection)
    Array.from(event.target.files).forEach((file) => formData.append('files[]', file))
    mediaUpload.mutate(formData, {
      onSuccess: () => toast.success('تم رفع الملفات'),
      onError: () => toast.error('فشل رفع الملفات'),
    })
  }

  const handleMediaDelete = (mediaId: number) => {
    mediaDelete.mutate(mediaId, {
      onSuccess: () => toast.success('تم حذف الملف'),
    })
  }

  if (isLoading) {
    return <div className="text-slate-500">جارٍ تحميل الملف...</div>
  }

  const isNewDoctor = !doctor

  return (
    <div className="space-y-8">
      {isNewDoctor && (
        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
          لم يتم إرسال ملفك بعد، ابدأ بإضافة بياناتك الأساسية أدناه.
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-card"
      >
        <div>
          <h2 className="text-xl font-semibold text-slate-900">البيانات الأساسية</h2>
          <p className="text-sm text-slate-500">تأكد من مطابقة الاسم والتخصص للوثائق الرسمية.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-slate-500">الاسم الكامل</label>
            <Input {...register('full_name')} />
          </div>
          <div>
            <label className="text-xs text-slate-500">التخصص</label>
            <Input {...register('specialty')} />
          </div>
          <div>
            <label className="text-xs text-slate-500">رقم الترخيص</label>
            <Input {...register('license_number')} />
          </div>
          <div>
            <label className="text-xs text-slate-500">الجنس</label>
            <select {...register('gender')} className="w-full rounded-2xl border border-slate-200 px-3 py-2">
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">المدينة الأساسية</label>
            <Input {...register('city')} />
          </div>
          <div>
            <label className="text-xs text-slate-500">الهاتف</label>
            <Input {...register('phone')} />
          </div>
          <div>
            <label className="text-xs text-slate-500">اللغات (مفصولة بفاصلة)</label>
            <Input {...register('languages')} />
          </div>
          <div>
            <label className="text-xs text-slate-500">سنوات الخبرة</label>
            <Input type="number" {...register('years_of_experience')} />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500">نبذة تعريفية</label>
          <Textarea rows={4} {...register('bio')} />
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
          <div>
            <h3 className="font-semibold text-slate-900">التصنيفات العلاجية</h3>
            <p className="text-xs text-slate-500">اختر التصنيفات التي تندرج تحتها ممارستك كما حددها المشرف.</p>
          </div>
          {categoriesQuery.isLoading ? (
            <p className="text-sm text-slate-500">جارٍ تحميل التصنيفات...</p>
          ) : flattenedCategories.length > 0 ? (
            <div className="space-y-2">
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
            <p className="text-sm text-slate-500">لا توجد تصنيفات متاحة حالياً.</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">العيادات</h3>
            <Button type="button" variant="outline" onClick={addClinic}>
              إضافة عيادة
            </Button>
          </div>
          {clinics.map((clinic, index) => (
            <div key={index} className="grid gap-4 rounded-2xl border border-slate-100 p-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-slate-500">المدينة</label>
                <Input value={clinic.city} onChange={(e) => handleClinicChange(index, 'city', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-500">العنوان</label>
                <Input value={clinic.address} onChange={(e) => handleClinicChange(index, 'address', e.target.value)} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs text-slate-500">حدد موقع العيادة على الخريطة</label>
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

        <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
          <div>
            <p className="font-semibold text-slate-900">الوثائق الرسمية</p>
            <p className="text-xs text-slate-500">ارفع رخصة الممارسة أو الاعتماد المهني.</p>
          </div>
          <Input type="file" multiple className="max-w-xs" onChange={(event) => handleMediaUpload(event, 'documents')} />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
          <div>
            <p className="font-semibold text-slate-900">صور العيادة</p>
            <p className="text-xs text-slate-500">أضف صور عالية الجودة لعيادتك.</p>
          </div>
          <Input type="file" multiple className="max-w-xs" onChange={(event) => handleMediaUpload(event, 'gallery')} />
        </div>

        <Button type="submit" disabled={saveProfile.isPending}>
          {saveProfile.isPending ? 'جارٍ الحفظ...' : 'حفظ وإرسال للمراجعة'}
        </Button>
      </form>

      {doctor?.media && doctor.media.gallery.length > 0 && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h3 className="font-semibold text-slate-900">الوسائط المرفوعة</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {doctor.media.gallery.map((media) => (
              <div key={media.id} className="relative">
                <img src={media.url} alt={media.name} className="h-32 w-full rounded-2xl object-cover" />
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-full bg-white/80 px-2 py-1 text-xs text-red-500"
                  onClick={() => handleMediaDelete(media.id)}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorProfileFormPage
