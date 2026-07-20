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
          "Disconnect Stripe? Card / Tap & Go will turn off on your stands. You can connect again later.",
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
