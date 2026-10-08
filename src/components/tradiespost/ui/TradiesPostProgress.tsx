import type { ReactNode } from 'react'

type TradiesPostProgressBarProps = {
  value: number
  max?: number
  label?: string
  hint?: string
  className?: string
  /** e.g. "75% of month sorted" */
  displayValue?: string
}

export function TradiesPostProgressBar({
  value,
  max = 100,
  label,
  hint,
  className = '',
  displayValue,
}: TradiesPostProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const display = displayValue ?? `${pct}%`

  return (
    <div className={className}>
      {(label || displayValue) && (
        <div className="mb-2 flex items-end justify-between gap-3">
          {label && <p className="tp-card-title">{label}</p>}
          <p className="tp-meta font-semibold tabular-nums text-tradiespost-text">{display}</p>
        </div>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-tradiespost-surface-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-tradiespost-gold transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && <p className="tp-meta mt-1.5">{hint}</p>}
    </div>
  )
}

type TradiesPostProgressStatProps = {
  label: string
  current: number
  total: number
  hint?: string
  icon?: ReactNode
  className?: string
}

/** Compact stat e.g. "9 / 12 approved" with optional mini bar */
export function TradiesPostProgressStat({
  label,
  current,
  total,
  hint,
  icon,
  className = '',
}: TradiesPostProgressStatProps) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0

  return (
    <div
      className={`rounded-2xl border border-tradiespost-border bg-tradiespost-surface-raised p-4 shadow-elevation-none ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="tp-label">{label}</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-tradiespost-text">
            {current}
            <span className="text-base font-semibold text-tradiespost-steel"> / {total}</span>
          </p>
        </div>
        {icon && (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-tradiespost-gold/10 text-tradiespost-gold-muted">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-tradiespost-surface-muted">
        <div
          className="h-full rounded-full bg-tradiespost-gold/80"
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && <p className="tp-meta mt-2">{hint}</p>}
    </div>
  )
}

/** Row of progress stats - home dashboard, planner header */
export function TradiesPostProgressRow({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className}`}
    >
      {children}
    </div>
  )
}
