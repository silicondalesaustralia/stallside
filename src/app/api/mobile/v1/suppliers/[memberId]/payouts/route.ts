import type { NextRequest } from "next/server";
import { supplierPayoutBody } from "@/contracts/mobile/suppliers";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { recordOwnerSupplierPayout } from "@/lib/suppliers/settle";
import { supplierDetail } from "@/lib/mobile/supplier-response";
import { mobileError, mobileServerError, readMobileBody } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/suppliers/[memberId]/payouts">;

/** Records money paid to the supplier outside Vendl. */
export async function POST(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, supplierPayoutBody);
  if (!body.ok) return body.response;
  try {
    const { memberId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    const result = await recordOwnerSupplierPayout(ownerId, memberId, body.data.amount, body.data.note);
    if ("error" in result) return mobileError(result.error === "Supplier not found." ? 404 : 400, result.error);
    return await supplierDetail(ownerId, memberId);
  } catch (error) {
    return mobileServerError("Mobile supplier payout failed", error);
  }
}
