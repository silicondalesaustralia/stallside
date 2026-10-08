// KIT SHIM - the host app is always treated as the TradiesPost social product.
import type { ProductId } from '@/lib/products/productTypes'

export function resolveKnownProductFromHostname(_hostname: string | null | undefined): ProductId | null {
  return 'tradiespost'
}
