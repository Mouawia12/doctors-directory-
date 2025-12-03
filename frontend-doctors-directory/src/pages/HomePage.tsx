import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SearchBar } from '@/components/common/SearchBar'
import { StatsHighlights } from '@/components/common/StatsHighlights'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useAuthQuery } from '@/features/auth/hooks'
import { useJoinDoctorMutation } from '@/features/doctor/hooks'
import { toast } from 'sonner'

export const HomePage = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { data: user } = useAuthQuery()
  const joinMutation = useJoinDoctorMutation()
  const direction = i18n.dir()
  const isRTL = direction === 'rtl'
  const featuredSpecialties = t('home.featured', { returnObjects: true }) as Array<{ title: string; description: string }>
  const featuredTitleLabel = t('home.featuredTitle')
  const featuredButtonLabel = t('home.featuredAll')
  const isLoggedIn = Boolean(user)
  const isDoctor = Boolean(user?.roles.includes('doctor'))
  const dashboardPath = isDoctor ? '/doctor' : '/account'

  const handleSearch = (filters: { q?: string; city?: string; specialty?: string }) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    navigate(`/search?${params.toString()}`)
  }

  const handleDoctorJoin = () => {
    if (!user) {
      navigate('/auth/register')
      return
    }

    if (user.roles.includes('doctor')) {
      navigate('/doctor')
      return
    }

    joinMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(t('doctorForm.join.success'))
        navigate('/doctor/profile')
      },
      onError: () => toast.error(t('doctorForm.join.error')),
    })
  }

  const heroSecondaryCta = isLoggedIn
    ? {
        label: isDoctor ? t('nav.myProfile') : t('nav.userDashboard'),
        onClick: () => navigate(dashboardPath),
        disabled: false,
      }
    : {
        label: joinMutation.isPending ? t('doctorForm.join.loading') : t('hero.doctorCta'),
        onClick: handleDoctorJoin,
        disabled: joinMutation.isPending,
      }

  const doctorSectionCta = isLoggedIn
    ? {
        label: isDoctor ? t('nav.myProfile') : t('nav.userDashboard'),
        onClick: () => navigate(dashboardPath),
        disabled: false,
      }
    : {
        label: joinMutation.isPending ? t('doctorForm.join.loading') : t('home.doctorCtaAction'),
        onClick: handleDoctorJoin,
        disabled: joinMutation.isPending,
      }

  return (
    <div className="space-y-16" dir={direction}>
      <section className="container grid gap-10 rounded-[32px] border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-8 md:grid-cols-2 md:p-16">
        <div className={cn('space-y-6', isRTL ? 'text-right' : 'text-left')}>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
            {t('home.trustedPlatform')}
          </p>
          <h1 className="text-4xl font-semibold leading-[1.3] text-slate-900 md:text-5xl">{t('hero.title')}</h1>
          <p className="text-lg text-slate-600">{t('hero.subtitle')}</p>
          <div className={cn('flex flex-wrap gap-3', isRTL ? 'justify-end' : 'justify-start')}>
            <Button onClick={() => navigate('/search')}>{t('hero.cta')}</Button>
            <Button variant="outline" onClick={heroSecondaryCta.onClick} disabled={heroSecondaryCta.disabled}>
              {heroSecondaryCta.label}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <SearchBar onSearch={handleSearch} />
          <StatsHighlights />
        </div>
      </section>

      <section className="container">
        <div className={cn('flex items-center gap-4 justify-between', isRTL && 'text-right')}>
          <h2 className="section-title">{featuredTitleLabel}</h2>
          <Button variant="ghost" onClick={() => navigate('/search')}>
            {featuredButtonLabel}
          </Button>
        </div>
        <div className="mt-6">
          <div
            className={cn(
              'grid gap-4 md:grid-cols-4',
              isRTL ? 'justify-end justify-items-end text-right' : 'justify-start justify-items-start text-left',
            )}
          >
            {featuredSpecialties.map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-card">
                <p className="text-base font-semibold text-slate-800">{item.title}</p>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container rounded-[32px] bg-slate-900 p-10 text-white">
        <div className="grid gap-6 md:grid-cols-2">
          <div className={cn(isRTL && 'text-right')}>
            <p className="text-sm uppercase tracking-widest text-slate-300">{t('home.doctorsTag')}</p>
            <h3 className="mt-2 text-3xl font-semibold">
              {t('home.doctorCtaHeading')}
            </h3>
            <p className="mt-4 text-slate-200">
              {t('home.doctorCtaBody')}
            </p>
          </div>
          <div className="flex items-center justify-end">
            <Button
              className="bg-white text-slate-900 hover:bg-white/90"
              onClick={doctorSectionCta.onClick}
              disabled={doctorSectionCta.disabled}
            >
              {doctorSectionCta.label}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
