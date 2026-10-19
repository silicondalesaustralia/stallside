import type { MobileReview, MobileReviewStatus } from "@contracts/mobile/reviews";

export const REVIEW_STATUS_LABEL: Record<MobileReviewStatus, string> = {
  PENDING: "Waiting for approval",
  APPROVED: "Published",
  REJECTED: "Hidden",
};

export function reviewSubject(review: MobileReview): string {
  return review.productName ? `on ${review.productName}` : "about your business";
}
