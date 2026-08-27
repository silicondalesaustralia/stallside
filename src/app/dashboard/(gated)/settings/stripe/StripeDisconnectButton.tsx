"use client";

import { useTransition } from "react";
import { disconnectStripe } from "./actions";

export default function StripeDisconnectButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const ok = window.confirm(
          "Disconnect Stripe? Card checkout, pre-orders, and subscriptions will turn off until you connect again.",
        );
        if (!ok) return;
        startTransition(async () => {
          await disconnectStripe();
        });
      }}
      className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Disconnecting…" : "Disconnect Stripe"}
    </button>
  );
}
