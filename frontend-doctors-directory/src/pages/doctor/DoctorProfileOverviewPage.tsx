import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useDoctorProfileQuery } from '@/features/doctor/hooks'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { useTranslation } from 'react-i18next'
import { Loader2, Mail, Phone, Globe, MapPin } from 'lucide-react'
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm'

const buildAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D7DF5&color=fff`

const InfoCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-2xl border border-slate-100 bg-white/80 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
  </div>
)

const ContactRow = ({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value?: string | null; href?: string }) => {
  if (!value) return null
  const content = href ? (
    <a href={href} className="font-medium text-primary-700 hover:underline">{value}</a>
  ) : (
    <span className="font-medium text-slate-900">{value}</span>
  )

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 p-3 text-sm text-slate-600">
      <Icon className="h-4 w-4 text-primary-500" />
      <div>
        <p className="text-xs uppercase text-slate-400">{label}</p>
        {content}
      </div>
    </div>
  )
}

const DoctorProfileOverviewPage = () => {
  const { data: doctor, isLoading } = useDoctorProfileQuery()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('doctorProfile.loading')}
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="container py-10">
        <EmptyState title={t('doctorProfile.notFound')} description={t('doctorProfile.emptyState')} />
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link to="/doctor/profile">{t('doctorProfile.editProfile')}</Link>
          </Button>
        </div>
      </div>
    )
  }

  const heroImage = doctor.media?.avatar?.url || doctor.media?.gallery?.[0]?.url || buildAvatar(doctor.full_name)
  const city = doctor.clinics?.[0]?.city
  const stats = [
    { label: t('doctorProfile.experience'), value: `${doctor.years_of_experience ?? 0} ${t('doctorProfile.years')}` },
    { label: t('doctorProfile.license'), value: doctor.license_number || t('doctorProfile.notProvided') },
    { label: t('doctorProfile.serviceDelivery'), value: t(`doctorProfile.deliveryModes.${doctor.service_delivery ?? 'default'}`) },
  ]

  const contactRows = [
    { icon: Phone, label: t('doctorProfile.phone'), value: doctor.phone, href: doctor.phone ? `tel:${doctor.phone}` : undefined },
    { icon: Mail, label: t('doctorProfile.email'), value: doctor.email, href: doctor.email ? `mailto:${doctor.email}` : undefined },
    { icon: Globe, label: t('doctorProfile.websiteLabel'), value: doctor.website, href: doctor.website ?? undefined },
  ]

  return (
    <div className="container space-y-8 py-8">
      <section className="rounded-[32px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-6 shadow-card">
        <div className="grid gap-6 md:grid-cols-[240px,1fr]">
          <div className="relative">
            <img src={heroImage} alt={doctor.full_name} className="h-56 w-full rounded-[28px] object-cover" loading="lazy" />
            {doctor.is_verified && (
              <Badge className="absolute left-4 top-4 bg-emerald-50 text-emerald-700">{t('doctorProfile.verified')}</Badge>
            )}
          </div>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-900">{doctor.full_name}</h1>
              <StatusBadge status={doctor.status} />
            </div>
            {doctor.tagline && <p className="text-lg font-medium text-primary-600">{doctor.tagline}</p>}
            <p className="text-base text-slate-600">{doctor.bio || t('doctorProfile.bioFallback')}</p>
            {city && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-primary-500" /> {city}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/doctor/profile">{t('doctorProfile.editProfile')}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/doctors/${doctor.id}`}>{t('doctorProfile.viewPublic')}</Link>
              </Button>
              <Button variant={showPassword ? 'primary' : 'outline'} onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? t('account.password.hide') : t('account.password.manage')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {showPassword ? (
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-slate-900">{t('account.password.title')}</h2>
          <p className="text-sm text-slate-500">{t('account.password.description')}</p>
          <div className="mt-6">
            <ChangePasswordForm />
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <InfoCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
            <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.contactSection')}</h2>
            <p className="text-sm text-slate-500">{t('doctorProfile.contactCopy')}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {contactRows.map((row) => (
                <ContactRow key={row.label} {...row} />
              ))}
            </div>
          </section>
        </>
      )}

      {doctor.clinics?.length ? (
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-slate-900">{t('doctorProfile.clinicsTitle')}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {doctor.clinics.map((clinic) => (
              <div key={clinic.id} className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
                <p className="text-base font-semibold text-slate-900">{clinic.city}</p>
                <p>{clinic.address}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default DoctorProfileOverviewPage
