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
import { ClinicWorkHours } from '@/components/common/ClinicWorkHours'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { useTranslation } from 'react-i18next'
import { PhoneNumber } from '@/components/common/PhoneNumber'

const formatDate = (value?: string) => (value ? dayjs(value).format('DD MMM YYYY') : '—')

export const AdminDoctorDetailsPage = () => {
  const { t } = useTranslation()
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
    return <div className="text-slate-500">{t('adminDoctorDetails.loading')}</div>
  }

  if (!doctor) {
    return (
      <EmptyState
        title={t('adminDoctorDetails.notFound')}
        description={t('adminDoctorDetails.notFoundDescription')}
      />
    )
  }

  const documents = doctor.media?.documents ?? []
  const gallery = doctor.media?.gallery ?? []
  const listSeparator = t('common.comma')

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
              ? t('adminDoctorDetails.approveSuccess')
              : t('adminDoctorDetails.statusUpdated'),
          )
        },
        onError: () => toast.error(t('adminDoctorDetails.statusError')),
      },
    )
  }

  const handleDelete = () => {
    if (
      !window.confirm(t('adminDoctorDetails.deleteConfirm'))
    )
      return
    deleteMutation.mutate(doctor.id, {
      onSuccess: () => {
        toast.success(t('adminDoctorDetails.deleteSuccess'))
        navigate('/admin/doctors')
      },
      onError: () => toast.error(t('adminDoctorDetails.deleteError')),
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
              {doctor.is_verified && <Badge variant="success">{t('doctorProfile.verified')}</Badge>}
            </div>
            <p className="text-sm text-slate-500">{doctor.specialty}</p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>
                {t('adminDoctorDetails.meta.license')}: {doctor.license_number || '—'}
              </span>
              <span>
                {t('adminDoctorDetails.meta.experience')}: {doctor.years_of_experience ?? 0}
              </span>
              <span>
                {t('adminDoctorDetails.meta.updated')}: {formatDate(doctor.updated_at)}
              </span>
              <span>
                {t('adminDoctorDetails.meta.created')}: {formatDate(doctor.created_at)}
              </span>
            </div>
            {doctor.user && (
              <p className="text-sm text-slate-600">
                {t('adminDoctorDetails.meta.linkedUser')}: {doctor.user.name} - {doctor.user.email}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button variant="outline" onClick={() => navigate(`/admin/doctors/${doctor.id}/edit`)}>
              {t('adminDoctorDetails.actions.edit')}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/doctors/${doctor.id}`)}>
              {t('adminDoctorDetails.actions.view')}
            </Button>
            <Button variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={handleDelete}>
              {t('adminDoctorDetails.actions.delete')}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              {t('adminDoctorDetails.statusNote')}
            </label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t('adminDoctorDetails.statusPlaceholder')}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button disabled={moderationMutation.isPending} onClick={() => submitModeration('approve')}>
              {t('adminDoctorDetails.approve')}
            </Button>
            <Button
              variant="outline"
              disabled={moderationMutation.isPending}
              onClick={() => submitModeration('reject')}
            >
              {t('adminDoctorDetails.reject')}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('adminDoctorDetails.generalInfo')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.summary')}</p>
            <p className="text-sm text-slate-700">{doctor.bio || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.subSpecialty')}</p>
            <p className="text-sm text-slate-700">{doctor.sub_specialty || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.languages')}</p>
            <p className="text-sm text-slate-700">{doctor.languages?.join(', ') || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.insurances')}</p>
            <p className="text-sm text-slate-700">{doctor.insurances?.join(', ') || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.qualifications')}</p>
            <p className="text-sm text-slate-700">{doctor.qualifications?.join(listSeparator) || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.categories')}</p>
            <p className="text-sm text-slate-700">
              {doctor.categories && doctor.categories.length > 0
                ? doctor.categories.map((category) => category.name).join(listSeparator)
                : '—'}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('adminDoctorDetails.contactInfo')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <p className="text-sm text-slate-600">
            {t('doctorProfile.phone')}: {doctor.phone ? <PhoneNumber value={doctor.phone} className="text-slate-900" /> : '—'}
          </p>
          <p className="text-sm text-slate-600">
            {t('doctorProfile.whatsapp')}: {doctor.whatsapp ? <PhoneNumber value={doctor.whatsapp} className="text-slate-900" /> : '—'}
          </p>
          <p className="text-sm text-slate-600">
            {t('doctorProfile.email')}: {doctor.email || '—'}
          </p>
          <p className="text-sm text-slate-600">
            {t('doctorProfile.website')}: {' '}
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
          {t('adminDoctorDetails.clinics')}
        </h2>
        {doctor.clinics && doctor.clinics.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {doctor.clinics.map((clinic) => (
                <div key={clinic.id} className="rounded-2xl border border-slate-100 p-4">
                  <p className="font-semibold text-slate-800">{clinic.city}</p>
                  <p className="text-sm text-slate-500">{clinic.address}</p>
                  <div className="mt-3">
                    <p className="text-xs text-slate-500">{t('doctorProfile.workingHours')}</p>
                    <ClinicWorkHours workHours={clinic.work_hours} className="mt-2" />
                  </div>
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
          <EmptyState title={t('adminDoctorDetails.emptyClinics')} />
        )}
      </Card>

      {documents.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('adminDoctorDetails.documents')}</h2>
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
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('adminDoctorDetails.gallery')}</h2>
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
