import { useLocaleText } from '@/app/hooks/useLocaleText'
import { cn } from '@/lib/utils'
import type { DoctorStatus } from '@/types/doctor'

const toneMap: Record<DoctorStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
}

export const StatusBadge = ({ status }: { status: DoctorStatus }) => {
  const translate = useLocaleText()
  const labelMap: Record<DoctorStatus, string> = {
    pending: translate('قيد المراجعة', 'Pending'),
    approved: translate('معتمد', 'Approved'),
    rejected: translate('مرفوض', 'Rejected'),
  }

  return (
    <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', toneMap[status])}>
      {labelMap[status]}
    </span>
  )
}
