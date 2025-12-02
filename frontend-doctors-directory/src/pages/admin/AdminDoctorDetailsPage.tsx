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
const normalizeIdentityList = (value?: string[]) => (Array.isArray(value) && value.length > 0 ? value : [])

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
  const avatarMedia = doctor.media?.avatar
  const introVideoMedia = doctor.media?.intro_video
  const listSeparator = t('common.comma')
  const paymentMethods = doctor.payment_methods ?? []
  const identityTraits = (doctor.identity_traits as Record<string, any> | undefined) ?? {}
  const identityGender = normalizeIdentityList(identityTraits.gender_identity)
  const identityEthnicity = normalizeIdentityList(identityTraits.ethnicity)
  const identityLgbtq = normalizeIdentityList(identityTraits.lgbtqia)
  const additionalCredentials = doctor.additional_credentials ?? []
  const clientParticipants = doctor.client_participants ?? []
  const clientAgeGroups = doctor.client_age_groups ?? []
  const alliedCommunities = doctor.allied_communities ?? []
  const therapyModalities = doctor.therapy_modalities ?? []
  const aboutParagraphs = [
    doctor.about_paragraph_one,
    doctor.about_paragraph_two,
    doctor.about_paragraph_three,
  ].filter((value): value is string => Boolean(value && value.trim().length > 0))
  const formatBoolean = (value?: boolean | null) => {
    if (value === undefined || value === null) return '—'
    return value ? t('adminDoctorDetails.booleanYes') : t('adminDoctorDetails.booleanNo')
  }
  const serviceDeliveryLabel = doctor.service_delivery
    ? t(`doctorForm.contact.serviceOptions.${doctor.service_delivery}`)
    : '—'
  const newClientsStatusLabel = doctor.new_clients_status
    ? t(`doctorForm.contact.newClientOptions.${doctor.new_clients_status}`)
    : '—'
  const displayNameLabel = doctor.display_name_preference
    ? t(`adminDoctorDetails.displayNameOptions.${doctor.display_name_preference}`)
    : '—'

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

  const canApprove = doctor.status !== 'approved'
  const canReject = doctor.status !== 'rejected'

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
            {canApprove && (
              <Button disabled={moderationMutation.isPending} onClick={() => submitModeration('approve')}>
                {t('adminDoctorDetails.approve')}
              </Button>
            )}
            {canReject && (
              <Button
                variant="outline"
                disabled={moderationMutation.isPending}
                onClick={() => submitModeration('reject')}
              >
                {t('adminDoctorDetails.reject')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('adminDoctorDetails.servicePreferences')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.serviceDelivery')}</p>
            <p className="text-sm text-slate-700">{serviceDeliveryLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.newClientsStatus')}</p>
            <p className="text-sm text-slate-700">{newClientsStatusLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.offersIntroCall')}</p>
            <p className="text-sm text-slate-700">{formatBoolean(doctor.offers_intro_call)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.faithOrientation')}</p>
            <p className="text-sm text-slate-700">{doctor.faith_orientation || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.specialtiesNote')}</p>
            <p className="text-sm text-slate-700">{doctor.specialties_note || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.treatmentNote')}</p>
            <p className="text-sm text-slate-700">{doctor.treatment_note || '—'}</p>
          </div>
        </div>
        {doctor.new_clients_intro && (
          <div className="mt-4 rounded-2xl bg-primary-50/60 p-4 text-sm text-primary-800">
            <p className="text-xs uppercase text-primary-600">{t('adminDoctorDetails.newClientsIntro')}</p>
            <p className="mt-2">{doctor.new_clients_intro}</p>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('adminDoctorDetails.clientFocus')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.clientParticipants')}</p>
            {clientParticipants.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {clientParticipants.map((item) => (
                  <span key={item} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">—</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.clientAgeGroups')}</p>
            {clientAgeGroups.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {clientAgeGroups.map((item) => (
                  <span key={item} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">—</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.alliedCommunities')}</p>
            {alliedCommunities.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {alliedCommunities.map((item) => (
                  <span key={item} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">—</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.therapyModalities')}</p>
            {therapyModalities.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {therapyModalities.map((item) => (
                  <span key={item} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">—</p>
            )}
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
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.tagline')}</p>
            <p className="text-sm text-slate-700">{doctor.tagline || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.pronouns')}</p>
            <p className="text-sm text-slate-700">{doctor.preferred_pronouns || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.displayName')}</p>
            <p className="text-sm text-slate-700">{displayNameLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.businessName')}</p>
            <p className="text-sm text-slate-700">{doctor.business_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.languages')}</p>
            <p className="text-sm text-slate-700">{doctor.languages?.join(listSeparator) || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.insurances')}</p>
            <p className="text-sm text-slate-700">{doctor.insurances?.join(listSeparator) || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.professionalRole')}</p>
            <p className="text-sm text-slate-700">{doctor.professional_role || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.licensureStatus')}</p>
            <p className="text-sm text-slate-700">
              {doctor.licensure_status
                ? t(`adminDoctorForm.licensureOptions.${doctor.licensure_status}`)
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.licenseState')}</p>
            <p className="text-sm text-slate-700">{doctor.license_state || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.licenseExpiration')}</p>
            <p className="text-sm text-slate-700">{doctor.license_expiration ? formatDate(doctor.license_expiration) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.qualifications')}</p>
            <p className="text-sm text-slate-700">{doctor.qualifications?.join(listSeparator) || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.additionalCredentials')}</p>
            {additionalCredentials.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {additionalCredentials.map((credential) => (
                  <span key={credential} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                    {credential}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">—</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.education')}</p>
            <p className="text-sm text-slate-700">
              {doctor.education_institution || doctor.education_degree
                ? [doctor.education_degree, doctor.education_institution, doctor.education_graduation_year]
                    .filter(Boolean)
                    .join(' — ')
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.practiceStart')}</p>
            <p className="text-sm text-slate-700">{doctor.practice_start_year || '—'}</p>
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
        {doctor.qualifications_note && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-xs uppercase text-slate-500">{t('adminDoctorDetails.qualificationsNote')}</p>
            <p className="mt-2">{doctor.qualifications_note}</p>
          </div>
        )}
        {aboutParagraphs.length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.aboutSections')}</p>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-700">
              {aboutParagraphs.map((paragraph, index) => (
                <li key={index}>{paragraph}</li>
              ))}
            </ol>
          </div>
        )}
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
            {t('adminDoctorDetails.mobilePhone')}: {doctor.mobile_phone ? <PhoneNumber value={doctor.mobile_phone} className="text-slate-900" /> : '—'}
          </p>
          <p className="text-sm text-slate-600">
            {t('adminDoctorDetails.mobileCanText')}: {formatBoolean(doctor.mobile_can_text)}
          </p>
          <p className="text-sm text-slate-600">
            {t('doctorProfile.email')}: {doctor.email || '—'}
          </p>
          <p className="text-sm text-slate-600">
            {t('adminDoctorDetails.appointmentEmail')}: {doctor.appointment_email || '—'}
          </p>
          <p className="text-sm text-slate-600">
            {t('adminDoctorDetails.acceptsEmails')}: {formatBoolean(doctor.accepts_email_messages)}
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
          <p className="text-sm text-slate-600">
            {t('adminDoctorDetails.baseCity')}: {doctor.city || '—'}
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('adminDoctorDetails.finances')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase text-slate-400">{t('doctorProfile.individualSession')}</p>
            <p className="text-lg font-semibold text-slate-900">
              {doctor.fee_individual ? `${doctor.fee_individual} ${t('common.currency')}` : t('doctorProfile.notProvided')}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase text-slate-400">{t('doctorProfile.couplesSession')}</p>
            <p className="text-lg font-semibold text-slate-900">
              {doctor.fee_couples ? `${doctor.fee_couples} ${t('common.currency')}` : t('doctorProfile.notProvided')}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase text-slate-400">{t('doctorProfile.slidingScale')}</p>
            <p className="text-lg font-semibold text-slate-900">
              {doctor.offers_sliding_scale ? t('doctorProfile.slidingAvailable') : t('doctorProfile.slidingUnavailable')}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.paymentMethods')}</p>
            {paymentMethods.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span key={method} className="rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700">
                    {method}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('adminDoctorDetails.paymentEmpty')}</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('adminDoctorDetails.npi')}</p>
            <p className="text-sm font-semibold text-slate-900">{doctor.npi_number || t('doctorProfile.notProvided')}</p>
            <p className="mt-4 text-xs text-slate-500">{t('adminDoctorDetails.liability')}</p>
            <p className="text-sm font-semibold text-slate-900">
              {doctor.liability_carrier || t('doctorProfile.notProvided')}
              {doctor.liability_expiration && (
                <span className="text-xs text-slate-500"> — {dayjs(doctor.liability_expiration).format('DD MMM YYYY')}</span>
              )}
            </p>
          </div>
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

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('adminDoctorDetails.identity')}</h2>
        {identityGender.length === 0 && identityEthnicity.length === 0 && identityLgbtq.length === 0 && !identityTraits.other ? (
          <p className="text-sm text-slate-500">{t('adminDoctorDetails.identityEmpty')}</p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs uppercase text-slate-400">{t('doctorProfile.identityGender')}</p>
                {identityGender.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {identityGender.map((item) => (
                      <span key={item} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">—</p>
                )}
              </div>
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs uppercase text-slate-400">{t('doctorProfile.identityEthnicity')}</p>
                {identityEthnicity.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {identityEthnicity.map((item) => (
                      <span key={item} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">—</p>
                )}
              </div>
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs uppercase text-slate-400">{t('doctorProfile.identityLgbtq')}</p>
                {identityLgbtq.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {identityLgbtq.map((item) => (
                      <span key={item} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">—</p>
                )}
              </div>
            </div>
            {(identityTraits.other || identityTraits.birth_year) && (
              <div className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
                {identityTraits.birth_year && (
                  <p className="font-semibold text-slate-900">
                    {t('doctorProfile.identityBirthYear')}: {identityTraits.birth_year}
                  </p>
                )}
                {identityTraits.other && (
                  <p className="mt-1">
                    {t('doctorProfile.identityOther')}: {identityTraits.other}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {(avatarMedia || introVideoMedia) && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('adminDoctorDetails.mediaOverview')}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">{t('adminDoctorDetails.avatarPreview')}</p>
              {avatarMedia ? (
                <img
                  src={avatarMedia.url}
                  alt={avatarMedia.name}
                  className="mt-2 h-60 w-full rounded-2xl object-cover"
                />
              ) : (
                <p className="mt-2 text-sm text-slate-500">{t('adminDoctorDetails.mediaEmpty')}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('adminDoctorDetails.introVideo')}</p>
              {introVideoMedia ? (
                <video controls className="mt-2 w-full rounded-2xl" src={introVideoMedia.url} />
              ) : (
                <p className="mt-2 text-sm text-slate-500">{t('adminDoctorDetails.mediaEmpty')}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('adminDoctorDetails.documents')}</h2>
        {documents.length > 0 ? (
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
        ) : (
          <p className="text-sm text-slate-500">{t('adminDoctorDetails.mediaEmpty')}</p>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t('adminDoctorDetails.gallery')}</h2>
        {gallery.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-4">
            {gallery.map((media) => (
              <img key={media.id} src={media.url} alt={media.name} className="h-40 w-full rounded-2xl object-cover" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t('adminDoctorDetails.mediaEmpty')}</p>
        )}
      </Card>
    </div>
  )
}

export default AdminDoctorDetailsPage
