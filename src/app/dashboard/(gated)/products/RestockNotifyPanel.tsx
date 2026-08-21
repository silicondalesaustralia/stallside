"use client";

import { useActionState, useState } from "react";
import {
  notifyRestockSubscribers,
  type NotifyRestockState,
} from "./restock-notify-actions";

const initial: NotifyRestockState = { ok: false };

export default function RestockNotifyPanel({
  standId,
  standName,
  subscriberCount,
  cooldownMessage,
}: {
  standId: string;
  standName: string;
  subscriberCount: number;
  cooldownMessage: string | null;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(
    notifyRestockSubscribers,
    initial,
  );

  const disabled = subscriberCount === 0 || Boolean(cooldownMessage) || pending;

  return (
    <div className="dash-card p-4">
      <p className="text-sm font-medium text-[var(--ink)]">{standName}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {subscriberCount === 0
          ? "No customers opted in yet."
          : `${subscriberCount} ${subscriberCount === 1 ? "customer wants" : "customers want"} restock alerts.`}
      </p>
      {cooldownMessage ? (
        <p className="mt-2 text-sm text-[var(--muted)]">{cooldownMessage}</p>
      ) : null}
      {state.ok ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          Emails queued to {state.recipientCount ?? subscriberCount} customer
          {(state.recipientCount ?? subscriberCount) === 1 ? "" : "s"}.
        </p>
      ) : null}
      {confirming ? (
        <form
          action={action}
          className="mt-3 flex flex-col gap-2"
          onSubmit={() => setConfirming(false)}
        >
          <input type="hidden" name="standId" value={standId} />
          <p className="text-sm text-[var(--ink)]">
            Email {subscriberCount} customer
            {subscriberCount === 1 ? "" : "s"} that {standName} has restocked?
          </p>
          <label className="sr-only" htmlFor={`restock-msg-${standId}`}>
            Optional message
          </label>
          <textarea
            id={`restock-msg-${standId}`}
            name="ownerMessage"
            rows={2}
            maxLength={500}
            placeholder="Optional short message"
            className="rounded-[var(--radius)] border border-[var(--line)] px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-[var(--leaf)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send emails"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-sm text-[var(--muted)] underline"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setConfirming(true)}
          className="mt-3 rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--wash)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Notify customers
        </button>
      )}
      {state.error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
