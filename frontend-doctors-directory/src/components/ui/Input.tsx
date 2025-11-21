import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithRef } from 'react'

export const Input = forwardRef<HTMLInputElement, ComponentPropsWithRef<'input'>>(
  ({ className, 'aria-invalid': ariaInvalid, ...props }, ref) => {
    const invalid = ariaInvalid === true || ariaInvalid === 'true'
    return (
      <input
        ref={ref}
        aria-invalid={ariaInvalid}
        className={cn(
          'w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100',
          invalid && 'border-red-400 focus:border-red-400 focus:ring-red-100',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
