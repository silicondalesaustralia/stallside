import type { NextRequest } from "next/server";
import type { MobileReview } from "@/contracts/mobile/reviews";
import type { MobileOk } from "@/contracts/mobile/common";
import { reviewStatusBody } from "@/contracts/mobile/reviews";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { deleteOwnerReview, getOwnerReview, setOwnerReviewStatus } from "@/lib/reviews/service";
import { toMobileReview } from "@/lib/mobile/review-dto";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

type Ctx = RouteContext<"/api/mobile/v1/reviews/[reviewId]">;
const NOT_FOUND = "Review not found.";

export async function GET(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    const { reviewId } = await ctx.params;
    const review = await getOwnerReview(guard.value.owner.id, reviewId);
    if (!review) return mobileError(404, NOT_FOUND);
    return mobileJson<MobileReview>(toMobileReview(review));
  } catch (error) {
    return mobileServerError("Mobile review failed", error);
  }
}

/** Approve & publish, hide, or move back to waiting. */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, reviewStatusBody);
  if (!body.ok) return body.response;

  try {
    const { reviewId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    if (!(await setOwnerReviewStatus(ownerId, reviewId, body.data.status))) return mobileError(404, NOT_FOUND);
    const review = await getOwnerReview(ownerId, reviewId);
    if (!review) return mobileError(404, NOT_FOUND);
    return mobileJson<MobileReview>(toMobileReview(review));
  } catch (error) {
    return mobileServerError("Mobile review status failed", error);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  try {
    const { reviewId } = await ctx.params;
    if (!(await deleteOwnerReview(guard.value.owner.id, reviewId))) return mobileError(404, NOT_FOUND);
    return mobileJson<MobileOk>({ ok: true });
  } catch (error) {
    return mobileServerError("Mobile review delete failed", error);
  }
}
