"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  subscribeRestockAlert,
  type RestockSubscribeState,
} from "@/app/checkout/success/restock-actions";

const initial: RestockSubscribeState = { ok: false };

export default function RestockOptIn({
  standId,
  prefillEmail,
  inputId = "restock-email",
}: {
  standId: string;
  prefillEmail?: string;
  inputId?: string;
}) {
  const [state, action, pending] = useActionState(subscribeRestockAlert, initial);

  if (state.ok) {
    return (
      <p className="mt-6 text-sm text-[var(--muted)]">
        Done - we&apos;ll let you know.
      </p>
    );
  }

  return (
    <div className="mt-8 border-t border-[var(--line)] pt-6">
      <p className="text-base font-medium text-[var(--ink)]">
        Sold out fast last time — get notified when we&apos;re back
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        We&apos;ll email you when this stand restocks — nothing else.
      </p>
      <form action={action} className="mt-4 flex flex-col gap-3">
        <input type="hidden" name="standId" value={standId} />
        <label className="sr-only" htmlFor={inputId}>
          Email
        </label>
        <input
          id={inputId}
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={prefillEmail ?? ""}
          placeholder="you@example.com"
          className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-base text-[var(--ink)]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Yes, email me"}
        </button>
        {state.error ? (
          <p className="text-sm text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}
      </form>
      <p className="mt-3 text-xs text-[var(--muted)]">
        Your email stays with Vendl.{" "}
        <Link href="/privacy" className="underline">
          Privacy
        </Link>
      </p>
    </div>
  );
}
