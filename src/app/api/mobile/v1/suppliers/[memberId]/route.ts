import type { NextRequest } from "next/server";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { revokeOwnerSupplier } from "@/lib/suppliers/members";
import { supplierDetail } from "@/lib/mobile/supplier-response";
import { mobileError, mobileServerError } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/suppliers/[memberId]">;

export async function GET(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { memberId } = await ctx.params;
    return await supplierDetail(guard.value.owner.id, memberId);
  } catch (error) {
    return mobileServerError("Mobile supplier failed", error);
  }
}

/** Revokes the supplier's access; their history stays. */
export async function DELETE(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { memberId } = await ctx.params;
    const result = await revokeOwnerSupplier(guard.value.owner.id, memberId);
    if ("error" in result) return mobileError(404, result.error);
    return await supplierDetail(guard.value.owner.id, memberId);
  } catch (error) {
    return mobileServerError("Mobile supplier revoke failed", error);
  }
}
