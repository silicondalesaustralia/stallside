"use client";

import { useState, useTransition } from "react";
import {
  openShopperBillingPortal,
  pauseShopperSubscription,
  resumeShopperSubscription,
  skipNextShopperCycle,
} from "./manage-actions";

export default function SubscriptionManageControls({
  token,
  status,
  skipNextCycle,
}: {
  token: string;
  status: string;
  skipNextCycle: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const paused = status === "PAUSED";
  const active = status === "ACTIVE" || status === "PAST_DUE";

  function run(
    action: (formData: FormData) => Promise<
      { error: string } | { ok: true; message: string } | void
    >,
  ) {
    const fd = new FormData();
    fd.set("token", token);
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await action(fd);
        if (result && "error" in result && result.error) {
          setMessage(result.error);
          return;
        }
        if (result && "message" in result) {
          setMessage(result.message);
        }
      } catch (error) {
        // redirect() throws; ignore NEXT_REDIRECT
        if (
          error &&
          typeof error === "object" &&
          "digest" in error &&
          String((error as { digest?: string }).digest).startsWith(
            "NEXT_REDIRECT",
          )
        ) {
          throw error;
        }
        console.error(error);
        setMessage("Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {active && !skipNextCycle ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(skipNextShopperCycle)}
          className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-medium"
        >
          Skip next cycle
        </button>
      ) : null}
      {skipNextCycle ? (
        <p className="text-sm text-[var(--muted)]">
          Next billed cycle will not create a pickup order.
        </p>
      ) : null}
      {active && !paused ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(pauseShopperSubscription)}
          className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-medium"
        >
          Pause subscription
        </button>
      ) : null}
      {paused ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(resumeShopperSubscription)}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Resume subscription
        </button>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => run(openShopperBillingPortal)}
        className="rounded-lg bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white"
      >
        Update card / cancel
      </button>
      {message ? (
        <p className="text-sm text-[var(--muted)]">{message}</p>
      ) : null}
    </div>
  );
}
