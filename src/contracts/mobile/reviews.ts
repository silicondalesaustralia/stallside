import { z } from "zod";

export const MOBILE_REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const mobileReviewStatus = z.enum(MOBILE_REVIEW_STATUSES);
export type MobileReviewStatus = z.infer<typeof mobileReviewStatus>;

export const reviewsQuery = z.object({ status: mobileReviewStatus.optional() });

export const mobileReview = z.object({
  id: z.string(),
  rating: z.number().int(),
  title: z.string().nullable(),
  body: z.string(),
  status: mobileReviewStatus,
  authorName: z.string(),
  authorEmail: z.string().nullable(),
  customerId: z.string().nullable(),
  verified: z.boolean(),
  sellerReply: z.string().nullable(),
  productId: z.string().nullable(),
  productName: z.string().nullable(),
  createdAt: z.string(),
});
export type MobileReview = z.infer<typeof mobileReview>;

export const reviewsResponse = z.object({
  counts: z.object({ PENDING: z.number().int(), APPROVED: z.number().int(), REJECTED: z.number().int() }),
  reviews: z.array(mobileReview),
});
export type ReviewsResponse = z.infer<typeof reviewsResponse>;

export const reviewStatusBody = z.object({ status: mobileReviewStatus });
export const REVIEW_REPLY_MAX = 2000;
export const reviewReplyBody = z.object({ reply: z.string().max(REVIEW_REPLY_MAX) });
export const reviewEmailBody = z.object({
  subject: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(5000),
});
export type ReviewEmailBody = z.infer<typeof reviewEmailBody>;
