'use client'

import { createContext, useContext, type ReactNode } from 'react'

export type SocialProductVariant = 'stitchedup' | 'tradiespost'

const SocialProductVariantContext = createContext<SocialProductVariant>('stitchedup')

export function SocialProductVariantProvider({
  variant,
  children,
}: {
  variant: SocialProductVariant
  children: ReactNode
}) {
  return (
    <SocialProductVariantContext.Provider value={variant}>
      {children}
    </SocialProductVariantContext.Provider>
  )
}

export function useSocialProductVariant(): SocialProductVariant {
  return useContext(SocialProductVariantContext)
}
