import { useId } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { motion } from '@/lib/design/tokens'

/** Shared text field / select styling for settings forms.
 *  text-base (16px) avoids iOS zoom on focus. */
export const SETTINGS_INPUT =
  'w-full rounded-lg border border-warm-input bg-white px-3 py-2 text-base text-[#111] outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20'

export const SETTINGS_INPUT_RELATIVE =
  'w-full rounded-lg border border-warm-input bg-white py-2 text-base text-[#111] outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20'

/** Long SMS, URLs, and dial strings must wrap instead of overflowing. */
export const TEXT_WRAP_ANYWHERE = 'min-w-0 break-words [overflow-wrap:anywhere]'

/** Practical 44px touch target on compact actions. */
export const TOUCH_TARGET = 'min-h-11'

export const SETTINGS_LABEL = 'mb-1 block text-sm font-medium text-[#444]'

export const SETTINGS_HINT = 'mt-1 text-xs text-[#888]'

/** Setup Phone card chrome - reuse on Settings sections (no numbered steps). */
export const SETTINGS_CARD =
  'overflow-x-hidden rounded-xl border border-warm-border bg-white p-5 sm:p-6'

export const SETTINGS_PAGE_NARROW = 'mx-auto max-w-2xl space-y-8 p-4 sm:p-6 lg:p-8'

export const SETTINGS_PAGE_WIDE = 'mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8'

/** First-class operational modules - matches CRM / dashboard content width. */
export const SETTINGS_PAGE_MODULE = 'mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8'

/** Wizard pages - no space-y on the shell so fields are not stretched apart. */
export const SETTINGS_PAGE_WIZARD = 'mx-auto w-full max-w-[960px] p-4 sm:p-6 lg:p-8'

/** Prominent back control for settings sub-pages (above breadcrumb/header). */
export function SettingsBackLink({
  href,
  label,
  className = '',
}: {
  href: string
  label: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`mb-4 inline-flex items-center gap-2 rounded-lg border border-warm-border bg-white px-3 py-2 text-sm font-semibold text-[#444] shadow-elevation-rest ${motion.all} hover:border-brand-yellow/50 hover:bg-[#FFFBEA] hover:text-[#111] ${className}`}
    >
      <ArrowLeft className="h-4 w-4 flex-shrink-0" aria-hidden />
      {label}
    </Link>
  )
}

export function SettingsBreadcrumb({
  segments,
}: {
  segments: { label: string; href?: string }[]
}) {
  return (
    <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-[#888]">
      {segments.map((seg, i) => (
        <span key={seg.label} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          {seg.href ? (
            <a href={seg.href} className={`${motion.colors} hover:text-[#444]`}>
              {seg.label}
            </a>
          ) : (
            <span className="font-medium text-[#111]">{seg.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}

export function SettingsConnectedBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      {children}
    </span>
  )
}

export function SettingsNotConnectedBadge() {
  return (
    <span className="rounded-full bg-surface-nested px-2 py-0.5 text-xs font-medium text-[#666]">
      Not connected
    </span>
  )
}

export function SettingsComingSoonBadge() {
  return (
    <span className="rounded-full bg-[#E0DDD5] px-2 py-0.5 text-xs font-medium text-[#666]">
      Coming soon
    </span>
  )
}

export function SettingsHelpLink({
  children,
  onClick,
  href,
}: {
  children: React.ReactNode
  onClick?: () => void
  href?: string
}) {
  const className = 'text-xs font-medium text-[#888] hover:text-[#555] hover:underline'
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  )
}

export function SettingsGroup({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-lg font-bold text-[#111]">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-[#666]">{description}</p> : null}
      </header>
      {children}
    </section>
  )
}

export function SettingsIntegrationCard({
  icon: Icon,
  iconClassName = 'text-[#666]',
  iconBgClassName = 'bg-surface-nested',
  title,
  description,
  badge,
  action,
  help,
  muted: _muted = false,
  children,
}: {
  icon: LucideIcon
  iconClassName?: string
  iconBgClassName?: string
  title: string
  description?: string
  badge?: React.ReactNode
  action?: React.ReactNode
  help?: React.ReactNode
  muted?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className={`${SETTINGS_CARD} h-full !p-4 sm:!p-5`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBgClassName}`}>
          <Icon className={`h-5 w-5 ${iconClassName}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-[#111]">{title}</h3>
            {badge}
          </div>
          {description ? <p className="mt-1 text-sm text-[#666]">{description}</p> : null}
          {action ? <div className="mt-3">{action}</div> : null}
          {help ? <div className="mt-2">{help}</div> : null}
          {children ? <div className="mt-3 space-y-3">{children}</div> : null}
        </div>
      </div>
    </div>
  )
}

export function SettingsFormPanel({
  title,
  description,
  children,
  className = '',
}: {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card padding="md" className={className}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-sm font-semibold text-[#111]">{title}</h3>}
          {description && <p className="mt-0.5 text-xs text-[#888]">{description}</p>}
        </div>
      )}
      {children}
    </Card>
  )
}

export function SettingsPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold text-[#111] sm:text-2xl">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-[#888]">{description}</p>}
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
  )
}

export function SettingsActionCard({
  href,
  icon: Icon,
  title,
  description,
  actionLabel,
  status,
}: {
  href: string
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  status?: string
}) {
  return (
    <a
      href={href}
      className={`${SETTINGS_CARD} flex items-center justify-between gap-3 ${motion.all} hover:border-[#FFD100]/70`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FFD100]">
          <Icon className="h-5 w-5 text-[#0A0A0A]" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-[#111]">{title}</h3>
          <p className="mt-0.5 break-words text-sm text-[#666] [overflow-wrap:anywhere]">{description}</p>
          {status ? <p className="mt-1 text-xs font-semibold text-[#888]">{status}</p> : null}
          {actionLabel ? <p className="mt-1 text-sm font-semibold text-[#111]">{actionLabel}</p> : null}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-[#BBB]" />
    </a>
  )
}

/** @deprecated Prefer SettingsActionCard - kept so existing imports keep working. */
export function SettingsLinkCard({
  href,
  icon,
  title,
  description,
  actionLabel,
}: {
  href: string
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  variant?: 'gold' | 'green' | 'neutral'
  iconClassName?: string
}) {
  return (
    <SettingsActionCard
      href={href}
      icon={icon}
      title={title}
      description={description}
      actionLabel={actionLabel}
    />
  )
}

export function SettingsSection({
  id,
  icon: Icon,
  title,
  description,
  children,
  iconClassName = 'text-[#0A0A0A]',
}: {
  id?: string
  icon: LucideIcon
  title: string
  description?: string
  children: React.ReactNode
  iconClassName?: string
}) {
  return (
    <section id={id} className={`${SETTINGS_CARD} scroll-mt-24`}>
      <header className="mb-5">
        <h2 className="flex items-center gap-3 text-lg font-bold text-[#111]">
          <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#FFD100]">
            <Icon className={`h-3.5 w-3.5 ${iconClassName}`} />
          </span>
          <span>{title}</span>
        </h2>
        {description ? <p className="mt-1 pl-10 text-sm text-[#666]">{description}</p> : null}
      </header>
      {children}
    </section>
  )
}

export function SettingsNestedPanel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card nested padding="md" className={className}>
      {children}
    </Card>
  )
}

export function SettingsSwitch({
  checked,
  onChange,
  id: idProp,
  'aria-label': ariaLabel,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  'aria-label'?: string
}) {
  const fallbackId = useId()
  const id = idProp ?? fallbackId

  return (
    <span className="relative inline-flex min-h-11 min-w-11 flex-shrink-0 items-center justify-center">
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
        aria-checked={checked}
        aria-label={ariaLabel}
      />
      <span
        aria-hidden="true"
        className="relative h-6 w-11 rounded-full bg-[#E0DDD5] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-warm-input after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-yellow peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-brand-yellow/25"
      />
    </span>
  )
}

export function SettingsToggleRow({
  label,
  hint,
  checked,
  onChange,
  id,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
}) {
  const autoId = useId()
  const switchId = id ?? autoId

  return (
    <label
      htmlFor={switchId}
      className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-warm-border px-4 py-3.5 ${motion.colors} hover:bg-[#FAFAF7]`}
    >
      <div className="min-w-0 flex-1 select-none">
        <span className="text-sm font-medium text-[#111]">{label}</span>
        {hint && <p className="text-xs text-[#888]">{hint}</p>}
      </div>
      <SettingsSwitch id={switchId} checked={checked} onChange={onChange} />
    </label>
  )
}

export function SettingsExpandableSection({
  title,
  hint,
  meta,
  defaultOpen = false,
  children,
}: {
  title: string
  hint: string
  meta?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details open={defaultOpen} className="group overflow-x-hidden rounded-xl border border-warm-border bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[#111]">{title}</span>
          <span className="mt-0.5 block text-xs text-[#666]">{hint}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#888]">
          {meta ? <span className="hidden text-right sm:inline">{meta}</span> : null}
          <span aria-hidden className="text-[#111] group-open:rotate-90">
            ›
          </span>
        </span>
      </summary>
      <div className="space-y-4 overflow-x-hidden border-t border-warm-border px-4 py-4">{children}</div>
    </details>
  )
}

export function SettingsCallout({
  tone = 'amber',
  children,
}: {
  tone?: 'amber' | 'green'
  children: React.ReactNode
}) {
  const surface =
    tone === 'green'
      ? 'border-green-200 bg-green-50 text-green-800'
      : 'border-amber-200 bg-amber-50 text-amber-900'
  return (
    <p className={`rounded-lg border px-3 py-2 text-sm ${surface}`}>{children}</p>
  )
}

export function SettingsFieldLabel({
  htmlFor,
  children,
  className = '',
}: {
  htmlFor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label htmlFor={htmlFor} className={`${SETTINGS_LABEL} ${className}`}>
      {children}
    </label>
  )
}
