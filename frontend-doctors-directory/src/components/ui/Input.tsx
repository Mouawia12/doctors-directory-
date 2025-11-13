import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithRef } from 'react'

export const Input = forwardRef<HTMLInputElement, ComponentPropsWithRef<'input'>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100',
      className,
    )}
    {...props}
  />
))

Input.displayName = 'Input'
