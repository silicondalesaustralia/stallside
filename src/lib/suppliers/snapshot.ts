/** Fields copied onto an order line so later price edits do not rewrite history. */
export function supplierLineSnapshot(product: {
  memberId: string | null;
  supplierUnitCents: number | null;
}): { memberId: string | null; supplierUnitCents: number | null } {
  if (!product.memberId) {
    return { memberId: null, supplierUnitCents: null };
  }
  return {
    memberId: product.memberId,
    supplierUnitCents: product.supplierUnitCents,
  };
}
