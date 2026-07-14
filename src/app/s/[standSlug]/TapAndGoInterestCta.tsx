"use client";

import { useState, useTransition } from "react";
import { requestTapAndGoInterest } from "./actions";

export default function TapAndGoInterestCta({ standSlug }: { standSlug: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onNotify() {
    setError(null);
    startTransition(async () => {
      const result = await requestTapAndGoInterest(standSlug);
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  return (
    <div className="mt-6 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--wash)] p-5">
      <p className="text-lg font-medium text-[var(--ink)]">
        Would you use Tap &amp; Go or PayPal if available at this stand and others?
      </p>
      {sent ? (
        <p className="mt-4 text-lg text-[var(--leaf)]">
          Thanks - we&apos;ve told the stall owner.
        </p>
      ) : (
        <>
          <p className="mt-2 text-lg text-[var(--muted)]">
            Let the stall owner know by clicking the button below.
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={onNotify}
            className="mt-4 w-full rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-4 text-lg font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
          >
            {pending ? "Sending…" : "Notify Stall Owner"}
          </button>
        </>
      )}
      {error ? <p className="mt-3 text-lg text-[var(--gone)]">{error}</p> : null}
    </div>
  );
}
