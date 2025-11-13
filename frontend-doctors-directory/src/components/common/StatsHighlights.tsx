import { useLocaleText } from '@/app/hooks/useLocaleText'

const stats = [
  {
    value: '220+',
    label: ['معالجون مرخّصون', 'Licensed therapists'],
    description: ['مختصون في مدارس علاجية متنوعة', 'Experts across diverse therapy schools'],
  },
  {
    value: '35',
    label: ['مدن مغطاة', 'Cities covered'],
    description: ['في منطقة الشرق الأوسط وشمال أفريقيا', 'Across MENA region'],
  },
  {
    value: '1.2k',
    label: ['جلسات موثوقة', 'Trusted sessions'],
    description: ['تقيّم ويتم مراجعتها باستمرار', 'Reviewed and quality checked'],
  },
]

export const StatsHighlights = () => {
  const translate = useLocaleText()

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.value} className="rounded-3xl border border-white/60 bg-white/50 p-6 text-center shadow-card">
          <div className="text-3xl font-semibold text-primary-600">{stat.value}</div>
          <div className="mt-2 text-sm font-medium text-slate-800">{translate(stat.label[0], stat.label[1])}</div>
          <p className="text-xs text-slate-500">{translate(stat.description[0], stat.description[1])}</p>
        </div>
      ))}
    </div>
  )
}
