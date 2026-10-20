import type { NextRequest } from "next/server";
import { approveLotBody } from "@/contracts/mobile/suppliers";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { approveOwnerSupplierLot } from "@/lib/suppliers/settle";
import { supplierDetail } from "@/lib/mobile/supplier-response";
import { mobileError, mobileServerError, readMobileBody } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/suppliers/[memberId]/approve">;

/** Moves stock the supplier added into sellable stock. */
export async function POST(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, approveLotBody);
  if (!body.ok) return body.response;
  try {
    const { memberId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    const result = await approveOwnerSupplierLot(ownerId, memberId, body.data.lotId);
    if ("error" in result) return mobileError(result.error === "Supplier not found." ? 404 : 400, result.error);
    return await supplierDetail(ownerId, memberId);
  } catch (error) {
    return mobileServerError("Mobile supplier approve failed", error);
  }
}
