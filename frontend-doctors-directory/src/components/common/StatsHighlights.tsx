import { useTranslation } from 'react-i18next'

const stats = [
  {
    value: '220+',
    labelKey: 'stats.licensed',
    descriptionKey: 'stats.licensedDescription',
  },
  {
    value: '35',
    labelKey: 'stats.cities',
    descriptionKey: 'stats.citiesDescription',
  },
  {
    value: '1.2k',
    labelKey: 'stats.sessions',
    descriptionKey: 'stats.sessionsDescription',
  },
]

export const StatsHighlights = () => {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.value} className="rounded-3xl border border-white/60 bg-white/50 p-6 text-center shadow-card">
          <div className="text-3xl font-semibold text-primary-600">{stat.value}</div>
          <div className="mt-2 text-sm font-medium text-slate-800">{t(stat.labelKey)}</div>
          <p className="text-xs text-slate-500">{t(stat.descriptionKey)}</p>
        </div>
      ))}
    </div>
  )
}
