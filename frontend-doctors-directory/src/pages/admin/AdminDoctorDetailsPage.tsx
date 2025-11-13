import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import {
  useAdminDoctorModeration,
  useAdminDoctorQuery,
  useDeleteAdminDoctor,
} from '@/features/admin/hooks'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { MapWidget } from '@/components/common/MapWidget'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { useLocaleText } from '@/app/hooks/useLocaleText'

const formatDate = (value?: string) => (value ? dayjs(value).format('DD MMM YYYY') : '—')

export const AdminDoctorDetailsPage = () => {
  const translate = useLocaleText()
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState('')

  const { data: doctor, isLoading } = useAdminDoctorQuery(doctorId)
  const moderationMutation = useAdminDoctorModeration()
  const deleteMutation = useDeleteAdminDoctor()

  useEffect(() => {
    if (doctor) {
      setNote(doctor.status_note ?? '')
    }
  }, [doctor])

  if (isLoading) {
    return <div className="text-slate-500">{translate('جارٍ تحميل تفاصيل الطبيب...', 'Loading doctor details...')}</div>
  }

  if (!doctor) {
    return (
      <EmptyState
        title={translate('لم يتم العثور على الطبيب', 'Doctor not found')}
        description={translate('تأكد من الرابط أو عد لقائمة الأطباء.', 'Check the link or go back to the doctors list.')}
      />
    )
  }

  const documents = doctor.media?.documents ?? []
  const gallery = doctor.media?.gallery ?? []
  const listSeparator = translate('، ', ', ')

  const submitModeration = (action: 'approve' | 'reject') => {
    moderationMutation.mutate(
      {
        doctorId: doctor.id,
        action,
        note: action === 'reject' ? note : undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            action === 'approve'
              ? translate('تم اعتماد الطبيب', 'Doctor approved')
              : translate('تم تحديث الحالة', 'Status updated'),
          )
        },
        onError: () => toast.error(translate('تعذر تحديث الحالة', 'Unable to update status')),
      },
    )
  }

  const handleDelete = () => {
    if (
      !window.confirm(translate('سيتم حذف ملف الطبيب بشكل نهائي. هل أنت متأكد؟', 'This profile will be deleted permanently. Continue?'))
    )
      return
    deleteMutation.mutate(doctor.id, {
      onSuccess: () => {
        toast.success(translate('تم حذف الملف الطبي', 'Doctor profile deleted'))
        navigate('/admin/doctors')
      },
      onError: () => toast.error(translate('تعذر حذف الطبيب', 'Unable to delete doctor')),
    })
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">{doctor.full_name}</h1>
              <StatusBadge status={doctor.status} />
              {doctor.is_verified && <Badge variant="success">{translate('موثق', 'Verified')}</Badge>}
            </div>
            <p className="text-sm text-slate-500">{doctor.specialty}</p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>
                {translate('رقم الرخصة', 'License ID')}: {doctor.license_number || translate('—', '—')}
              </span>
              <span>
                {translate('سنوات الخبرة', 'Years of experience')}: {doctor.years_of_experience ?? 0}
              </span>
              <span>
                {translate('آخر تحديث', 'Updated')}: {formatDate(doctor.updated_at)}
              </span>
              <span>
                {translate('تاريخ الإنشاء', 'Created at')}: {formatDate(doctor.created_at)}
              </span>
            </div>
            {doctor.user && (
              <p className="text-sm text-slate-600">
                {translate('الحساب المرتبط', 'Linked user')}: {doctor.user.name} - {doctor.user.email}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button variant="outline" onClick={() => navigate(`/admin/doctors/${doctor.id}/edit`)}>
              {translate('تعديل البيانات', 'Edit details')}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/doctors/${doctor.id}`)}>
              {translate('عرض في الموقع', 'View public profile')}
            </Button>
            <Button variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={handleDelete}>
              {translate('حذف الطبيب', 'Delete doctor')}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              {translate('ملاحظة الحالة / سبب الرفض', 'Status note / rejection reason')}
            </label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={translate('اكتب ملاحظة تظهر للطبيب عند الرفض', 'Write a note visible to the doctor')}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button disabled={moderationMutation.isPending} onClick={() => submitModeration('approve')}>
              {translate('اعتماد', 'Approve')}
            </Button>
            <Button
              variant="outline"
              disabled={moderationMutation.isPending}
              onClick={() => submitModeration('reject')}
            >
              {translate('رفض وإرسال الملاحظة', 'Reject and send note')}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{translate('معلومات عامة', 'General info')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">{translate('الملخص المهني', 'Professional summary')}</p>
            <p className="text-sm text-slate-700">{doctor.bio || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{translate('التخصص الفرعي', 'Sub specialty')}</p>
            <p className="text-sm text-slate-700">{doctor.sub_specialty || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{translate('اللغات', 'Languages')}</p>
            <p className="text-sm text-slate-700">{doctor.languages?.join(', ') || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{translate('شركات التأمين', 'Insurances')}</p>
            <p className="text-sm text-slate-700">{doctor.insurances?.join(', ') || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{translate('المؤهلات', 'Qualifications')}</p>
            <p className="text-sm text-slate-700">{doctor.qualifications?.join(listSeparator) || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{translate('التصنيفات', 'Categories')}</p>
            <p className="text-sm text-slate-700">
              {doctor.categories && doctor.categories.length > 0
                ? doctor.categories.map((category) => category.name).join(listSeparator)
                : '—'}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{translate('معلومات التواصل', 'Contact info')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <p className="text-sm text-slate-600">
            {translate('الهاتف', 'Phone')}: {doctor.phone || '—'}
          </p>
          <p className="text-sm text-slate-600">
            {translate('واتساب', 'WhatsApp')}: {doctor.whatsapp || '—'}
          </p>
          <p className="text-sm text-slate-600">
            {translate('البريد الإلكتروني', 'Email')}: {doctor.email || '—'}
          </p>
          <p className="text-sm text-slate-600">
            {translate('الموقع الإلكتروني', 'Website')}:{' '}
            {doctor.website ? (
              <a href={doctor.website} target="_blank" rel="noreferrer" className="text-primary-600 underline">
                {doctor.website}
              </a>
            ) : (
              '—'
            )}
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {translate('العيادات والمواقع', 'Clinics & locations')}
        </h2>
        {doctor.clinics && doctor.clinics.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {doctor.clinics.map((clinic) => (
                <div key={clinic.id} className="rounded-2xl border border-slate-100 p-4">
                  <p className="font-semibold text-slate-800">{clinic.city}</p>
                  <p className="text-sm text-slate-500">{clinic.address}</p>
                  {clinic.work_hours && (
                    <p className="mt-2 text-xs text-slate-500">
                      {translate('ساعات العمل', 'Working hours')}: {JSON.stringify(clinic.work_hours)}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <MapWidget
                markers={doctor.clinics
                  .filter((clinic) => clinic.lat && clinic.lng)
                  .map((clinic) => ({
                    lat: clinic.lat as number,
                    lng: clinic.lng as number,
                    title: `${clinic.city} - ${clinic.address}`,
                  }))}
              />
            </div>
          </>
        ) : (
          <EmptyState title={translate('لا توجد عيادات مسجلة', 'No clinics yet')} />
        )}
      </Card>

      {documents.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{translate('المستندات', 'Documents')}</h2>
          <div className="flex flex-wrap gap-3">
            {documents.map((document) => (
              <a
                key={document.id}
                href={document.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-primary-600"
              >
                {document.name}
              </a>
            ))}
          </div>
        </Card>
      )}

      {gallery.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{translate('المعرض', 'Gallery')}</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {gallery.map((media) => (
              <img key={media.id} src={media.url} alt={media.name} className="h-40 w-full rounded-2xl object-cover" />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AdminDoctorDetailsPage
