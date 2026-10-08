'use client'

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { motion } from '@/lib/design/tokens'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'cta'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: [
    'bg-brand-yellow hover:bg-yellow-400 text-brand-black font-bold',
    'shadow-elevation-rest hover:shadow-elevation-raised hover:scale-[1.01]',
    'disabled:opacity-50 disabled:hover:scale-100',
  ].join(' '),
  secondary:
    'bg-brand-gray-800 hover:bg-brand-gray-700 text-white border border-brand-gray-700 shadow-elevation-rest disabled:opacity-50',
  ghost:
    'text-brand-gray-700 hover:bg-brand-gray-100 border border-warm-input disabled:opacity-50',
  danger:
    'bg-red-600 hover:bg-red-700 text-white shadow-elevation-rest disabled:bg-red-300',
  outline:
    'border border-brand-yellow text-brand-black hover:bg-brand-yellow/10 disabled:opacity-50',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
  cta: 'px-6 py-3.5 text-sm font-black rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center gap-2 font-medium',
          motion.all,
          'focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2',
          'disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="h-4 w-4">{icon}</span>
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
