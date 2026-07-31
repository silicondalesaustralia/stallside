"use client";

import { useState, useTransition } from "react";
import { recordCardInterest } from "./card-interest-actions";

export default function CardInterestButton({
  standSlug,
  subtotalCents,
  currency,
}: {
  standSlug: string;
  subtotalCents: number;
  currency: string;
}) {
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Thanks - we&apos;ve noted you&apos;d have paid by card.
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await recordCardInterest({ standSlug, subtotalCents, currency });
            setDone(true);
          } catch (error) {
            console.error("Card interest failed", error);
          }
        });
      }}
      className="w-full rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-sm font-semibold text-[var(--field)] hover:border-[var(--leaf)] disabled:opacity-50"
    >
      {pending ? "Saving…" : "I'd have paid by card"}
    </button>
  );
}
