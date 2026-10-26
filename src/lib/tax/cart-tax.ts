import { lineGstCents } from "@/lib/gst";
import { taxConfig, type TaxOwner } from "./config";

/** Sales tax the shopper sees added at checkout (US/CA); null where prices already include tax. */
export type CartAddedTax = { name: string; rateBps: number; taxFreeProductIds: string[] };

export function cartAddedTax(stand: {
  currency: string;
  owner: TaxOwner;
  products: { id: string; gstFree: boolean }[];
}): CartAddedTax | null {
  const config = taxConfig(stand.owner, stand.currency);
  if (!config.applies || config.inclusive) return null;
  return {
    name: config.name,
    rateBps: config.rateBps,
    taxFreeProductIds: stand.products.filter((p) => p.gstFree).map((p) => p.id),
  };
}

/** Same maths as the server's checkout total, so the cart shows exactly what will be charged. */
export function cartAddedTaxCents(
  tax: CartAddedTax | null,
  lines: { productId: string; lineTotalCents: number }[],
  discountCents: number,
): number {
  if (!tax) return 0;
  const free = new Set(tax.taxFreeProductIds);
  return lineGstCents(
    lines.map((l) => ({ lineTotalCents: l.lineTotalCents, gstFree: free.has(l.productId) })),
    discountCents,
    { rateBps: tax.rateBps, inclusive: false },
  ).reduce((sum, cents) => sum + cents, 0);
}
