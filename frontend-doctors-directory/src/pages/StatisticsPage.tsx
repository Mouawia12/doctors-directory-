import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

type StatHighlight = { value: string; label: string }

const StatisticsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const stats = useMemo(
    () => (t('statsPage.heroStats', { returnObjects: true }) as StatHighlight[]) ?? [],
    [t],
  )

  return (
    <div className="container space-y-10 py-10">
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
          {t('statsPage.title')}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">{t('statsPage.heading')}</h1>
        <p className="text-base text-slate-600">{t('statsPage.description')}</p>
        <div className="flex justify-center">
          <Button onClick={() => navigate('/search')}>{t('statsPage.cta')}</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-card"
          >
            <div className="text-3xl font-semibold text-primary-700">{stat.value}</div>
            <div className="mt-2 text-sm font-medium text-slate-800">{stat.label}</div>
            <p className="mt-1 text-xs text-slate-500">{t('statsPage.disclaimer')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatisticsPage
