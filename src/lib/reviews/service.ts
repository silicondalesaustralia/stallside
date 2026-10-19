import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ReviewStatus } from "@/generated/prisma/client";
import { revalidateOwnerStores } from "@/lib/categories/category-admin";
import { REVIEW_REPLY_MAX } from "@/lib/reviews/review-fields";
import { emailReviewerHtml } from "@/lib/reviews/email-reviewer";
import { sendOwnerEmail } from "@/lib/notify-email";

export const REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const satisfies readonly ReviewStatus[];

const REVIEW_SELECT = {
  id: true,
  rating: true,
  title: true,
  body: true,
  status: true,
  authorName: true,
  authorEmail: true,
  verified: true,
  sellerReply: true,
  createdAt: true,
  productId: true,
  customer: { select: { id: true, name: true, email: true } },
} as const;

async function refresh(ownerId: string) {
  await revalidateOwnerStores(ownerId);
  revalidatePath("/shop", "layout");
  revalidatePath("/dashboard/reviews");
}

export async function countOwnerReviews(ownerId: string): Promise<Partial<Record<ReviewStatus, number>>> {
  const grouped = await prisma.review.groupBy({ by: ["status"], where: { ownerId }, _count: true });
  return Object.fromEntries(grouped.map((g) => [g.status, g._count]));
}

async function withProductNames<T extends { productId: string | null }>(ownerId: string, reviews: T[]) {
  const ids = [...new Set(reviews.map((r) => r.productId).filter((id): id is string => Boolean(id)))];
  const products = ids.length
    ? await prisma.product.findMany({ where: { id: { in: ids }, ownerId }, select: { id: true, name: true } })
    : [];
  const names = new Map(products.map((p) => [p.id, p.name]));
  return reviews.map((r) => ({ ...r, productName: r.productId ? (names.get(r.productId) ?? "A product") : null }));
}

/** Newest first, 100 at most; status null = all. Same list as the web Reviews tabs. */
export async function listOwnerReviews(ownerId: string, status: ReviewStatus | null) {
  const reviews = await prisma.review.findMany({
    where: { ownerId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: REVIEW_SELECT,
  });
  return withProductNames(ownerId, reviews);
}

export async function getOwnerReview(ownerId: string, reviewId: string) {
  const review = await prisma.review.findFirst({ where: { id: reviewId, ownerId }, select: REVIEW_SELECT });
  if (!review) return null;
  const [named] = await withProductNames(ownerId, [review]);
  return named;
}

export type OwnerReview = NonNullable<Awaited<ReturnType<typeof getOwnerReview>>>;

function owns(ownerId: string, reviewId: string) {
  return prisma.review.findFirst({ where: { id: reviewId, ownerId }, select: { id: true } });
}

/** All return false when the review isn't the owner's. */
export async function setOwnerReviewStatus(ownerId: string, reviewId: string, status: ReviewStatus) {
  if (!(await owns(ownerId, reviewId))) return false;
  await prisma.review.update({ where: { id: reviewId }, data: { status } });
  await refresh(ownerId);
  return true;
}

export async function deleteOwnerReview(ownerId: string, reviewId: string) {
  if (!(await owns(ownerId, reviewId))) return false;
  await prisma.review.delete({ where: { id: reviewId } });
  await refresh(ownerId);
  return true;
}

/** Public reply under the review; an empty reply removes it. */
export async function saveOwnerReviewReply(ownerId: string, reviewId: string, rawReply: string) {
  if (!(await owns(ownerId, reviewId))) return false;
  const reply = rawReply.trim().slice(0, REVIEW_REPLY_MAX);
  await prisma.review.update({
    where: { id: reviewId },
    data: { sellerReply: reply || null, repliedAt: reply ? new Date() : null },
  });
  await refresh(ownerId);
  return true;
}

export type EmailReviewerResult = "sent" | "missing" | "not-found" | "failed";

/** Private email to the reviewer; their reply goes to the owner's contact email. */
export async function emailOwnerReviewer(
  owner: { id: string; businessName: string; contactEmail: string },
  reviewId: string,
  input: { subject: string; message: string },
): Promise<EmailReviewerResult> {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, ownerId: owner.id },
    select: { authorEmail: true, customer: { select: { email: true } } },
  });
  if (!review) return "not-found";
  const to = review.authorEmail ?? review.customer?.email;
  const subject = input.subject.trim().slice(0, 150);
  const message = input.message.trim().slice(0, 5000);
  if (!to || !subject || !message) return "missing";
  try {
    await sendOwnerEmail(to, subject, emailReviewerHtml(owner.businessName, message), {
      replyTo: owner.contactEmail,
      kind: "review-email",
    });
    return "sent";
  } catch (error) {
    console.error("[emailOwnerReviewer]", error);
    return "failed";
  }
}
