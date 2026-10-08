import type { ReactNode } from 'react'
import type { TradiesPostCardVariant } from '@/lib/tradiespost/tokens'

type TradiesPostCardProps = {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  elevated?: boolean
  /** @deprecated Prefer `variant="feature"` */
  dark?: boolean
  variant?: TradiesPostCardVariant
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6 sm:p-8',
}

const variantClasses: Record<TradiesPostCardVariant, string> = {
  standard:
    'border-tradiespost-border bg-tradiespost-surface-raised text-tradiespost-text shadow-elevation-rest',
  feature:
    'border-tradiespost-charcoal-border bg-tradiespost-charcoal-raised text-white',
  highlight:
    'border-tradiespost-gold/25 bg-tradiespost-gold-highlight text-tradiespost-text',
  content:
    'border-tradiespost-border bg-tradiespost-surface-raised text-tradiespost-text overflow-hidden p-0',
  empty:
    'border-dashed border-tradiespost-border bg-tradiespost-surface text-tradiespost-text text-center',
  dashed:
    'border-dashed border-tradiespost-border bg-tradiespost-surface text-tradiespost-text',
}

export function TradiesPostCard({
  children,
  className = '',
  padding = 'md',
  elevated = true,
  dark = false,
  variant,
}: TradiesPostCardProps) {
  const resolvedVariant: TradiesPostCardVariant =
    variant ?? (dark ? 'feature' : 'standard')

  const shadow =
    elevated && resolvedVariant === 'standard'
      ? 'shadow-elevation-rest'
      : elevated && resolvedVariant === 'highlight'
        ? 'shadow-elevation-none'
        : ''

  const pad = resolvedVariant === 'content' ? '' : paddingMap[padding]

  return (
    <div
      className={`rounded-[16px] border ${variantClasses[resolvedVariant]} ${shadow} ${pad} ${className}`}
    >
      {children}
    </div>
  )
}
