"use client";

import { useTransition } from "react";
import { updatePassFeeToCustomer } from "./pass-fee-actions";

type PassFeeToggleProps = {
  passFeeToCustomer: boolean;
};

export default function PassFeeToggle({
  passFeeToCustomer,
}: PassFeeToggleProps) {
  const [pending, startTransition] = useTransition();

  function setPassOn(next: boolean) {
    startTransition(async () => {
      await updatePassFeeToCustomer(next);
    });
  }

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <p className="font-semibold">Stallside card fee (Free plan): 2.5% + 30¢</p>
      <label className="flex items-start gap-3">
        <input
          type="radio"
          name="passFee"
          checked={!passFeeToCustomer}
          disabled={pending}
          onChange={() => setPassOn(false)}
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
          checked={passFeeToCustomer}
          disabled={pending}
          onChange={() => setPassOn(true)}
          className="mt-1"
        />
        <span>
          <span className="font-medium">Add the fee to the customer&apos;s total</span>
          <span className="mt-0.5 block text-[var(--muted)]">
            Shown as a clear card fee line at checkout.
          </span>
        </span>
      </label>
      <p className="text-[var(--muted)]">
        Cash and PayID are always free. Upgrade to Pro to remove this fee
        entirely.
      </p>
    </section>
  );
}
