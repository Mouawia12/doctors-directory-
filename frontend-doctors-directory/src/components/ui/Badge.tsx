import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'info'
  className?: string
}

const variantStyles = {
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  info: 'bg-primary-50 text-primary-700 border border-primary-100',
}

export const Badge = ({ children, variant = 'info', className }: BadgeProps) => {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium', variantStyles[variant], className)}>
      {children}
    </span>
  )
}
