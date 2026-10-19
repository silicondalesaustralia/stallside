import type { NextRequest } from "next/server";
import { reviewReplyBody, type MobileReview } from "@/contracts/mobile/reviews";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { getOwnerReview, saveOwnerReviewReply } from "@/lib/reviews/service";
import { toMobileReview } from "@/lib/mobile/review-dto";
import { mobileError, mobileJson, mobileServerError, readMobileBody } from "@/lib/mobile/http";

/** Public reply shown under the review on the website; an empty reply removes it. */
export async function PUT(request: NextRequest, ctx: RouteContext<"/api/mobile/v1/reviews/[reviewId]/reply">) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const body = await readMobileBody(request, reviewReplyBody);
  if (!body.ok) return body.response;

  try {
    const { reviewId } = await ctx.params;
    const ownerId = guard.value.owner.id;
    if (!(await saveOwnerReviewReply(ownerId, reviewId, body.data.reply))) return mobileError(404, "Review not found.");
    const review = await getOwnerReview(ownerId, reviewId);
    if (!review) return mobileError(404, "Review not found.");
    return mobileJson<MobileReview>(toMobileReview(review));
  } catch (error) {
    return mobileServerError("Mobile review reply failed", error);
  }
}
