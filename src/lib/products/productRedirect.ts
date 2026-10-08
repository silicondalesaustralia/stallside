// KIT SHIM - every product origin is the host origin (OAuth redirect URIs, media proxy URLs).
import type { ProductId } from '@/lib/products/productTypes'
import { hostPublicOrigin } from '@/lib/socialHost/hostConfig'

export function productPublicOrigin(_product: ProductId): string {
  return hostPublicOrigin()
}
