/** Vendl content a social post can be "about" (shared by client + server). */
export type VendlContentKind = 'product' | 'preorder' | 'subscription' | 'membership'

export type VendlContentItem = {
  /** `product:<id>` | `preorder:<id>` | `offer:<id>` */
  ref: string
  kind: VendlContentKind
  title: string
  subtitle: string | null
  imageUrl: string | null
}

export const VENDL_CONTENT_KIND_LABEL: Record<VendlContentKind, string> = {
  product: 'Product',
  preorder: 'Pre-order page',
  subscription: 'Subscription',
  membership: 'Membership',
}

export type VendlContentRef = { source: 'product' | 'preorder' | 'offer'; id: string }

export function parseVendlContentRef(ref: unknown): VendlContentRef | null {
  if (typeof ref !== 'string') return null
  const match = ref.match(/^(product|preorder|offer):([A-Za-z0-9_-]{1,64})$/)
  if (!match) return null
  return { source: match[1] as VendlContentRef['source'], id: match[2] }
}
