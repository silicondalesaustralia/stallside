'use client'

import type { ReactNode } from 'react'

type TradiesPostAppPageProps = {
  children: ReactNode
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | 'connections' | '6xl'
  /** Remove inner padding for full-bleed layouts (e.g. Help Centre hero). */
  flush?: boolean
}

const widthMap = {
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-6xl',
  connections: 'max-w-[72rem]',
  '6xl': 'max-w-[1440px]',
}

export function TradiesPostAppPage({
  children,
  maxWidth = 'lg',
  flush = false,
}: TradiesPostAppPageProps) {
  return (
    <div className="min-h-full bg-tradiespost-surface text-tradiespost-text" data-tp-theme>
      <div
        className={`mx-auto ${flush ? '' : 'p-4 sm:p-6 lg:p-8'} ${widthMap[maxWidth]}`}
      >
        {children}
      </div>
    </div>
  )
}

export function TradiesPostLoading() {
  return (
    <div className="flex h-64 items-center justify-center" data-tp-theme>
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#E4E4E7] border-t-[#F5C518]"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
