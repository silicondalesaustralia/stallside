import type { MobileSupplierRow, SupplierDetailResponse } from "@/contracts/mobile/suppliers";
import type { getOwnerSupplier, listOwnerSuppliers } from "@/lib/suppliers/members";

type Row = Awaited<ReturnType<typeof listOwnerSuppliers>>[number];
type Detail = NonNullable<Awaited<ReturnType<typeof getOwnerSupplier>>>;

export function toMobileSupplierRow(m: Row): MobileSupplierRow {
  return { id: m.id, name: m.name, email: m.email, status: m.status, productCount: m._count.products };
}

export function toSupplierDetail({ member, ledger, pendingLots }: Detail): SupplierDetailResponse {
  return {
    supplier: {
      id: member.id,
      name: member.name,
      email: member.email,
      status: member.status,
      productCount: ledger.products.length,
    },
    standName: member.stand.name,
    currency: member.stand.currency,
    unitsAdded: ledger.unitsAdded,
    unitsSold: ledger.unitsSold,
    onHand: ledger.onHand,
    owedCents: ledger.owedCents,
    paidCents: ledger.paidCents,
    pendingLots: pendingLots.map((lot) => ({ id: lot.id, label: `${lot.quantityRemaining} × ${lot.product.name}` })),
    products: ledger.products.map((p) => ({
      id: p.id,
      name: p.name,
      linked: p.linked,
      unitsAdded: p.unitsAdded,
      unitsSold: p.unitsSold,
      stockQuantity: p.stockQuantity,
      pendingUnits: p.pendingUnits,
      notListed: !p.linked && p.isArchived,
    })),
  };
}
