import { cn } from '@/lib/utils'

interface PhoneNumberProps {
  value?: string | null
  className?: string
}

export const PhoneNumber = ({ value, className }: PhoneNumberProps) => {
  if (!value) return null

  return (
    <span
      dir="ltr"
      className={cn('font-mono tracking-[0.08em]', className)}
      style={{ unicodeBidi: 'bidi-override' }}
    >
      {value.trim()}
    </span>
  )
}

export default PhoneNumber
