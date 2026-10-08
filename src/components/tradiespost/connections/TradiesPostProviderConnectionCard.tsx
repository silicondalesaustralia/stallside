'use client'

import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { TradiesPostButtonLight } from '@/components/tradiespost/ui/TradiesPostButton'
import { TradiesPostStatusBadge } from '@/components/tradiespost/ui/TradiesPostStatusBadge'

export type TradiesPostConnectionCardStatus = 'connected' | 'not_connected' | 'coming_soon'

type TradiesPostProviderConnectionCardProps = {
  name: string
  benefit: string
  icon: ReactNode
  status?: TradiesPostConnectionCardStatus
  /** @deprecated Prefer `status="connected"` */
  connected?: boolean
  connectedDetail?: string
  statusBlock?: ReactNode
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  testId?: string
}

function resolveStatus(
  status: TradiesPostConnectionCardStatus | undefined,
  connected: boolean,
): TradiesPostConnectionCardStatus {
  if (status) return status
  return connected ? 'connected' : 'not_connected'
}

export function TradiesPostProviderConnectionCard({
  name,
  benefit,
  icon,
  status,
  connected = false,
  connectedDetail,
  statusBlock,
  primaryAction,
  secondaryAction,
  testId,
}: TradiesPostProviderConnectionCardProps) {
  const resolved = resolveStatus(status, connected)

  const badge =
    resolved === 'coming_soon'
      ? { status: 'coming_soon' as const, label: 'Coming soon' }
      : resolved === 'connected'
        ? { status: 'published' as const, label: 'Connected' }
        : { status: 'draft' as const, label: 'Not connected' }

  return (
    <article className="connection-card" data-testid={testId}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
          {icon}
        </div>
        <TradiesPostStatusBadge status={badge.status} label={badge.label} dot />
      </div>

      <h3 className="mt-4 text-base font-black text-[#18181B]">{name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{benefit}</p>

      {resolved === 'connected' && connectedDetail ? (
        <div className="mt-4 flex items-start gap-2 text-sm text-emerald-800">
          <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span className="font-semibold">{connectedDetail}</span>
        </div>
      ) : null}

      {statusBlock ? <div className="mt-4">{statusBlock}</div> : null}

      {(primaryAction || secondaryAction) && (
        <div className="connection-card__actions space-y-2">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </article>
  )
}

export function TradiesPostConnectionHelpLink({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-semibold text-zinc-600 underline decoration-[#F5C518]/50 hover:text-[#18181B]"
    >
      {children}
    </button>
  )
}

export function TradiesPostConnectionPrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <TradiesPostButtonLight
      type="button"
      variant="primary"
      size="sm"
      className="w-full"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </TradiesPostButtonLight>
  )
}

export function TradiesPostConnectionSecondaryButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-semibold text-zinc-500 hover:text-zinc-700"
    >
      {children}
    </button>
  )
}

export function TradiesPostConnectionExternalLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block text-xs font-semibold text-zinc-600 underline decoration-[#F5C518]/50 hover:text-[#18181B]"
    >
      {children}
    </a>
  )
}
