import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithRef } from 'react'

export const Checkbox = forwardRef<HTMLInputElement, ComponentPropsWithRef<'input'>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded-md border border-slate-300 text-primary-500 focus:ring-primary-400 focus:ring-offset-0',
        className,
      )}
      {...props}
    />
  ),
)

Checkbox.displayName = 'Checkbox'
