import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HeartHandshake, Users, Sparkles, ShieldCheck, Brain, Scale, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { SearchBar } from '@/components/common/SearchBar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useAuthQuery } from '@/features/auth/hooks'
import { useJoinDoctorMutation } from '@/features/doctor/hooks'
import { useDoctorsQuery } from '@/features/doctors/hooks'

type Slide = { title: string; description: string }
type StatHighlight = { value: string; label: string }
type HighlightIcon = keyof typeof iconLookup
type ServiceHighlight = { title: string; description: string; icon: HighlightIcon }
type TherapyMethod = { title: string; subtitle: string; description: string; icon: HighlightIcon }
type ExpertCard = {
  name: string
  specialty: string
  focus: string
  experience?: string
  languages?: string
  profileId?: string
}
type PlatformFeature = { title: string; description: string }

const iconLookup = {
  heart: HeartHandshake,
  users: Users,
  sparkles: Sparkles,
  shield: ShieldCheck,
  brain: Brain,
  balance: Scale,
} satisfies Record<string, LucideIcon>

export const HomePage = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const direction = i18n.dir()
  const isRTL = direction === 'rtl'
  const { data: user } = useAuthQuery()
  const joinMutation = useJoinDoctorMutation()
  const isLoggedIn = Boolean(user)
  const isDoctor = Boolean(user?.roles.includes('doctor'))
  const dashboardPath = isDoctor ? '/doctor' : '/account'

  const heroSlides = useMemo(
    () => (t('home.heroSlides', { returnObjects: true }) as Slide[]) ?? [],
    [t],
  )
  const heroStats = useMemo(
    () => (t('home.heroStats', { returnObjects: true }) as StatHighlight[]) ?? [],
    [t],
  )
  const serviceHighlights = useMemo(
    () => (t('home.serviceHighlights', { returnObjects: true }) as ServiceHighlight[]) ?? [],
    [t],
  )
  const therapyMethods = useMemo(
    () => (t('home.therapy.methods', { returnObjects: true }) as TherapyMethod[]) ?? [],
    [t],
  )
  const issues = useMemo(
    () => (t('home.issues.list', { returnObjects: true }) as string[]) ?? [],
    [t],
  )
  const featuredExperts = useMemo(
    () => (t('home.featuredExperts.items', { returnObjects: true }) as ExpertCard[]) ?? [],
    [t],
  )
  const platformFeatures = useMemo(
    () => (t('home.platform.features', { returnObjects: true }) as PlatformFeature[]) ?? [],
    [t],
  )
  const featuredDoctorsQuery = useDoctorsQuery({ per_page: 6, page: 1 })
  const handlePlatformFeatureClick = () => navigate('/stats')

  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    if (heroSlides.length < 2) {
      return
    }

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [heroSlides.length])

  const currentSlide = heroSlides.length > 0 ? heroSlides[activeSlide] : null

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
        label: joinMutation.isPending ? t('doctorForm.join.loading') : t('home.cta.secondary'),
        onClick: handleDoctorJoin,
        disabled: joinMutation.isPending,
      }

  const renderIcon = (icon: HighlightIcon, className?: string) => {
    const Icon = iconLookup[icon] ?? Sparkles
    return <Icon className={cn('h-6 w-6 text-primary-600', className)} aria-hidden="true" />
  }

  const featuredDoctorCards = useMemo(() => {
    const apiDoctors = featuredDoctorsQuery.data?.items ?? []

    if (apiDoctors.length > 0) {
      const sorted = [...apiDoctors].sort((a, b) => {
        const favoritesDiff = (b.favorites_count ?? 0) - (a.favorites_count ?? 0)
        if (favoritesDiff !== 0) return favoritesDiff
        const verifiedDiff = Number(b.is_verified) - Number(a.is_verified)
        if (verifiedDiff !== 0) return verifiedDiff
        return (b.years_of_experience ?? 0) - (a.years_of_experience ?? 0)
      })

      return sorted.slice(0, 3).map((doctor) => ({
        name: doctor.full_name,
        specialty: doctor.specialty || t('doctorProfile.specialty', { defaultValue: 'Specialty' }),
        focus:
          doctor.sub_specialty ||
          doctor.tagline ||
          doctor.specialties_note ||
          t('doctorProfile.focusEmpty', { defaultValue: '' }),
        experience: doctor.years_of_experience
          ? `${doctor.years_of_experience} ${t('doctorProfile.years')}`
          : undefined,
        languages: doctor.languages?.length ? doctor.languages.join(' · ') : undefined,
        profileId: String(doctor.id),
      }))
    }

    return featuredExperts
  }, [featuredDoctorsQuery.data, featuredExperts, t])

  const handleExpertClick = (expert: ExpertCard) => {
    if (expert.profileId) {
      navigate(`/doctors/${expert.profileId}`)
      return
    }
    const params = new URLSearchParams({ q: expert.name })
    navigate(`/search?${params.toString()}`)
  }

  const navigateToIssue = (issue: string) => {
    const params = new URLSearchParams()
    params.set('q', issue)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="space-y-16" dir={direction}>
      <section className="container relative overflow-hidden rounded-[40px] bg-gradient-to-br from-primary-50 via-white to-slate-50 px-6 py-12 md:px-14">
        <div className="grid gap-10 md:grid-cols-[1.1fr,0.9fr]">
          <div className={cn('space-y-6', isRTL ? 'text-right' : 'text-left')}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100/80 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary-700">
              {t('home.heroBadge')}
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">{t('home.heroTitle')}</h1>
            <p className="text-lg text-slate-600">{t('home.heroSubtitle')}</p>
            <div className="space-y-5">
              <SearchBar onSearch={handleSearch} />
              <div className={cn('flex flex-wrap gap-3', isRTL ? 'justify-end' : 'justify-start')}>
                <Button onClick={() => navigate('/search')}>{t('home.cta.primary')}</Button>
                <Button variant="outline" onClick={heroSecondaryCta.onClick} disabled={heroSecondaryCta.disabled}>
                  {heroSecondaryCta.label}
                </Button>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-card animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="text-3xl font-bold text-primary-700">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel relative flex flex-col gap-6 bg-white/90 p-6 shadow-2xl animate-slide-pan">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary-500">{t('home.trustedPlatform')}</p>
              <h3 className="text-2xl font-semibold text-slate-900">
                {currentSlide?.title ?? t('home.heroTitle')}
              </h3>
              <p className="text-sm text-slate-600">
                {currentSlide?.description ?? t('home.heroSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={`hero-slide-${index}`}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={cn(
                    'h-2 w-10 rounded-full transition',
                    activeSlide === index ? 'bg-primary-600' : 'bg-slate-200',
                  )}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4">
              <p className="text-sm font-semibold text-slate-800">{t('home.serviceHighlightsTitle')}</p>
              <p className="text-xs text-slate-500">{t('home.serviceHighlightsDescription')}</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                {issues.slice(0, 4).map((issue) => (
                  <div key={issue} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-float absolute -left-10 top-16 h-32 w-32 rounded-full bg-primary-200/30 blur-3xl" />
          <div
            className="animate-float absolute bottom-4 right-6 h-24 w-24 rounded-full bg-slate-200/50 blur-2xl"
            style={{ animationDelay: '2s' }}
          />
        </div>
      </section>

      <section className="container space-y-6">
        <div className={cn('flex flex-col gap-2', isRTL ? 'text-right' : 'text-left')}>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
            {t('home.serviceHighlightsTitle')}
          </p>
          <h2 className="section-title">{t('home.serviceHighlightsDescription')}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {serviceHighlights.map((card, index) => (
            <div
              key={card.title}
              className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary-50 p-3">{renderIcon(card.icon)}</div>
                <p className="text-lg font-semibold text-slate-900">{card.title}</p>
              </div>
              <p className="mt-3 text-sm text-slate-600">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container grid gap-6 rounded-[32px] bg-white p-8 shadow-card md:grid-cols-[0.9fr,1.1fr]">
        <div className={cn('space-y-3', isRTL ? 'text-right' : 'text-left')}>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">{t('home.issues.title')}</p>
          <h2 className="section-title">{t('home.issues.description')}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {issues.map((issue) => (
            <button
              type="button"
              key={issue}
              onClick={() => navigateToIssue(issue)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 text-center transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/70"
            >
              {issue}
            </button>
          ))}
        </div>
      </section>

      <section className="container space-y-6">
        <div className={cn('flex flex-col gap-2', isRTL ? 'text-right' : 'text-left')}>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
            {t('home.therapy.title')}
          </p>
          <h2 className="section-title">{t('home.therapy.description')}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {therapyMethods.map((method, index) => (
            <div
              key={method.title}
              className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-card animate-fade-up"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary-50 p-3">{renderIcon(method.icon)}</div>
                <div>
                  <p className="text-sm font-semibold text-primary-600">{method.subtitle}</p>
                  <p className="text-base font-semibold text-slate-900">{method.title}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{method.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container space-y-6">
        <div className={cn('flex flex-col gap-2', isRTL ? 'text-right' : 'text-left')}>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
            {t('home.featuredExperts.title')}
          </p>
          <h2 className="section-title">{t('home.featuredExperts.description')}</h2>
          <p className="text-sm text-slate-600">{t('home.featuredExperts.updateHint')}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {featuredDoctorCards.map((expert, index) => (
            <button
              type="button"
              key={expert.name}
              onClick={() => handleExpertClick(expert)}
              className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/60 p-6 text-left shadow-card transition animate-fade-up hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-xl font-semibold text-slate-900">{expert.name}</p>
              <p className="text-sm text-primary-600">{expert.specialty}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">{t('doctorProfile.specialty', { defaultValue: 'Focus' })}:</span>{' '}
                  {expert.focus}
                </p>
                {expert.experience && (
                  <p>
                    <span className="font-semibold text-slate-800">{t('doctorProfile.experience', { defaultValue: 'Experience' })}:</span>{' '}
                    {expert.experience}
                  </p>
                )}
                {expert.languages && (
                  <p>
                    <span className="font-semibold text-slate-800">{t('doctorProfile.languages', { defaultValue: 'Languages' })}:</span>{' '}
                    {expert.languages}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="container grid gap-6 rounded-[32px] border border-slate-100 bg-white p-8 shadow-card lg:grid-cols-[1fr,1fr]">
        <div className={cn('space-y-3', isRTL ? 'text-right' : 'text-left')}>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
            {t('home.platform.title')}
          </p>
          <h2 className="section-title">{t('home.platform.subtitle')}</h2>
        </div>
        <div className="grid gap-4">
          {platformFeatures.map((feature, index) => (
            <button
              type="button"
              onClick={handlePlatformFeatureClick}
              key={feature.title}
              className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4 text-left transition animate-fade-up hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-base font-semibold text-slate-900">{feature.title}</p>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="container overflow-hidden rounded-[32px] bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-10 text-white shadow-2xl">
        <div className="grid gap-8 md:grid-cols-[1.1fr,0.9fr]">
          <div className={cn('space-y-4', isRTL ? 'text-right' : 'text-left')}>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">{t('home.trustedPlatform')}</p>
            <h2 className="text-3xl font-semibold">{t('home.cta.title')}</h2>
            <p className="text-base text-white/90">{t('home.cta.subtitle')}</p>
            <div className={cn('flex flex-wrap gap-3', isRTL ? 'justify-end' : 'justify-start')}>
              <Button className="bg-white text-primary-700 hover:bg-white/90" onClick={() => navigate('/search')}>
                {t('home.cta.primary')}
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/20 hover:text-white disabled:border-white/60 disabled:text-white/70"
                onClick={heroSecondaryCta.onClick}
                disabled={heroSecondaryCta.disabled}
              >
                {heroSecondaryCta.label}
              </Button>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md">
            <p className="text-sm text-white/80">{t('home.serviceHighlightsDescription')}</p>
            <div className="mt-4 grid gap-3 text-sm text-white">
              {serviceHighlights.slice(0, 3).map((card) => (
                <div key={card.title} className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/20 p-2">{renderIcon(card.icon, 'text-white')}</div>
                  <div>
                    <p className="font-semibold">{card.title}</p>
                    <p className="text-xs text-white/80">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
