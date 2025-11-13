interface EmptyStateProps {
  title: string
  description?: string
}

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-10 text-center">
    <p className="text-lg font-semibold text-slate-700">{title}</p>
    {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
  </div>
)
