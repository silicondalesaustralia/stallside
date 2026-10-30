import type { NextRequest } from "next/server";
import type { MaterialsMessage } from "@/contracts/mobile/materials";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { deleteOwnerPurchase } from "@/lib/production/purchases";
import { mobileError, mobileJson, mobileServerError } from "@/lib/mobile/http";

/** Removes a purchase and takes its quantity back out of stock. */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/mobile/v1/materials/purchases/[purchaseId]">,
) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { purchaseId } = await ctx.params;
    const result = await deleteOwnerPurchase(guard.value.owner.id, purchaseId);
    if ("error" in result) return mobileError(404, result.error);
    return mobileJson<MaterialsMessage>({ message: result.message ?? "Purchase removed." });
  } catch (error) {
    return mobileServerError("Mobile remove purchase failed", error);
  }
}
