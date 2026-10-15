import { z } from "zod";
import { REVIEW_BODY_MAX, REVIEW_BODY_MIN, REVIEW_NAME_MAX, REVIEW_TITLE_MAX } from "./review-limits";

export * from "./review-limits";

/** What a shopper sends from the review form on the website. */
export const reviewSubmissionSchema = z.object({
  storefrontSlug: z.string().trim().min(1).max(120),
  productId: z.string().trim().max(64).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(REVIEW_TITLE_MAX).optional(),
  body: z.string().trim().min(REVIEW_BODY_MIN).max(REVIEW_BODY_MAX),
  name: z.string().trim().min(1).max(REVIEW_NAME_MAX),
  email: z.string().trim().toLowerCase().email().max(200),
  /** Hidden field people never fill in; bots do. */
  website: z.string().max(200).optional(),
});

export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;

export type ReviewSubmitResult = { ok: true } | { ok: false; error: string };

/** First problem with a submission, worded for the shopper. */
export function reviewSubmissionError(input: unknown): string | null {
  const parsed = reviewSubmissionSchema.safeParse(input);
  if (parsed.success) return null;
  const field = parsed.error.issues[0]?.path[0];
  if (field === "rating") return "Choose a star rating.";
  if (field === "body") return `Write at least ${REVIEW_BODY_MIN} characters in your review.`;
  if (field === "name") return "Add your name.";
  if (field === "email") return "Enter a valid email address.";
  return "Check your review and try again.";
}
