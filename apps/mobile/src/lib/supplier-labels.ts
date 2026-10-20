import type {
  MobileSupplierProduct,
  MobileSupplierRow,
} from "@contracts/mobile/suppliers";

export function supplierStatusLabel(
  status: MobileSupplierRow["status"],
): string {
  if (status === "ACTIVE") return "Active";
  if (status === "INVITED") return "Invited";
  return "Revoked";
}

export function supplierProductMeta(p: MobileSupplierProduct): string {
  const parts = [
    `${p.unitsAdded} added`,
    `${p.unitsSold} sold`,
    `${p.stockQuantity} in stock`,
  ];
  if (p.pendingUnits > 0) parts.push(`${p.pendingUnits} awaiting approval`);
  return parts.join(" · ");
}

export function supplierProductTag(p: MobileSupplierProduct): string | null {
  if (p.linked) return "Your product";
  if (p.notListed) return "Not on your stall";
  return null;
}
