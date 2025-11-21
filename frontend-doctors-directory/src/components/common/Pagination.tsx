import { useTranslation } from 'react-i18next'

interface PaginationProps {
  page: number
  perPage: number
  total: number
  onChange: (page: number) => void
}

export const Pagination = ({ page, perPage, total, onChange }: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const { t } = useTranslation()

  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
      <button
        className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {t('pagination.previous')}
      </button>
      <span className="text-slate-600">
        {t('pagination.page', { page, total: totalPages })}
      </span>
      <button
        className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        {t('pagination.next')}
      </button>
    </div>
  )
}
