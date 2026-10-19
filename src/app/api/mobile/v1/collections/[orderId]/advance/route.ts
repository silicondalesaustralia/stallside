import type { NextRequest } from "next/server";
import type { AdvanceCollectionResponse } from "@/contracts/mobile/collections";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { advanceOwnerCollection } from "@/lib/collections/advance-status";
import { mobileError, mobileJson, mobileServerError } from "@/lib/mobile/http";

/** Same as the web "Mark ready" / "Mark collected" button. */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/mobile/v1/collections/[orderId]/advance">,
) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    const { orderId } = await ctx.params;
    const result = await advanceOwnerCollection(guard.value.owner.id, orderId);
    if ("error" in result) return mobileError(400, result.error);
    return mobileJson<AdvanceCollectionResponse>({ status: result.status });
  } catch (error) {
    return mobileServerError("Mobile collection advance failed", error);
  }
}
