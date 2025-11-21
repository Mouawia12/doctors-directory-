import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Heart, Phone, Globe, Mail, Video } from 'lucide-react'
import { useDoctorQuery } from '@/features/doctors/hooks'
import { useAuthQuery } from '@/features/auth/hooks'
import { MapWidget } from '@/components/common/MapWidget'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { useTranslation } from 'react-i18next'

export const DoctorProfilePage = () => {
  const { id } = useParams()
  const { data: doctor, isLoading } = useDoctorQuery(id ?? '')
  const { data: authUser } = useAuthQuery()
  const { t } = useTranslation()

  const canEdit = authUser?.id && doctor?.user?.id && authUser.id === doctor.user.id
  const languages = doctor?.languages ?? []
  const therapyTags = useMemo(() => {
    if (!doctor) return []
    const tags: string[] = []
    if (doctor.specialty) tags.push(doctor.specialty)
    if (doctor.sub_specialty) tags.push(doctor.sub_specialty)
    return [...tags, ...(doctor.qualifications ?? [])]
  }, [doctor?.specialty, doctor?.sub_specialty, doctor?.qualifications])

  if (isLoading) {
    return (
      <div className="container text-center text-slate-500">
        {t('doctorProfile.loading')}
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="container">
        <EmptyState title={t('doctorProfile.notFound')} />
      </div>
    )
  }

  const heroImage =
    doctor.media?.avatar?.url ||
    doctor.media?.gallery?.[0]?.url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.full_name)}&background=0D7DF5&color=fff`
  const serviceDeliveryLabel = doctor.service_delivery
    ? t(`doctorProfile.deliveryModes.${doctor.service_delivery}`, {
        defaultValue: t('doctorProfile.deliveryModes.default'),
      })
    : t('doctorProfile.deliveryModes.default')
  const newClientsStatusLabel = doctor.new_clients_status
    ? t(`doctorProfile.newClients.${doctor.new_clients_status}`, {
        defaultValue: t('doctorProfile.newClients.default'),
      })
    : t('doctorProfile.newClients.default')
  const aboutParagraphs = [
    doctor.about_paragraph_one,
    doctor.about_paragraph_two,
    doctor.about_paragraph_three,
  ].filter((paragraph): paragraph is string => Boolean(paragraph))
  const paymentMethods = doctor.payment_methods ?? []
  const therapyModalities = doctor.therapy_modalities ?? []
  const alliedCommunities = doctor.allied_communities ?? []
  const clientParticipants = doctor.client_participants ?? []
  const clientAgeGroups = doctor.client_age_groups ?? []
  const insurances = doctor.insurances ?? []
  const introVideo = doctor.media?.intro_video?.url
  const newClientsIntro = doctor.new_clients_intro
  const formatCurrency = (value?: number) =>
    typeof value === 'number' && !Number.isNaN(value)
      ? `${value.toLocaleString()} ${t('doctorProfile.feeCurrency')}`
      : t('doctorProfile.notProvided')

  const schema = {
    '@context': 'https://schema.org',
    '@type': doctor.clinics && doctor.clinics.length > 0 ? 'MedicalClinic' : 'Physician',
    name: doctor.full_name,
    description: doctor.bio,
    medicalSpecialty: doctor.specialty,
    address: doctor.clinics?.[0]
      ? {
          '@type': 'PostalAddress',
          addressLocality: doctor.clinics[0].city,
          streetAddress: doctor.clinics[0].address,
        }
      : undefined,
    telephone: doctor.phone,
    url: doctor.website,
  }

  return (
    <div className="container space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="rounded-[32px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-6 shadow-card">
        <div className="grid gap-6 md:grid-cols-[260px,1fr]">
          <div className="relative">
            <img src={heroImage} alt={doctor.full_name} className="h-60 w-full rounded-[28px] object-cover" loading="lazy" />
            {doctor.is_verified && (
              <Badge className="absolute left-4 top-4 bg-emerald-50 text-emerald-700">
                {t('doctorProfile.verified')}
              </Badge>
            )}
          </div>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-900">{doctor.full_name}</h1>
              <StatusBadge status={doctor.status} />
            </div>
            {doctor.tagline && <p className="text-lg font-medium text-primary-700">{doctor.tagline}</p>}
            <p className="text-base text-slate-600">
              {doctor.bio || t('doctorProfile.bioFallback')}
            </p>
            <div className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-slate-400">{t('doctorProfile.experience')}</p>
                <p className="text-lg font-semibold text-slate-900">
                  {doctor.years_of_experience ?? 0} {t('doctorProfile.years')}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">{t('doctorProfile.license')}</p>
                <p className="text-lg font-semibold text-slate-900">
                  {doctor.license_number || t('doctorProfile.notProvided')}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">{t('doctorProfile.serviceDelivery')}</p>
                <p className="text-lg font-semibold text-slate-900">{serviceDeliveryLabel}</p>
                <p className="text-xs text-primary-600">{newClientsStatusLabel}</p>
              </div>
            </div>
            {newClientsIntro && (
              <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/70 p-3 text-sm text-primary-900">
                {newClientsIntro}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <span key={language} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                  {language.toUpperCase()}
                </span>
              ))}
            </div>
            <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              {doctor.phone && (
                <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/70 p-3">
                  <Phone className="h-4 w-4 text-primary-500" />
                  <a href={`tel:${doctor.phone}`} className="font-medium text-slate-900">
                    {doctor.phone}
                  </a>
                </div>
              )}
              {doctor.email && (
                <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/70 p-3">
                  <Mail className="h-4 w-4 text-primary-500" />
                  <a href={`mailto:${doctor.email}`} className="font-medium text-slate-900">
                    {doctor.email}
                  </a>
                </div>
              )}
              {doctor.website && (
                <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/70 p-3">
                  <Globe className="h-4 w-4 text-primary-500" />
                  <a href={doctor.website} target="_blank" rel="noreferrer" className="font-medium text-primary-700 underline">
                    {translate('زيارة الموقع', 'Visit website')}
                  </a>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={doctor.whatsapp ? `https://wa.me/${doctor.whatsapp}` : `tel:${doctor.phone}`}>
                  {translate('حجز جلسة', 'Book a session')}
                </a>
              </Button>
              {canEdit && (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/doctor/profile">{translate('تعديل الملف', 'Edit profile')}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {(aboutParagraphs.length > 0 || doctor.bio) && (
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-slate-900">
            {t('doctorProfile.aboutTitle')}
          </h2>
          <p className="text-sm text-slate-500">
            {t('doctorProfile.aboutCopy')}
          </p>
          <div className="mt-4 space-y-4 text-slate-700">
            {aboutParagraphs.length > 0
              ? aboutParagraphs.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))
              : doctor.bio && <p className="leading-relaxed">{doctor.bio}</p>}
          </div>
        </section>
      )}

      {introVideo && (
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="flex items-center gap-3">
            <Video className="h-5 w-5 text-primary-500" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {t('doctorProfile.introVideo')}
              </h2>
              <p className="text-sm text-slate-500">
                {t('doctorProfile.newClientsIntro')}
              </p>
            </div>
          </div>
          <video controls className="mt-4 w-full rounded-3xl border border-slate-100" src={introVideo} />
        </section>
      )}

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.focusTitle')}</h2>
            <p className="text-sm text-slate-500">
              {t('doctorProfile.focusCopy')}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-xs text-slate-500">
            <Heart className="h-4 w-4" /> {t('doctorProfile.focusChip')}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {therapyTags.length > 0 ? (
            therapyTags.map((tag) => (
              <span key={tag} className="rounded-full bg-primary-50 px-4 py-1 text-xs text-primary-700">
                {tag}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              {t('doctorProfile.focusEmpty')}
            </p>
          )}
        </div>
        {doctor.specialties_note && (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{doctor.specialties_note}</p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.financesTitle')}</h2>
        <p className="text-sm text-slate-500">
          {t('doctorProfile.financesCopy')}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase text-slate-400">{t('doctorProfile.individualSession')}</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(doctor.fee_individual)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase text-slate-400">{t('doctorProfile.couplesSession')}</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(doctor.fee_couples)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase text-slate-400">{t('doctorProfile.slidingScale')}</p>
            <p className="text-lg font-semibold text-slate-900">
              {doctor.offers_sliding_scale
                ? t('doctorProfile.slidingAvailable')
                : t('doctorProfile.slidingUnavailable')}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.paymentMethods')}</p>
            {paymentMethods.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span key={method} className="rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700">
                    {method}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.paymentEmpty')}</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.insurance')}</p>
            {insurances.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {insurances.map((insurance) => (
                  <li key={insurance}>{insurance}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.insuranceEmpty')}</p>
            )}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {doctor.npi_number && (
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs text-slate-500">NPI</p>
              <p className="font-semibold text-slate-900">{doctor.npi_number}</p>
            </div>
          )}
          {doctor.liability_carrier && (
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs text-slate-500">{t('doctorProfile.liability')}</p>
              <p className="font-semibold text-slate-900">{doctor.liability_carrier}</p>
            </div>
          )}
          {doctor.liability_expiration && (
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs text-slate-500">{t('doctorProfile.validThrough')}</p>
              <p className="font-semibold text-slate-900">
                {new Date(doctor.liability_expiration).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.clientFocusTitle')}</h2>
        <p className="text-sm text-slate-500">{t('doctorProfile.clientFocusCopy')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.participants')}</p>
            {clientParticipants.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {clientParticipants.map((item) => (
                  <span key={item} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.participantsEmpty')}</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.ageGroups')}</p>
            {clientAgeGroups.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {clientAgeGroups.map((item) => (
                  <span key={item} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.ageGroupsEmpty')}</p>
            )}
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.languages')}</p>
            {languages.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {languages.map((language) => (
                  <span key={language} className="rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700">
                    {language.toUpperCase()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.languagesEmpty')}</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.faithOrientation')}</p>
            <p className="mt-2 font-semibold text-slate-900">
              {doctor.faith_orientation
                ? doctor.faith_orientation
                : t('doctorProfile.faithAny')}
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500">{t('doctorProfile.alliedCommunities')}</p>
          {alliedCommunities.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {alliedCommunities.map((item) => (
                <span key={item} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.alliedEmpty')}</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.treatmentTitle')}</h2>
        <p className="text-sm text-slate-500">
          {t('doctorProfile.treatmentCopy')}
        </p>
        <div className="mt-4">
          {therapyModalities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {therapyModalities.map((item) => (
                <span key={item} className="rounded-full bg-primary-50 px-4 py-1 text-xs text-primary-700">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t('doctorProfile.treatmentEmpty')}</p>
          )}
        </div>
        {doctor.treatment_note && (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{doctor.treatment_note}</p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.clinicsTitle')}</h2>
        {doctor.clinics && doctor.clinics.length > 0 ? (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {doctor.clinics.map((clinic) => (
                <div key={clinic.id} className="rounded-2xl border border-slate-100 p-4">
                  <p className="font-semibold text-slate-800">{clinic.city}</p>
                  <p className="text-sm text-slate-500">{clinic.address}</p>
                  {clinic.work_hours && (
                    <p className="mt-2 text-xs text-slate-500">
                      {t('doctorProfile.workingHours')}: {JSON.stringify(clinic.work_hours)}
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
                    title: clinic.city,
                  }))}
              />
            </div>
          </>
        ) : (
          <EmptyState title={t('doctorProfile.clinicsEmpty')} />
        )}
      </section>

      {doctor.media && doctor.media.gallery.length > 0 && (
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.mediaTitle')}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {doctor.media.gallery.map((media) => (
              <img key={media.id} src={media.url} alt={media.name} className="h-48 w-full rounded-2xl object-cover" />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-card md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.contactTitle')}</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            {doctor.phone && <p>{t('doctorProfile.phone')}: {doctor.phone}</p>}
            {doctor.whatsapp && <p>{t('doctorProfile.whatsapp')}: {doctor.whatsapp}</p>}
            {doctor.email && <p>{t('doctorProfile.email')}: {doctor.email}</p>}
            {doctor.website && (
              <p>
                {t('doctorProfile.website')}: {' '}
                <a className="text-primary-600 underline" href={doctor.website} target="_blank" rel="noreferrer">
                  {doctor.website}
                </a>
              </p>
            )}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{t('doctorProfile.therapistNote')}</p>
          <p className="mt-2">
            {doctor.status_note ||
              t('doctorProfile.defaultNote')}
          </p>
        </div>
      </section>
    </div>
  )
}

export default DoctorProfilePage
