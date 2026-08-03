"use client";

import { useEffect, useState, useTransition } from "react";
import { updatePassFeeToCustomer } from "./pass-fee-actions";

type PassFeeToggleProps = {
  passFeeToCustomer: boolean;
};

export default function PassFeeToggle({
  passFeeToCustomer,
}: PassFeeToggleProps) {
  const [pending, startTransition] = useTransition();
  const [passOn, setPassOn] = useState(passFeeToCustomer);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPassOn(passFeeToCustomer);
  }, [passFeeToCustomer]);

  function choose(next: boolean) {
    const prev = passOn;
    setPassOn(next);
    setError(null);
    startTransition(async () => {
      try {
        const result = await updatePassFeeToCustomer(next);
        if (result && "error" in result && result.error) {
          setPassOn(prev);
          setError(result.error);
        }
      } catch {
        setPassOn(prev);
        setError("Could not save. Try again.");
      }
    });
  }

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <p className="font-semibold">
        Stallside fee (Free plan): 2.5% on card, Tap &amp; Go, and pay-later.
        Standard Stripe processing fees apply separately.
      </p>
      <label className="flex items-start gap-3">
        <input
          type="radio"
          name="passFee"
          checked={!passOn}
          disabled={pending}
          onChange={() => choose(false)}
          className="mt-1"
        />
        <span>
          <span className="font-medium">I&apos;ll cover the fee</span>
          <span className="mt-0.5 block text-[var(--muted)]">
            Customer pays the listed price (default).
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3">
        <input
          type="radio"
          name="passFee"
          checked={passOn}
          disabled={pending}
          onChange={() => choose(true)}
          className="mt-1"
        />
        <span>
          <span className="font-medium">Add the fee to the customer&apos;s total</span>
          <span className="mt-0.5 block text-[var(--muted)]">
            Shown as a clear card fee line at checkout.
          </span>
        </span>
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <p className="text-[var(--muted)]">
        Cash and PayID are always free. Upgrade to Pro to remove this fee
        entirely.
      </p>
    </section>
  );
}
