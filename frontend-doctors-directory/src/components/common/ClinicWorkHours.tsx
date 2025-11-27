import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const DAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

interface ClinicWorkHoursProps {
  workHours?: Record<string, string[] | undefined> | null
  className?: string
}

const formatSlots = (slots: string[], closedLabel: string) => {
  if (slots.length === 0) return closedLabel
  if (slots.length === 1) return slots[0]
  if (slots.length === 2) return `${slots[0]} – ${slots[1]}`
  return slots.join(' / ')
}

export const ClinicWorkHours = ({ workHours, className }: ClinicWorkHoursProps) => {
  const { t } = useTranslation()

  const entries = useMemo(() => {
    if (!workHours) return []
    return DAY_ORDER.filter((day) => workHours[day]?.length)
      .map((day) => ({ day, slots: workHours[day] ?? [] }))
  }, [workHours])

  if (!entries.length) {
    return (
      <p className={cn('text-xs text-slate-500', className)}>
        {t('doctorProfile.hoursNotProvided')}
      </p>
    )
  }

  const closedLabel = t('doctorProfile.hoursClosed')

  return (
    <div className={cn('space-y-1 text-xs text-slate-600', className)}>
      {entries.map(({ day, slots }) => (
        <div
          key={day}
          className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2"
        >
          <span className="font-medium text-slate-700">{t(`common.days.${day}`)}</span>
          <span className="text-slate-600">
            {formatSlots(slots, closedLabel)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default ClinicWorkHours
