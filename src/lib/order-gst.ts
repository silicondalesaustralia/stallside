import { gstApplies, lineGstCents } from "@/lib/gst";

export type OrderLineInput = {
  productId: string;
  productNameSnapshot: string;
  optionsSnapshot: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  memberId: string | null;
  supplierUnitCents: number | null;
  gstFree: boolean;
};

/** Order `gstCents` plus nested item creates carrying each line's GST snapshot. */
export function orderLineFields(
  lines: OrderLineInput[],
  discountCents: number,
  stand: { currency: string; owner: { gstRegistered: boolean } },
) {
  const gst = lineGstCents(
    lines,
    discountCents,
    gstApplies(stand.owner, stand.currency),
  );
  return {
    gstCents: gst.reduce((sum, cents) => sum + cents, 0),
    items: {
      create: lines.map((line, i) => ({
        productId: line.productId,
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
