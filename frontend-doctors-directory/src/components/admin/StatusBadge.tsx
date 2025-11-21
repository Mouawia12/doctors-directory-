import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { DoctorStatus } from '@/types/doctor'

const toneMap: Record<DoctorStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
}

export const StatusBadge = ({ status }: { status: DoctorStatus }) => {
  const { t } = useTranslation()
  const labelMap: Record<DoctorStatus, string> = {
    pending: t('common.statuses.pending'),
    approved: t('common.statuses.approved'),
    rejected: t('common.statuses.rejected'),
  }

  return (
    <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', toneMap[status])}>
      {labelMap[status]}
    </span>
  )
}
