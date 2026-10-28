import crypto from "node:crypto";
import { isBetaApp } from "@/lib/beta-app";

/** App-store reviewer account (beta app only), set via APP_REVIEWER_EMAIL. */
export function appReviewerEmail(): string | null {
  if (!isBetaApp()) return null;
  return process.env.APP_REVIEWER_EMAIL?.trim().toLowerCase() || null;
}

export function isAppReviewerEmail(email: string): boolean {
  const reviewer = appReviewerEmail();
  return Boolean(reviewer && email.trim().toLowerCase() === reviewer);
}

/** Fixed 6-digit APP_REVIEWER_CODE, so reviewers can sign in without an inbox. */
export function matchesAppReviewerCode(email: string, code: string): boolean {
  const expected = process.env.APP_REVIEWER_CODE?.trim() ?? "";
  if (!/^\d{6}$/.test(expected) || code.length !== 6 || !isAppReviewerEmail(email)) return false;
  return crypto.timingSafeEqual(Buffer.from(code), Buffer.from(expected));
}
