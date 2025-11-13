import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className }: CardProps) => (
  <div className={cn('rounded-3xl border border-slate-100 bg-white p-6 shadow-card', className)}>{children}</div>
)
