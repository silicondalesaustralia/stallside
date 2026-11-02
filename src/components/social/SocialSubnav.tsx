'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SOCIAL_PATHS } from '@/lib/socialHost/hostConfig'

const TABS = [
  { href: SOCIAL_PATHS.create, label: 'Create' },
  { href: SOCIAL_PATHS.library, label: 'Library' },
  { href: SOCIAL_PATHS.videos, label: 'Videos' },
  { href: SOCIAL_PATHS.planner, label: 'Planner' },
  { href: SOCIAL_PATHS.posts, label: 'Posts' },
  { href: SOCIAL_PATHS.calendar, label: 'Calendar' },
  { href: SOCIAL_PATHS.connections, label: 'Connections' },
  { href: SOCIAL_PATHS.brand, label: 'Brand' },
  { href: SOCIAL_PATHS.credits, label: 'Credits' },
] as const

type Props = {
  disabled?: boolean
  /** Shown at the right of the tab bar (credit balance). */
  aside?: ReactNode
}

export default function SocialSubnav({ disabled = false, aside }: Props) {
  const pathname = usePathname()
  return (
    <div className="mb-6 flex items-center gap-3 border-b border-[var(--line)]">
      <nav aria-label="Social" className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          if (disabled) {
            return (
              <span
                key={tab.href}
                aria-disabled="true"
                title="Coming soon"
                className="cursor-not-allowed whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm font-semibold text-[var(--muted)] opacity-50"
              >
                {tab.label}
              </span>
            )
          }
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${
                active
                  ? 'border-[var(--leaf)] text-[var(--ink)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  )
}
