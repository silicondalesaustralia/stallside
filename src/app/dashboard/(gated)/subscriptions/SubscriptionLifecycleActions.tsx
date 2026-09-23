"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteSubscriptionOffer,
  setSubscriptionOfferActive,
} from "./subscription-lifecycle-actions";

export default function SubscriptionLifecycleActions({
  offerId,
  offerTitle,
  isActive,
}: {
  offerId: string;
  offerTitle: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string } | void>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result && "error" in result && result.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch (err) {
        if (
          typeof err === "object" &&
          err !== null &&
          "digest" in err &&
          String((err as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
        ) {
          throw err;
        }
        console.error(err);
        setError("Something went wrong. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3 text-sm">
        <button
          type="button"
          disabled={pending}
          className="font-semibold text-[var(--leaf-dark)] underline disabled:opacity-60"
          onClick={() =>
            run(() => setSubscriptionOfferActive(offerId, !isActive))
          }
        >
          {isActive ? "Turn off" : "Turn on"}
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-full bg-[var(--gone)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--gone)] disabled:opacity-60"
          onClick={() => {
                if (
              !window.confirm(
                `Delete “${offerTitle}”? This permanently removes the offer. Active subscribers must cancel first.`,
              )
            ) {
              return;
            }
            run(() => deleteSubscriptionOffer(offerId));
          }}
        >
          Delete
        </button>
      </div>
      {error ? <p className="text-xs text-[var(--gone)]">{error}</p> : null}
    </div>
  );
}
