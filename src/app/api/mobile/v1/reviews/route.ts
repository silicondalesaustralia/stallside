import { reviewsQuery, type ReviewsResponse } from "@/contracts/mobile/reviews";
import { requireMobileOwner } from "@/lib/mobile/require-owner";
import { countOwnerReviews, listOwnerReviews } from "@/lib/reviews/service";
import { toMobileReview } from "@/lib/mobile/review-dto";
import { mobileJson, mobileServerError, readMobileQuery } from "@/lib/mobile/http";

export async function GET(request: Request) {
  const guard = await requireMobileOwner(request);
  if (!guard.ok) return guard.response;

  const query = readMobileQuery(request, reviewsQuery);
  if (!query.ok) return query.response;

  try {
    const ownerId = guard.value.owner.id;
    const [counts, reviews] = await Promise.all([
      countOwnerReviews(ownerId),
      listOwnerReviews(ownerId, query.data.status ?? null),
    ]);
    return mobileJson<ReviewsResponse>({
      counts: { PENDING: counts.PENDING ?? 0, APPROVED: counts.APPROVED ?? 0, REJECTED: counts.REJECTED ?? 0 },
      reviews: reviews.map(toMobileReview),
    });
  } catch (error) {
    return mobileServerError("Mobile reviews failed", error);
  }
}
