export interface FilterChipItem {
  key: string
  label: string
  value: string | number
  displayValue?: string
  removeValue?: string | number
}

interface FilterChipsProps {
  items: FilterChipItem[]
  onRemove: (key: string, value: string | number) => void
}

export const FilterChips = ({ items, onRemove }: FilterChipsProps) => {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={`${item.key}-${item.value}`}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-primary-200 hover:text-primary-700"
          onClick={() => onRemove(item.key, item.removeValue ?? item.value)}
          type="button"
        >
          {item.label}: {item.displayValue ?? item.value}
          <span className="text-slate-400" aria-hidden="true">
            ✕
          </span>
        </button>
      ))}
    </div>
  )
}
