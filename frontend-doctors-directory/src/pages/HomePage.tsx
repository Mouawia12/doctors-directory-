import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SearchBar } from '@/components/common/SearchBar'
import { StatsHighlights } from '@/components/common/StatsHighlights'
import { Button } from '@/components/ui/Button'

export const HomePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const featuredSpecialties = t('home.featured', { returnObjects: true }) as Array<{ title: string; description: string }>

  const handleSearch = (filters: { q?: string; city?: string; specialty?: string }) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="space-y-16">
      <section className="container grid gap-10 rounded-[32px] border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-8 md:grid-cols-2 md:p-16">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
            {t('home.trustedPlatform')}
          </p>
          <h1 className="text-4xl font-semibold leading-[1.3] text-slate-900 md:text-5xl">{t('hero.title')}</h1>
          <p className="text-lg text-slate-600">{t('hero.subtitle')}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/search')}>{t('hero.cta')}</Button>
            <Button variant="outline" onClick={() => navigate('/auth/register')}>
              {t('hero.doctorCta')}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <SearchBar onSearch={handleSearch} />
          <StatsHighlights />
        </div>
      </section>

      <section className="container">
        <div className="flex items-center justify-between">
          <h2 className="section-title">{t('home.featuredTitle')}</h2>
          <Button variant="ghost" onClick={() => navigate('/search')}>
            {t('home.featuredAll')}
          </Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {featuredSpecialties.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-card">
              <p className="text-base font-semibold text-slate-800">{item.title}</p>
              <p className="text-sm text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container rounded-[32px] bg-slate-900 p-10 text-white">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-300">{t('home.doctorsTag')}</p>
            <h3 className="mt-2 text-3xl font-semibold">
              {t('home.doctorCtaHeading')}
            </h3>
            <p className="mt-4 text-slate-200">
              {t('home.doctorCtaBody')}
            </p>
          </div>
          <div className="flex items-center justify-end">
            <Button className="bg-white text-slate-900 hover:bg-white/90" onClick={() => navigate('/auth/register')}>
              {t('home.doctorCtaAction')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
