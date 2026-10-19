"use server";

import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import {
  REVIEW_STATUSES,
  deleteOwnerReview,
  emailOwnerReviewer,
  saveOwnerReviewReply,
  setOwnerReviewStatus,
} from "@/lib/reviews/service";

type Status = (typeof REVIEW_STATUSES)[number];

const EMAIL_NOTICE = { sent: "emailed", missing: "email-missing", failed: "email-failed", "not-found": "missing" } as const;

function back(tab: string, done: string): never {
  redirect(`/dashboard/reviews?tab=${encodeURIComponent(tab)}&done=${done}`);
}

export async function setReviewStatus(reviewId: string, status: Status, tab: string) {
  if (!REVIEW_STATUSES.includes(status)) back(tab, "missing");
  const { owner } = await requireOwnerWrite();
  if (!(await setOwnerReviewStatus(owner.id, reviewId, status))) back(tab, "missing");
  back(tab, status === "APPROVED" ? "approved" : status === "REJECTED" ? "hidden" : "pending");
}

export async function deleteReview(reviewId: string, tab: string) {
  const { owner } = await requireOwnerWrite();
  if (!(await deleteOwnerReview(owner.id, reviewId))) back(tab, "missing");
  back(tab, "deleted");
}

export async function saveReviewReply(reviewId: string, tab: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const reply = String(formData.get("reply") ?? "");
  if (!(await saveOwnerReviewReply(owner.id, reviewId, reply))) back(tab, "missing");
  back(tab, reply.trim() ? "replied" : "reply-removed");
}

export async function emailReviewer(reviewId: string, tab: string, formData: FormData) {
  const { owner } = await requireOwnerWrite();
  const result = await emailOwnerReviewer(owner, reviewId, {
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  });
  back(tab, EMAIL_NOTICE[result]);
}
