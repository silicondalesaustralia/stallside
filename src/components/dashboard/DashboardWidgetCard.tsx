import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ContextualEmpty } from '@/components/ui/ContextualEmpty'

export const DASHBOARD_ICON_WRAP = 'rounded-lg bg-[#FFD100]/20 p-1.5'
export const DASHBOARD_ICON = 'h-5 w-5 shrink-0 text-[#886600]'
export const DASHBOARD_CTA =
  'shrink-0 text-sm font-semibold text-[#FFD100] hover:text-yellow-500'

export function DashboardWidgetCard({
  title,
  icon: Icon,
  href,
  cta,
  children,
  empty,
  emptyDescription,
  emptyHref,
  emptyCta,
}: {
  title: string
  icon: LucideIcon
  href?: string
  cta?: string
  children?: React.ReactNode
  empty?: string | null
  emptyDescription?: string | null
  emptyHref?: string
  emptyCta?: string
}) {
  const showHeaderCta = Boolean(href && cta) && !(empty && emptyHref && emptyCta)
  return (
    <Card as="section" padding="md" elevation="rest" className="mt-6 min-w-0">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className={DASHBOARD_ICON_WRAP}>
            <Icon className={DASHBOARD_ICON} />
          </div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>
        {showHeaderCta ? (
          <Link href={href!} className={DASHBOARD_CTA}>
            {cta}
          </Link>
        ) : null}
      </div>
      {empty ? (
        <ContextualEmpty
          title={empty}
          description={emptyDescription ?? undefined}
          href={emptyHref}
          cta={emptyCta}
        />
      ) : null}
      {children}
    </Card>
  )
}

export function DashboardMetricGrid({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string; alert?: boolean }>
}) {
  const cols =
    items.length >= 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : items.length === 2
        ? 'sm:grid-cols-2'
        : items.length === 1
          ? 'sm:grid-cols-1'
          : 'sm:grid-cols-3'
  return (
    <div className={`grid min-w-0 grid-cols-1 gap-3 ${cols}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-0 rounded-xl border border-[#FFD100]/25 bg-[#FFFBEA] p-3"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[#886600]">{item.label}</p>
          <p className={`mt-1 break-words text-xl font-bold ${item.alert ? 'text-red-600' : 'text-gray-900'}`}>
            {item.value}
          </p>
          {item.hint ? <p className="mt-0.5 text-xs text-gray-400">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  )
}
