"use client";

import { useTransition } from "react";
import { setOnlinePaymentProvider } from "./actions";

export default function SquareProviderForm({
  current,
  squarePaymentsReady,
  stripeReady,
}: {
  current: string;
  squarePaymentsReady: boolean;
  stripeReady: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const provider = String(fd.get("provider")) as "STRIPE" | "SQUARE";
        start(async () => {
          await setOnlinePaymentProvider(provider);
        });
      }}
    >
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="provider"
          value="STRIPE"
          defaultChecked={current !== "SQUARE"}
          disabled={!stripeReady && current !== "STRIPE"}
        />
        Stripe{stripeReady ? "" : " (connect Stripe first)"}
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="provider"
          value="SQUARE"
          defaultChecked={current === "SQUARE"}
          disabled={!squarePaymentsReady}
        />
        Square
        {!squarePaymentsReady ? " (enable Square payments above)" : ""}
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold hover:bg-[var(--wash)]"
      >
        {pending ? "Saving…" : "Save provider"}
      </button>
    </form>
  );
}
