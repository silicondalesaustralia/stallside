"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidateOwnerStores } from "@/lib/categories/category-admin";
import { REVIEW_REPLY_MAX } from "@/lib/reviews/review-fields";
import { emailReviewerHtml } from "@/lib/reviews/email-reviewer";
import { sendOwnerEmail } from "@/lib/notify-email";

type Status = "PENDING" | "APPROVED" | "REJECTED";

function back(tab: string, done: string): never {
  redirect(`/dashboard/reviews?tab=${encodeURIComponent(tab)}&done=${done}`);
}

async function ownedReview(reviewId: string) {
  const { owner } = await requireOwnerWrite();
  const review = await prisma.review.findFirst({
    where: { id: reviewId, ownerId: owner.id },
    select: { id: true, authorEmail: true, authorName: true, customer: { select: { email: true, name: true } } },
  });
  if (!review) redirect("/dashboard/reviews?done=missing");
  return { owner, review };
}

async function refresh(ownerId: string) {
  await revalidateOwnerStores(ownerId);
  revalidatePath("/shop", "layout");
  revalidatePath("/dashboard/reviews");
}

export async function setReviewStatus(reviewId: string, status: Status, tab: string) {
  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) back(tab, "missing");
  const { owner } = await ownedReview(reviewId);
  await prisma.review.update({ where: { id: reviewId }, data: { status } });
  await refresh(owner.id);
  back(tab, status === "APPROVED" ? "approved" : status === "REJECTED" ? "hidden" : "pending");
}

export async function deleteReview(reviewId: string, tab: string) {
  const { owner } = await ownedReview(reviewId);
  await prisma.review.delete({ where: { id: reviewId } });
  await refresh(owner.id);
  back(tab, "deleted");
}

export async function saveReviewReply(reviewId: string, tab: string, formData: FormData) {
  const { owner } = await ownedReview(reviewId);
  const reply = String(formData.get("reply") ?? "").trim().slice(0, REVIEW_REPLY_MAX);
  await prisma.review.update({
    where: { id: reviewId },
    data: { sellerReply: reply || null, repliedAt: reply ? new Date() : null },
  });
  await refresh(owner.id);
  back(tab, reply ? "replied" : "reply-removed");
}

export async function emailReviewer(reviewId: string, tab: string, formData: FormData) {
  const { owner, review } = await ownedReview(reviewId);
  const to = review.authorEmail ?? review.customer?.email;
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 150);
  const message = String(formData.get("message") ?? "").trim().slice(0, 5000);
  if (!to || !subject || !message) back(tab, "email-missing");
  try {
    await sendOwnerEmail(to, subject, emailReviewerHtml(owner.businessName, message), {
      replyTo: owner.contactEmail,
      kind: "review-email",
    });
  } catch (error) {
    unstable_rethrow(error);
    console.error("[emailReviewer]", error);
    back(tab, "email-failed");
  }
  back(tab, "emailed");
}
