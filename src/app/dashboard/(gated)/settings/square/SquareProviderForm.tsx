"use client";

import { useTransition } from "react";
import { setOnlinePaymentProvider } from "./actions";
import { useActionStatus } from "./use-action-status";
import ActionStatusText from "./ActionStatusText";

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
  const { status, report, fail } = useActionStatus();

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const provider = String(fd.get("provider")) as "STRIPE" | "SQUARE";
        start(async () => {
          try {
            report(
              await setOnlinePaymentProvider(provider),
              provider === "SQUARE"
                ? "Product checkout now uses Square."
                : "Product checkout now uses Stripe.",
            );
          } catch (error) {
            fail(error);
          }
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
        {!squarePaymentsReady ? " (turn on Square payments in Square settings)" : ""}
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold hover:bg-[var(--wash)]"
      >
        {pending ? "Saving…" : "Save provider"}
      </button>
      <ActionStatusText status={status} />
    </form>
  );
}
