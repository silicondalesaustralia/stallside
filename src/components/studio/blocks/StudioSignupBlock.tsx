"use client";

import { useActionState } from "react";
import {
  subscribeRestockAlert,
  type RestockSubscribeState,
} from "@/app/checkout/success/restock-actions";

const initial: RestockSubscribeState = { ok: false };

type Props = {
  heading: string;
  body: string;
  buttonLabel: string;
  standId: string;
  isEditing?: boolean;
};

export default function StudioSignupBlock({
  heading,
  body,
  buttonLabel,
  standId,
  isEditing,
}: Props) {
  const [state, action, pending] = useActionState(subscribeRestockAlert, initial);

  return (
    <section className="studio-section studio-section--panel">
      <div className="studio-section__inner mx-auto max-w-[var(--studio-prose-max)] text-center">
        <h2 className="studio-heading">{heading || "Stay in the loop"}</h2>
        {body ? <p className="mt-3 text-[var(--muted)]">{body}</p> : null}
        {state.ok ? (
          <p className="mt-6 text-sm text-[var(--ok)]">Thanks — we&apos;ll be in touch.</p>
        ) : (
          <form action={action} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input type="hidden" name="standId" value={standId} />
            <label className="sr-only" htmlFor="studio-signup-email">
              Email
            </label>
            <input
              id="studio-signup-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isEditing}
              className="min-h-[var(--studio-btn-height)] flex-1 rounded-lg border border-[var(--line)] bg-white px-3 text-sm"
            />
            <button
              type="submit"
              disabled={pending || isEditing}
              className="studio-btn studio-btn--primary shrink-0"
            >
              {pending ? "Sending…" : buttonLabel || "Subscribe"}
            </button>
          </form>
        )}
        <p className="mt-3 text-xs text-[var(--muted)]">
          We&apos;ll email you about new menus and availability — unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
