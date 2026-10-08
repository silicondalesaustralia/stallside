'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SOCIAL_PATHS } from '@/lib/socialHost/hostConfig'

const TABS = [
  { href: SOCIAL_PATHS.create, label: 'Create' },
  { href: SOCIAL_PATHS.library, label: 'Library' },
  { href: SOCIAL_PATHS.planner, label: 'Planner' },
  { href: SOCIAL_PATHS.posts, label: 'Posts' },
  { href: SOCIAL_PATHS.calendar, label: 'Calendar' },
  { href: SOCIAL_PATHS.connections, label: 'Connections' },
  { href: SOCIAL_PATHS.brand, label: 'Brand' },
] as const

export default function SocialSubnav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Social" className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--line)]">
      {TABS.map((tab) => {
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
  )
}
