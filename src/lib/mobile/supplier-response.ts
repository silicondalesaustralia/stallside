import type { SupplierDetailResponse } from "@/contracts/mobile/suppliers";
import { getOwnerSupplier } from "@/lib/suppliers/members";
import { toSupplierDetail } from "@/lib/mobile/supplier-dto";
import { mobileError, mobileJson } from "@/lib/mobile/http";

/** Supplier detail response; sent after any change so screens update in place. */
export async function supplierDetail(ownerId: string, memberId: string) {
  const detail = await getOwnerSupplier(ownerId, memberId);
  if (!detail) return mobileError(404, "Supplier not found.");
  return mobileJson<SupplierDetailResponse>(toSupplierDetail(detail));
}
