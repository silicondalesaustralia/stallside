"use client";

import { useState, type FormEvent } from "react";
import SectionCopy from "@/components/studio/SectionCopy";
import { useSectionCopyContext } from "@/components/studio/SectionStyleContext";
import { submitReview } from "@/lib/reviews/submit-review-action";
import { REVIEW_BODY_MAX, REVIEW_NAME_MAX, REVIEW_TITLE_MAX } from "@/lib/reviews/review-limits";
import ReviewStarPicker from "./ReviewStarPicker";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)]";
const LABEL = "flex flex-col gap-1 text-sm font-medium text-[var(--field)]";

/** "Leave a review" form; reviews wait for the seller's approval. Inert in the website editor. */
export default function ReviewForm({ storefrontSlug, productId }: { storefrontSlug: string; productId?: string }) {
  const { editable } = useSectionCopyContext();
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editable) return;
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setError(null);
    try {
      const result = await submitReview({
        storefrontSlug,
        productId,
        rating,
        title: String(form.get("title") ?? ""),
        body: String(form.get("body") ?? ""),
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        website: String(form.get("website") ?? ""),
      });
      if (result.ok) setStatus("sent");
      else {
        setError(result.error);
        setStatus("idle");
      }
    } catch (err) {
      console.error("[review form]", err);
      setError("Couldn't send your review. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-white p-5 text-sm text-[var(--field)]">
        <SectionCopy k="reviewThanks" fallback="Thanks for your review! It will appear once it has been approved." as="p" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-[var(--studio-card-radius)] border border-[var(--line)] bg-white p-5">
      <SectionCopy k="reviewFormHeading" fallback="Leave a review" as="p" className="text-lg font-semibold text-[var(--field)]" />
      <ReviewStarPicker value={rating} onChange={setRating} />
      <label className={LABEL}>
        <SectionCopy k="reviewTitleLabel" fallback="Title (optional)" />
        <input name="title" maxLength={REVIEW_TITLE_MAX} className={INPUT} />
      </label>
      <label className={LABEL}>
        <SectionCopy k="reviewBodyLabel" fallback="Your review" />
        <textarea name="body" required rows={4} maxLength={REVIEW_BODY_MAX} className={INPUT} />
      </label>
      <div className="grid gap-3 sf-sm:grid-cols-2">
        <label className={LABEL}>
          <SectionCopy k="reviewNameLabel" fallback="Your name" />
          <input name="name" required maxLength={REVIEW_NAME_MAX} autoComplete="name" className={INPUT} />
        </label>
        <label className={LABEL}>
          <SectionCopy k="reviewEmailLabel" fallback="Email (not shown)" />
          <input name="email" type="email" required autoComplete="email" className={INPUT} />
        </label>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {error ? <p className="text-sm text-[var(--gone)]">{error}</p> : null}
      {editable ? (
        <div className="studio-btn studio-btn--primary self-start">
          <SectionCopy k="reviewSubmit" fallback="Submit review" />
        </div>
      ) : (
        <button type="submit" disabled={status === "sending"} className="studio-btn studio-btn--primary self-start disabled:opacity-60">
          {status === "sending" ? "Sending…" : <SectionCopy k="reviewSubmit" fallback="Submit review" />}
        </button>
      )}
    </form>
  );
}
