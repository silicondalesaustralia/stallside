"use client";

import { useState, useTransition } from "react";
import {
  openShopperBillingPortal,
  pauseShopperSubscription,
  resumeShopperSubscription,
  skipNextShopperCycle,
} from "./manage-actions";

function Spinner() {
  return (
    <span
      className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden
    />
  );
}

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
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const paused = status === "PAUSED";
  const active = status === "ACTIVE" || status === "PAST_DUE";

  function run(
    label: string,
    action: (formData: FormData) => Promise<
      | { error: string }
      | { ok: true; message: string }
      | { ok: true; url: string }
      | void
    >,
  ) {
    const fd = new FormData();
    fd.set("token", token);
    setMessage(null);
    setBusy(label);
    startTransition(async () => {
      try {
        const result = await action(fd);
        if (result && "error" in result && result.error) {
          setMessage(result.error);
          return;
        }
        if (result && "url" in result && result.url) {
          window.location.assign(result.url);
          return;
        }
        if (result && "message" in result) {
          setMessage(result.message);
        }
      } catch (error) {
        console.error(error);
        setMessage("Something went wrong.");
      } finally {
        setBusy(null);
      }
    });
  }

  const wait = pending || busy != null;

  return (
    <div className="flex flex-col gap-3">
      {active && !skipNextCycle ? (
        <button
          type="button"
          disabled={wait}
          onClick={() => run("skip", skipNextShopperCycle)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {busy === "skip" ? <Spinner /> : null}
          {busy === "skip" ? "Skipping…" : "Skip next cycle"}
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
          disabled={wait}
          onClick={() => run("pause", pauseShopperSubscription)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {busy === "pause" ? <Spinner /> : null}
          {busy === "pause" ? "Pausing…" : "Pause subscription"}
        </button>
      ) : null}
      {paused ? (
        <button
          type="button"
          disabled={wait}
          onClick={() => run("resume", resumeShopperSubscription)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy === "resume" ? <Spinner /> : null}
          {busy === "resume" ? "Resuming…" : "Resume subscription"}
        </button>
      ) : null}
      <button
        type="button"
        disabled={wait}
        onClick={() => run("portal", openShopperBillingPortal)}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy === "portal" ? <Spinner /> : null}
        {busy === "portal" ? "Opening…" : "Update card / cancel"}
      </button>
      {message ? (
        <p
          className={`text-sm ${
            /not |could not|wrong|unavailable|failed/i.test(message)
              ? "text-[var(--gone)]"
              : "text-[var(--leaf-dark)]"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
