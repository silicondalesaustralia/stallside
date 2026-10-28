import { lineGstCents } from "@/lib/gst";
import { taxConfig, taxRule, type TaxOwner, type TaxRule } from "@/lib/tax/config";

export type OrderLineInput = {
  productId: string;
  variantId?: string | null;
  productNameSnapshot: string;
  optionsSnapshot: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  memberId: string | null;
  supplierUnitCents: number | null;
  gstFree: boolean;
};

/**
 * Tax rule for charges whose amount is fixed in advance (subscriptions, memberships, open
 * amounts): tax is worked out of the price where prices include tax; nothing is added on top.
 */
export function includedTaxRule(owner: TaxOwner, currency: string): TaxRule | null {
  const rule = taxRule(taxConfig(owner, currency));
  return rule?.inclusive ? rule : null;
}

/** Order `gstCents` (sales tax) plus nested item creates carrying each line's tax snapshot. */
export function orderLineFields(lines: OrderLineInput[], discountCents: number, rule: TaxRule | null) {
  const gst = lineGstCents(lines, discountCents, rule);
  return {
    gstCents: gst.reduce((sum, cents) => sum + cents, 0),
    items: {
      create: lines.map((line, i) => ({
        productId: line.productId,
        variantId: line.variantId ?? null,
        productNameSnapshot: line.productNameSnapshot,
        optionsSnapshot: line.optionsSnapshot,
        quantity: line.quantity,
        unitPriceCents: line.unitPriceCents,
        lineTotalCents: line.lineTotalCents,
        memberId: line.memberId,
        supplierUnitCents: line.supplierUnitCents,
        gstFree: line.gstFree,
        gstCents: gst[i],
      })),
    },
  };
}
