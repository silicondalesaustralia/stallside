"use client";

import { useActionState } from "react";
import {
  subscribeRestockAlert,
  type RestockSubscribeState,
} from "@/app/checkout/success/restock-actions";
import StudioSectionHeading from "@/components/studio/StudioSectionHeading";
import InlineRichText from "@/components/studio/InlineRichText";
import RichText from "@/components/studio/RichText";
import InlineEditableText from "@/components/studio/InlineEditableText";
import SectionCopy from "@/components/studio/SectionCopy";
import { useSectionText } from "@/components/studio/SectionStyleContext";

const initial: RestockSubscribeState = { ok: false };

type Props = {
  heading: string;
  body: string;
  buttonLabel: string;
  standId: string;
  isEditing?: boolean;
  editable?: boolean;
};

export default function StudioSignupBlock({
  heading,
  body,
  buttonLabel,
  standId,
  isEditing,
  editable = false,
}: Props) {
  const [state, action, pending] = useActionState(subscribeRestockAlert, initial);
  const emailPlaceholder = useSectionText("emailPlaceholder", "you@example.com");
  const thanks = <SectionCopy k="thanks" fallback="Thanks — we'll be in touch." as="p" className="mt-6 text-sm text-[var(--ok)]" />;

  return (
    <section className="studio-section studio-section--panel">
      <div className="studio-section__inner mx-auto max-w-[var(--studio-prose-max)] text-center">
        <StudioSectionHeading
          editable={editable}
          value={heading}
          fallback="Stay in the loop"
          placeholder="Signup heading"
        />
        {editable ? (
          <InlineRichText prop="body" value={body} className="mt-3 text-[var(--muted)]" placeholder="Signup supporting text" />
        ) : body ? (
          <RichText value={body} className="mt-3 text-[var(--muted)]" />
        ) : null}
        {state.ok ? (
          thanks
        ) : (
          <form action={action} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sf-sm:flex-row">
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
              placeholder={emailPlaceholder}
              disabled={isEditing}
              className="min-h-[var(--studio-btn-height)] flex-1 rounded-lg border border-[var(--line)] bg-white px-3 text-sm"
            />
            {editable ? (
              <InlineEditableText
                prop="buttonLabel"
                value={buttonLabel || "Subscribe"}
                as="span"
                className="studio-btn studio-btn--primary shrink-0"
                placeholder="Button label"
              />
            ) : (
              <button
                type="submit"
                disabled={pending || isEditing}
                className="studio-btn studio-btn--primary shrink-0"
              >
                {pending ? "Sending…" : buttonLabel || "Subscribe"}
              </button>
            )}
          </form>
        )}
        {editable ? (
          <div className="mt-3 flex flex-wrap justify-center gap-x-2 text-xs text-[var(--muted)]">
            <span>Email box hint:</span>
            <SectionCopy k="emailPlaceholder" fallback="you@example.com" className="italic" />
          </div>
        ) : null}
        <SectionCopy
          k="disclaimer"
          fallback="We'll email you about new menus and availability — unsubscribe anytime."
          as="p"
          multiline
          className="mt-3 text-xs text-[var(--muted)]"
        />
        {editable ? (
          <div className="mt-4 rounded-md border border-dashed border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]">
            <span>Shown after someone signs up:</span>
            {thanks}
          </div>
        ) : null}
      </div>
    </section>
  );
}
