'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { motion } from '@/lib/design/tokens'

type TabsContextValue = {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>')
  return ctx
}

export function Tabs({
  value,
  onValueChange,
  children,
  className = '',
}: {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
  className?: string
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={`flex snap-x snap-mandatory gap-1 overflow-x-auto scroll-pl-1 border-b border-warm-border pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className = '',
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const { value: active, onValueChange } = useTabsContext()
  const isActive = active === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={[
        'min-h-11 flex-shrink-0 snap-start whitespace-nowrap rounded-t-lg px-3 py-2.5 text-sm transition-colors',
        isActive
          ? 'border-b-2 border-[#FFD100] bg-white font-semibold text-[#111]'
          : `font-medium text-[#888] ${motion.colors} hover:bg-[#FAFAF7] hover:text-[#444]`,
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className = '',
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const { value: active } = useTabsContext()
  if (active !== value) return null

  return (
    <div role="tabpanel" className={`space-y-6 pt-6 ${className}`}>
      {children}
    </div>
  )
}
