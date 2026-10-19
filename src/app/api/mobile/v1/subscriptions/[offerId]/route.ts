import type { NextRequest } from "next/server";
import type { MobileOk } from "@/contracts/mobile/common";
import { offerActiveBody, type OfferDetailResponse } from "@/contracts/mobile/subscriptions";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { deleteOwnerOffer, getOwnerOffer, setOwnerOfferActive } from "@/lib/subscriptions/service";
import { toMobileOffer, toMobileSubscriber } from "@/lib/mobile/subscription-dto";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/subscriptions/[offerId]">;
const notFoundOr400 = (error: string) => mobileError(error === "Subscription not found." ? 404 : 400, error);

export async function GET(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { offerId } = await ctx.params;
    const detail = await getOwnerOffer(guard.value.owner.id, offerId);
    if (!detail) return mobileError(404, "Subscription not found.");
    return mobileJson<OfferDetailResponse>({
      offer: toMobileOffer(detail.offer),
      subscribers: detail.subscriptions.map(toMobileSubscriber),
    });
  } catch (error) {
    return mobileServerError("Mobile subscription failed", error);
  }
}

/** Turn an offer on or off for new sign-ups. */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  const body = await readMobileBody(request, offerActiveBody);
  if (!body.ok) return body.response;
  try {
    const { offerId } = await ctx.params;
    const result = await setOwnerOfferActive(guard.value.owner.id, offerId, body.data.isActive);
    if ("error" in result) return notFoundOr400(result.error);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile subscription toggle failed", error);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;
  try {
    const { offerId } = await ctx.params;
    const result = await deleteOwnerOffer(guard.value.owner.id, offerId);
    if ("error" in result) return notFoundOr400(result.error);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile subscription delete failed", error);
  }
}
