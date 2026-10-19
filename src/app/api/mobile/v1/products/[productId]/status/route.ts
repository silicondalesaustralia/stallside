import type { NextRequest } from "next/server";
import { productStatusBody } from "@/contracts/mobile/product-detail";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { setOwnerProductStatus } from "@/lib/products/lifecycle";
import { afterProductChange } from "@/lib/mobile/product-detail-response";
import { mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Hide/show in the shop, move to drafts or publish: same as the web product Status section. */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/products/[productId]/status">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, productStatusBody);
  if (!body.ok) return body.response;

  try {
    const { productId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    const result = await setOwnerProductStatus(ownerId, productId, body.data.action);
    return await afterProductChange(ownerId, productId, result);
  } catch (error) {
    return mobileServerError("Mobile product status update failed", error);
  }
}
