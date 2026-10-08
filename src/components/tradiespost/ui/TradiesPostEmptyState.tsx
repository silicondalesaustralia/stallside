import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { TradiesPostButtonLight } from './TradiesPostButton'

type TradiesPostEmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  secondaryAction?: ReactNode
}

export function TradiesPostEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryAction,
}: TradiesPostEmptyStateProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-[#E4E4E7] bg-[#FAFAFA] px-6 py-12 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5C518]/15">
          <Icon className="h-7 w-7 text-[#F5C518]" aria-hidden />
        </div>
      )}
      <h2 className="text-xl font-black text-[#18181B] sm:text-2xl">{title}</h2>
      {description && (
        <p className="mt-2 max-w-md text-sm text-zinc-600">{description}</p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {actionLabel && actionHref && (
          <TradiesPostButtonLight href={actionHref}>{actionLabel}</TradiesPostButtonLight>
        )}
        {actionLabel && onAction && !actionHref && (
          <TradiesPostButtonLight onClick={onAction}>{actionLabel}</TradiesPostButtonLight>
        )}
        {secondaryAction}
      </div>
    </div>
  )
}

export function TradiesPostBadge({
  children,
  variant = 'gold',
  className = '',
}: {
  children: ReactNode
  variant?: 'gold' | 'dark' | 'muted'
  className?: string
}) {
  const variants = {
    gold: 'bg-[#F5C518]/15 text-[#B8860B] border-[#F5C518]/30',
    dark: 'bg-[#1A1A1A] text-[#F5C518] border-[#2A2A2A]',
    muted: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
