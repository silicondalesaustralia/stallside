"use client";

import { useActionState } from "react";
import Link from "next/link";
import SectionCopy from "@/components/studio/SectionCopy";
import {
  subscribeRestockAlert,
  type RestockSubscribeState,
} from "@/app/checkout/success/restock-actions";

const initial: RestockSubscribeState = { ok: false };

const STAND_BUTTON =
  "rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60";
const SITE_BUTTON = "studio-btn studio-btn--primary w-full disabled:opacity-60";

export default function RestockOptIn({
  standId,
  prefillEmail,
  inputId = "restock-email",
  preview = false,
  siteButtons = false,
}: {
  standId: string;
  prefillEmail?: string;
  inputId?: string;
  /** Builder sample: wording is editable, the form can't be sent. */
  preview?: boolean;
  /** Website: the button follows the site and section button styles. */
  siteButtons?: boolean;
}) {
  const [state, action, pending] = useActionState(subscribeRestockAlert, initial);
  const BUTTON = siteButtons ? SITE_BUTTON : STAND_BUTTON;

  if (state.ok) {
    return (
      <p className="mt-6 text-sm text-[var(--muted)]">
        Done - we&apos;ll let you know.
      </p>
    );
  }

  return (
    <div className="mt-8 border-t border-[var(--line)] pt-6">
      <SectionCopy
        k="restockHeading"
        fallback="Sold out fast last time - get notified when we're back"
        as="p"
        className="text-base font-medium text-[var(--ink)]"
      />
      <SectionCopy
        k="restockBody"
        fallback="We'll email you when this stand restocks - nothing else."
        as="p"
        className="mt-1 text-sm text-[var(--muted)]"
      />
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
          disabled={preview}
          placeholder="you@example.com"
          className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-base text-[var(--ink)]"
        />
        {preview ? (
          <span className={`${BUTTON} text-center`}>
            <SectionCopy k="restockButton" fallback="Yes, email me" />
          </span>
        ) : (
          <button type="submit" disabled={pending} className={BUTTON}>
            {pending ? "Saving…" : <SectionCopy k="restockButton" fallback="Yes, email me" />}
          </button>
        )}
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
