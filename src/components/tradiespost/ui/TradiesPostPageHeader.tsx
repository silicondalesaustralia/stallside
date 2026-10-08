import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type TradiesPostPageHeaderProps = {
  title: string
  subtitle?: string
  eyebrow?: string
  action?: ReactNode
  dark?: boolean
}

export function TradiesPostPageHeader({
  title,
  subtitle,
  eyebrow,
  action,
  dark = false,
}: TradiesPostPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${
              dark ? 'text-zinc-500' : 'text-zinc-400'
            }`}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className={`mt-1 text-2xl font-black tracking-tight sm:text-3xl ${
            dark ? 'text-white' : 'text-[#18181B]'
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-1.5 max-w-2xl text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

type TradiesPostStatCardProps = {
  label: string
  value: string | number
  icon?: LucideIcon
  hint?: string
}

export function TradiesPostStatCard({ label, value, icon: Icon, hint }: TradiesPostStatCardProps) {
  return (
    <div className="rounded-2xl border border-[#E4E4E7] bg-white p-4 shadow-[0_4px_24px_-4px_rgb(10_10_10_/_0.08)]">
      {Icon && <Icon className="mb-2 h-4 w-4 text-[#F5C518]" aria-hidden />}
      <p className="text-2xl font-black tabular-nums text-[#18181B]">{value}</p>
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      {hint && <p className="mt-1 text-[10px] text-zinc-400">{hint}</p>}
    </div>
  )
}
