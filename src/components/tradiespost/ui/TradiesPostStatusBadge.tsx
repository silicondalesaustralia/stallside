import type { ReactNode } from 'react'
import {
  getTradiesPostStatusStyle,
  type TradiesPostStatus,
} from '@/lib/tradiespost/status'

type TradiesPostStatusBadgeProps = {
  status: TradiesPostStatus
  label?: string
  className?: string
  dot?: boolean
}

export function TradiesPostStatusBadge({
  status,
  label,
  className = '',
  dot = false,
}: TradiesPostStatusBadgeProps) {
  const style = getTradiesPostStatusStyle(status)
  const text = label ?? style.label

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 sm:px-2.5 py-0.5 text-[10px] font-semibold leading-none sm:text-[11px] ${style.className} ${className}`}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-70"
          aria-hidden
        />
      )}
      {text}
    </span>
  )
}

/** Inline status row for metadata lines under thumbnails */
export function TradiesPostStatusRow({
  status,
  meta,
  className = '',
}: {
  status: TradiesPostStatus
  meta?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <TradiesPostStatusBadge status={status} dot />
      {meta && <span className="tp-meta">{meta}</span>}
    </div>
  )
}
