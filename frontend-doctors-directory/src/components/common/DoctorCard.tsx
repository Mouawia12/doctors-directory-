import { Link } from 'react-router-dom'
import { Heart, MapPin, Stethoscope } from 'lucide-react'
import type { Doctor } from '@/types/doctor'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToggleFavorite } from '@/features/favorites/hooks'
import { useAuthQuery } from '@/features/auth/hooks'
import { cn } from '@/lib/utils'
import { languageLabel } from '@/lib/language'
import { formatSpecialtyList } from '@/lib/doctor'
import { useTranslation } from 'react-i18next'

interface DoctorCardProps {
  doctor: Doctor
  compact?: boolean
  profilePath?: string
}

export const DoctorCard = ({ doctor, compact = false, profilePath }: DoctorCardProps) => {
  const { data: user } = useAuthQuery()
  const { mutate: toggleFavorite, isPending } = useToggleFavorite()
  const { t } = useTranslation()

  const galleryCover = doctor.media?.avatar?.url ?? doctor.media?.gallery?.[0]?.url
  const targetProfile = profilePath ?? `/doctors/${doctor.id}`
  const specialtyLabel = formatSpecialtyList(doctor.specialty, t('common.comma')) || '—'

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-card md:flex-row">
      <div className="relative w-full md:w-48">
        <img
          src={
            galleryCover ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.full_name)}&background=0D7DF5&color=fff`
          }
          alt={doctor.full_name}
          className="h-48 w-full rounded-2xl object-cover"
          loading="lazy"
        />
        {doctor.is_verified && <Badge className="absolute right-2 top-2">{t('doctorCard.verified')}</Badge>}
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to={targetProfile} className="text-lg font-semibold text-slate-900">
                {doctor.full_name}
              </Link>
              {doctor.honorific_prefix && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {t(`doctorForm.about.honorificOptions.${doctor.honorific_prefix}`, {
                    defaultValue: doctor.honorific_prefix,
                  })}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">{specialtyLabel}</p>
          </div>
          {user && (
            <button
              className={cn(
                'rounded-full border p-2 transition',
                doctor.is_favorite
                  ? 'border-rose-200 bg-rose-50 text-rose-500'
                  : 'border-slate-200 text-slate-500 hover:text-rose-500',
              )}
              disabled={isPending}
              onClick={() => toggleFavorite({ doctorId: doctor.id, active: !!doctor.is_favorite })}
            >
              <Heart className={cn('h-5 w-5', doctor.is_favorite && 'fill-rose-400 text-rose-500')} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <Stethoscope className="h-3.5 w-3.5" />
            {t('doctorCard.experience', { count: doctor.years_of_experience || 0 })}
          </span>
          {doctor.city && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <MapPin className="h-3.5 w-3.5" />
              {doctor.city}
            </span>
          )}
          {doctor.languages?.map((lang) => {
            const label = languageLabel(lang, t)
            return (
              <span key={lang} className="rounded-full bg-slate-100 px-3 py-1">
                {label}
              </span>
            )
          })}
        </div>
        {!compact && <p className="line-clamp-2 text-sm text-slate-600">{doctor.bio}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link to={targetProfile}>{t('doctorCard.viewProfile')}</Link>
          </Button>
          {doctor.clinics && doctor.clinics.length > 0 && (
            <p className="text-xs text-slate-500">
              {t('doctorCard.clinicsIn')}{' '}
              {doctor.clinics.map((clinic) => clinic.name || clinic.city).join(t('common.comma'))}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
