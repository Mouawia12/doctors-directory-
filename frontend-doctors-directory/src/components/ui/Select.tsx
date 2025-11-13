import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithRef } from 'react'

export const Select = forwardRef<HTMLSelectElement, ComponentPropsWithRef<'select'>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-100',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)

Select.displayName = 'Select'
