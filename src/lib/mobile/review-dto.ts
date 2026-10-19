import type { MobileReview } from "@/contracts/mobile/reviews";
import type { OwnerReview } from "@/lib/reviews/service";

export function toMobileReview(review: OwnerReview): MobileReview {
  return {
    id: review.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
    status: review.status,
    authorName: review.authorName || review.customer?.name || "Customer",
    authorEmail: review.authorEmail || review.customer?.email || null,
    customerId: review.customer?.id ?? null,
    verified: review.verified,
    sellerReply: review.sellerReply,
    productId: review.productId,
    productName: review.productName,
    createdAt: review.createdAt.toISOString(),
  };
}
