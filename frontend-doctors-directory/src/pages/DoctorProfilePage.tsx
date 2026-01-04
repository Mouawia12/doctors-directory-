import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Phone, Globe, Mail, X } from 'lucide-react'
import clsx from 'clsx'
import { useDoctorQuery } from '@/features/doctors/hooks'
import { useAuthQuery } from '@/features/auth/hooks'
import { MapWidget } from '@/components/common/MapWidget'
import { ClinicWorkHours } from '@/components/common/ClinicWorkHours'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { useTranslation } from 'react-i18next'
import { PhoneNumber } from '@/components/common/PhoneNumber'
import { buildTelLink, buildWhatsAppLink } from '@/lib/phone'
import { languageLabel } from '@/lib/language'
import { formatSpecialtyList } from '@/lib/doctor'
import type { MediaItem } from '@/types/doctor'

export const DoctorProfilePage = () => {
  const { id } = useParams()
  const { data: doctor, isLoading } = useDoctorQuery(id ?? '')
  const { data: authUser } = useAuthQuery()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null)

  const canEdit = authUser?.id && doctor?.user?.id && authUser.id === doctor.user.id
  const languages = doctor?.languages ?? []
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
  const paymentMethods = doctor.payment_methods ?? []
  const aboutParagraphs = [
    doctor.about_paragraph_one,
    doctor.about_paragraph_two,
    doctor.about_paragraph_three,
  ].filter((paragraph): paragraph is string => Boolean(paragraph && paragraph.trim().length > 0))
  const therapyModalities = doctor.therapy_modalities ?? []
  const insurances = doctor.insurances ?? []
  const documents = doctor.media?.documents ?? []
  const qualifications = doctor.qualifications ?? []
  const additionalCredentials = doctor.additional_credentials ?? []
  const listSeparator = t('common.comma')
  const primarySpecialties = formatSpecialtyList(doctor.specialty, listSeparator)
  const secondarySpecialties = formatSpecialtyList(doctor.sub_specialty, listSeparator)
  const licensureStatusLabel = doctor.licensure_status
    ? t(`doctorForm.about.licensureOptions.${doctor.licensure_status}`, { defaultValue: doctor.licensure_status })
    : t('doctorProfile.notProvided')
  const participantLabels = (doctor.client_participants ?? []).map((item) =>
    t(`doctorForm.clientFocus.participantsOptions.${item}`, { defaultValue: item }),
  )
  const ageGroupLabels = (doctor.client_age_groups ?? []).map((item) =>
    t(`doctorForm.clientFocus.ageOptions.${item}`, { defaultValue: item }),
  )
  const alliedLabels = (doctor.allied_communities ?? []).map((item) =>
    t(`doctorForm.clientFocus.alliedOptions.${item}`, { defaultValue: item }),
  )
  const faithLabel = doctor.faith_orientation
    ? t(`doctorForm.clientFocus.faithOptions.${doctor.faith_orientation}`, { defaultValue: doctor.faith_orientation })
    : t('doctorProfile.notProvided')
  const identityTraits = (doctor.identity_traits as Record<string, unknown> | undefined) ?? {}
  const identityGender = Array.isArray(identityTraits.gender_identity)
    ? identityTraits.gender_identity.map((item) =>
        t(`doctorForm.identity.genderOptions.${item}`, { defaultValue: String(item) }),
      )
    : []
  const identityEthnicity = Array.isArray(identityTraits.ethnicity)
    ? identityTraits.ethnicity.map((item) =>
        t(`doctorForm.identity.ethnicityOptions.${item}`, { defaultValue: String(item) }),
      )
    : []
  const identityLgbtq = Array.isArray(identityTraits.lgbtqia)
    ? identityTraits.lgbtqia.map((item) =>
        t(`doctorForm.identity.lgbtqOptions.${item}`, { defaultValue: String(item) }),
      )
    : []
  const telHref = buildTelLink(doctor.phone)
  const whatsappHref = buildWhatsAppLink(doctor.whatsapp)
  const bookingLink = whatsappHref ?? telHref
  const formatCurrency = (value?: number) =>
    typeof value === 'number' && !Number.isNaN(value)
      ? `${value.toLocaleString()} ${t('doctorProfile.feeCurrency')}`
      : t('doctorProfile.notProvided')

  const schema = {
    '@context': 'https://schema.org',
    '@type': doctor.clinics && doctor.clinics.length > 0 ? 'MedicalClinic' : 'Physician',
    name: doctor.full_name,
    description: doctor.bio,
    medicalSpecialty: formatSpecialtyList(doctor.specialty, t('common.comma')),
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
    <div className="container space-y-8" dir={i18n.dir()}>
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
              {doctor.honorific_prefix && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {t(`doctorForm.about.honorificOptions.${doctor.honorific_prefix}`, {
                    defaultValue: doctor.honorific_prefix,
                  })}
                </span>
              )}
              <StatusBadge status={doctor.status} />
            </div>
            {doctor.tagline && <p className="text-lg font-medium text-primary-700">{doctor.tagline}</p>}
            <p className="text-base text-slate-600">
              {doctor.bio || t('doctorProfile.bioFallback')}
            </p>
            {aboutParagraphs.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">{t('doctorProfile.personalStatementTitle')}</p>
                <p className="text-xs text-slate-500">{t('doctorProfile.personalStatementCopy')}</p>
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  {aboutParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
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
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <span key={language} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                  {languageLabel(language, t)}
                </span>
              ))}
            </div>
            <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              {doctor.phone && (
                <div className={clsx('flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/70 p-3', isRTL && 'flex-row-reverse')}>
                  <Phone className="h-4 w-4 text-primary-500" />
                  <a href={telHref} className="font-medium text-slate-900">
                    <PhoneNumber value={doctor.phone} />
                  </a>
                </div>
              )}
              {doctor.email && (
                <div className={clsx('flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/70 p-3', isRTL && 'flex-row-reverse')}>
                  <Mail className="h-4 w-4 text-primary-500" />
                  <a href={`mailto:${doctor.email}`} className="font-medium text-slate-900">
                    {doctor.email}
                  </a>
                </div>
              )}
              {doctor.website && (
                <div className={clsx('flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/70 p-3', isRTL && 'flex-row-reverse')}>
                  <Globe className="h-4 w-4 text-primary-500" />
                  <a href={doctor.website} target="_blank" rel="noreferrer" className="font-medium text-primary-700 underline">
                    {t('doctorProfile.visitWebsite')}
                  </a>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {bookingLink ? (
                <Button asChild>
                  <a href={bookingLink} target={bookingLink.startsWith('https://') ? '_blank' : undefined} rel={bookingLink.startsWith('https://') ? 'noreferrer' : undefined}>
                    {t('doctorProfile.book')}
                  </a>
                </Button>
              ) : (
                <Button disabled>{t('doctorProfile.book')}</Button>
              )}
              {canEdit && (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/doctor/profile">{t('doctorProfile.editProfile')}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>


      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.financesTitle')}</h2>
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
          <div className="rounded-2xl border border-slate-100 p-4 overflow-hidden">
            <p className="text-xs text-slate-500">{t('doctorProfile.insurance')}</p>
            {insurances.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2" data-testid="doctor-insurances">
                {insurances.map((insurance) => (
                  <span
                    key={insurance}
                    className="break-words rounded-full bg-slate-900/5 px-3 py-1 text-center text-xs text-slate-700"
                  >
                    {insurance}
                  </span>
                ))}
              </div>
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
        <h2 className="text-xl font-semibold text-slate-900">{t('doctorForm.specialties.title')}</h2>
        <p className="text-sm text-slate-500">{t('doctorForm.specialties.description')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.about.labels.primarySpecialty')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {primarySpecialties || t('doctorProfile.notProvided')}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.about.labels.secondarySpecialty')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {secondarySpecialties || t('doctorProfile.notProvided')}
            </p>
          </div>
        </div>
        {doctor.specialties_note && (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-xs text-slate-500">{t('doctorForm.specialties.noteLabel')}</p>
            <p className="mt-2">{doctor.specialties_note}</p>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">{t('doctorForm.qualifications.title')}</h2>
        <p className="text-sm text-slate-500">{t('doctorForm.qualifications.description')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.about.labels.professionalRole')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {doctor.professional_role || t('doctorProfile.notProvided')}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.about.labels.licensureStatus')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{licensureStatusLabel}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.about.labels.licenseNumber')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {doctor.license_number || t('doctorProfile.notProvided')}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.about.labels.licenseExpiration')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {doctor.license_expiration
                ? new Date(doctor.license_expiration).toLocaleDateString()
                : t('doctorProfile.notProvided')}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.about.labels.credentialSuffix')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {doctor.credentials_suffix || t('doctorProfile.notProvided')}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.about.labels.pronouns')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {doctor.preferred_pronouns || t('doctorProfile.notProvided')}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.qualifications.mainQualifications')}</p>
            {qualifications.length > 0 ? (
              <div className="mt-2 space-y-2 text-sm text-slate-700">
                {qualifications.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.notProvided')}</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.qualifications.additionalCredentials')}</p>
            {additionalCredentials.length > 0 ? (
              <div className="mt-2 space-y-2 text-sm text-slate-700">
                {additionalCredentials.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.notProvided')}</p>
            )}
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.qualifications.lastInstitution')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {doctor.education_institution || t('doctorProfile.notProvided')}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.qualifications.degreeType')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {doctor.education_degree || t('doctorProfile.notProvided')}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.qualifications.graduationYear')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {doctor.education_graduation_year ?? t('doctorProfile.notProvided')}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.qualifications.practiceStartYear')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {doctor.practice_start_year ?? t('doctorProfile.notProvided')}
            </p>
          </div>
        </div>
        {doctor.qualifications_note && (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="text-xs text-slate-500">{t('doctorForm.qualifications.note')}</p>
            <p className="mt-2">{doctor.qualifications_note}</p>
          </div>
        )}
        {documents.length > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.media.documentsTitle')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {documents.map((document) => (
                <a
                  key={document.id}
                  href={document.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 underline"
                >
                  {document.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.clientFocusTitle')}</h2>
        <p className="text-sm text-slate-500">{t('doctorProfile.clientFocusCopy')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.participants')}</p>
            {participantLabels.length > 0 ? (
              <p className="mt-2 text-sm font-semibold text-slate-900">{participantLabels.join(listSeparator)}</p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.participantsEmpty')}</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.ageGroups')}</p>
            {ageGroupLabels.length > 0 ? (
              <p className="mt-2 text-sm font-semibold text-slate-900">{ageGroupLabels.join(listSeparator)}</p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.ageGroupsEmpty')}</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.faithOrientation')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{faithLabel}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.alliedCommunities')}</p>
            {alliedLabels.length > 0 ? (
              <p className="mt-2 text-sm font-semibold text-slate-900">{alliedLabels.join(listSeparator)}</p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.alliedEmpty')}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.identityTitle')}</h2>
        <p className="text-sm text-slate-500">{t('doctorProfile.identityCopy')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.identityGender')}</p>
            {identityGender.length > 0 ? (
              <p className="mt-2 text-sm font-semibold text-slate-900">{identityGender.join(listSeparator)}</p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.identityEmpty')}</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.identityEthnicity')}</p>
            {identityEthnicity.length > 0 ? (
              <p className="mt-2 text-sm font-semibold text-slate-900">{identityEthnicity.join(listSeparator)}</p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.identityEmpty')}</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.identityLgbtq')}</p>
            {identityLgbtq.length > 0 ? (
              <p className="mt-2 text-sm font-semibold text-slate-900">{identityLgbtq.join(listSeparator)}</p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">{t('doctorProfile.identityEmpty')}</p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorForm.identity.religion')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {typeof identityTraits.religion === 'string' && identityTraits.religion.trim() !== ''
                ? identityTraits.religion
                : t('doctorProfile.notProvided')}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-500">{t('doctorProfile.identityBirthYear')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {typeof identityTraits.birth_year === 'number' || typeof identityTraits.birth_year === 'string'
                ? identityTraits.birth_year
                : t('doctorProfile.notProvided')}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4 md:col-span-2">
            <p className="text-xs text-slate-500">{t('doctorProfile.identityOther')}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {typeof identityTraits.other === 'string' && identityTraits.other.trim() !== ''
                ? identityTraits.other
                : t('doctorProfile.notProvided')}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.treatmentTitle')}</h2>
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

      {doctor.clinics && doctor.clinics.length > 0 && (
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.clinicsTitle')}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {doctor.clinics.map((clinic) => (
              <div key={clinic.id} className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-800">{clinic.name || clinic.city}</p>
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
                  title: clinic.name || clinic.city,
                }))}
            />
          </div>
        </section>
      )}


      {doctor.media && doctor.media.gallery.length > 0 && (
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.mediaTitle')}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {doctor.media.gallery.map((media) => (
              <button
                key={media.id}
                type="button"
                onClick={() => setActiveMedia(media)}
                className="group relative h-48 w-full overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <img
                  src={media.url}
                  alt={media.name}
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <span className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent bg-slate-900/0 transition group-hover:bg-slate-900/5" />
              </button>
            ))}
          </div>
        </section>
      )}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm px-4 py-10" role="dialog" aria-modal="true">
          <div className="mx-auto flex h-full max-w-5xl flex-col rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-base font-semibold text-slate-900">{activeMedia.name}</h3>
              <button
                type="button"
                onClick={() => setActiveMedia(null)}
                className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
                aria-label={t('common.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <img src={activeMedia.url} alt={activeMedia.name} className="mx-auto max-h-[70vh] rounded-2xl object-contain" />
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-card md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.contactTitle')}</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            {doctor.phone && (
              <p>
                {t('doctorProfile.phone')}: <PhoneNumber value={doctor.phone} className="text-slate-900" />
              </p>
            )}
            {doctor.mobile_phone && (
              <p>
                {t('doctorProfile.mobilePhone')}: <PhoneNumber value={doctor.mobile_phone} className="text-slate-900" />
              </p>
            )}
            {doctor.whatsapp && (
              <p>
                {t('doctorProfile.whatsapp')}: <PhoneNumber value={doctor.whatsapp} className="text-slate-900" />
              </p>
            )}
            {doctor.email && <p>{t('doctorProfile.email')}: {doctor.email}</p>}
            {doctor.appointment_email && (
              <p>
                {t('doctorProfile.appointmentEmail')}: {doctor.appointment_email}
              </p>
            )}
            {doctor.website && (
              <p>
                {t('doctorProfile.website')}: {' '}
                <a className="text-primary-600 underline" href={doctor.website} target="_blank" rel="noreferrer">
                  {doctor.website}
                </a>
              </p>
            )}
            <p>
              {t('doctorProfile.acceptsEmails')}:{' '}
              {doctor.accepts_email_messages ? t('doctorProfile.booleanYes') : t('doctorProfile.booleanNo')}
            </p>
            <p>
              {t('doctorProfile.offersIntroCall')}:{' '}
              {doctor.offers_intro_call ? t('doctorProfile.booleanYes') : t('doctorProfile.booleanNo')}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{t('doctorProfile.therapistNote')}</p>
          <p className="mt-2">
            {doctor.new_clients_intro ||
              t('doctorProfile.defaultNote')}
          </p>
        </div>
      </section>
    </div>
  )
}

export default DoctorProfilePage
