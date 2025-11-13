import { forwardRef, isValidElement, cloneElement } from 'react'
import type { ComponentPropsWithRef, ReactNode, ReactElement } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariants = 'primary' | 'outline' | 'ghost'

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariants
  asChild?: boolean
  children: ReactNode
}

const baseStyles =
  'inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

const variantStyles: Record<ButtonVariants, string> = {
  primary: 'bg-primary-500 text-white shadow-card hover:bg-primary-600 focus-visible:outline-primary-500',
  outline:
    'border border-slate-200 text-slate-700 hover:border-primary-300 hover:text-primary-600 focus-visible:outline-primary-500',
  ghost: 'text-slate-600 hover:text-primary-600 focus-visible:outline-primary-500',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, children, asChild, ...props }, ref) => {
    if (asChild && isValidElement(children)) {
      const childElement = children as ReactElement<{ className?: string }>
      return cloneElement(childElement, {
        className: cn(baseStyles, variantStyles[variant], childElement.props.className, className),
      })
    }

    return (
      <button ref={ref} className={cn(baseStyles, variantStyles[variant], className)} {...props}>
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
