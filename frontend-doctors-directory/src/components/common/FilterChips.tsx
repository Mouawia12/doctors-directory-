interface FilterChipsProps {
  filters: Record<string, string | number | undefined>
  onRemove: (key: string) => void
  labels?: Record<string, string>
}

export const FilterChips = ({ filters, onRemove, labels }: FilterChipsProps) => {
  const entries = Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([key, value]) => (
        <button
          key={key}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
          onClick={() => onRemove(key)}
        >
          {(labels?.[key] ?? key)}: {value}
          <span className="text-slate-400">✕</span>
        </button>
      ))}
    </div>
  )
}
