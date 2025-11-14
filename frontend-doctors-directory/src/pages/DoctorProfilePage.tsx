import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useDoctorQuery } from '@/features/doctors/hooks'
import { useAuthQuery } from '@/features/auth/hooks'
import { MapWidget } from '@/components/common/MapWidget'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { useLocaleText } from '@/app/hooks/useLocaleText'

export const DoctorProfilePage = () => {
  const { id } = useParams()
  const { data: doctor, isLoading } = useDoctorQuery(id ?? '')
  const { data: authUser } = useAuthQuery()
  const translate = useLocaleText()

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
        {translate('جارٍ تحميل الملف العلاجي...', 'Loading therapist profile...')}
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="container">
        <EmptyState title={translate('لم يتم العثور على المعالج', 'Therapist not found')} />
      </div>
    )
  }

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
            <img
              src={
                doctor.media?.gallery?.[0]?.url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.full_name)}&background=0D7DF5&color=fff`
              }
              alt={doctor.full_name}
              className="h-60 w-full rounded-[28px] object-cover"
              loading="lazy"
            />
            {doctor.is_verified && (
              <Badge className="absolute left-4 top-4 bg-emerald-50 text-emerald-700">
                {translate('موثق', 'Verified')}
              </Badge>
            )}
          </div>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-900">{doctor.full_name}</h1>
              <StatusBadge status={doctor.status} />
            </div>
            <p className="text-base text-slate-600">
              {doctor.bio || translate('لم تتم إضافة نبذة بعد.', 'No bio yet.')}
            </p>
            <div className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase text-slate-400">{translate('سنوات الخبرة', 'Experience')}</p>
                <p className="text-lg font-semibold text-slate-900">
                  {doctor.years_of_experience ?? 0} {translate('سنة', 'yrs')}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">{translate('رقم الترخيص', 'License')}</p>
                <p className="text-lg font-semibold text-slate-900">
                  {doctor.license_number || translate('غير متوفر', 'N/A')}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">{translate('أنماط الجلسات', 'Session types')}</p>
                <p className="text-lg font-semibold text-slate-900">
                  {doctor.insurances?.[0] ?? translate('حضوري و/أو عن بعد', 'In-person / remote')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <span key={language} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-700">
                  {language.toUpperCase()}
                </span>
              ))}
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

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{translate('مجالات التركيز', 'Therapy focus')}</h2>
            <p className="text-sm text-slate-500">
              {translate('الأساليب والمدارس العلاجية المعتمدة لدى المعالج.', 'Modalities and therapy schools practiced.')}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-xs text-slate-500">
            <Heart className="h-4 w-4" /> {translate('دعم الصحة النفسية المتكامل', 'Holistic mental health care')}
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
              {translate('لم تتم إضافة تخصصات إضافية.', 'No additional specialties yet.')}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <h2 className="text-xl font-semibold text-slate-900">{translate('العيادات والمواقع', 'Clinics & locations')}</h2>
        {doctor.clinics && doctor.clinics.length > 0 ? (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                    title: clinic.city,
                  }))}
              />
            </div>
          </>
        ) : (
          <EmptyState title={translate('لم يتم إضافة عيادات بعد', 'No clinics yet')} />
        )}
      </section>

      {doctor.media && doctor.media.gallery.length > 0 && (
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-slate-900">{translate('الوسائط', 'Media gallery')}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {doctor.media.gallery.map((media) => (
              <img key={media.id} src={media.url} alt={media.name} className="h-48 w-full rounded-2xl object-cover" />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-card md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{translate('تواصل مع المعالج', 'Contact')}</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            {doctor.phone && <p>{translate('الهاتف', 'Phone')}: {doctor.phone}</p>}
            {doctor.whatsapp && <p>{translate('واتساب', 'WhatsApp')}: {doctor.whatsapp}</p>}
            {doctor.email && <p>{translate('البريد الإلكتروني', 'Email')}: {doctor.email}</p>}
            {doctor.website && (
              <p>
                {translate('الموقع الإلكتروني', 'Website')}:{' '}
                <a className="text-primary-600 underline" href={doctor.website} target="_blank" rel="noreferrer">
                  {doctor.website}
                </a>
              </p>
            )}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">{translate('رسالة المعالج', 'Therapist note')}</p>
          <p className="mt-2">
            {doctor.status_note ||
              translate(
                'أرحّب بك في مساحتك الآمنة للتعبير والعمل على أهدافك النفسية. يمكنك التواصل لحجز جلسة تعريفية.',
                'I welcome you to this safe space to work on your goals. Reach out for an introductory session.',
              )}
          </p>
        </div>
      </section>
    </div>
  )
}

export default DoctorProfilePage
