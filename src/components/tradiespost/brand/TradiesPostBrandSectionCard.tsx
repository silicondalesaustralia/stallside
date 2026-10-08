'use client'

import type { ReactNode } from 'react'
import { TradiesPostCard } from '@/components/tradiespost/ui'
import { TradiesPostSectionTitle } from '@/components/tradiespost/ui/TradiesPostTypography'

type TradiesPostBrandSectionCardProps = {
  title: string
  children: ReactNode
  className?: string
}

export function TradiesPostBrandSectionCard({
  title,
  children,
  className = '',
}: TradiesPostBrandSectionCardProps) {
  return (
    <TradiesPostCard padding="md" className={className}>
      <TradiesPostSectionTitle className="mb-4 text-xs font-black uppercase tracking-wide text-zinc-500">
        {title}
      </TradiesPostSectionTitle>
      {children}
    </TradiesPostCard>
  )
}
