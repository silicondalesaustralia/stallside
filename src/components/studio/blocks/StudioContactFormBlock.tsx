"use client";

import { useActionState } from "react";
import { sendContactEnquiry } from "@/lib/studio/contact-form-actions";
import type { ContactFormLayout, ContactFormState } from "@/lib/studio/contact-form";
import StudioSectionHeading from "@/components/studio/StudioSectionHeading";
import InlineRichText from "@/components/studio/InlineRichText";
import InlineEditableText from "@/components/studio/InlineEditableText";
import RichText from "@/components/studio/RichText";
import SectionCopy from "@/components/studio/SectionCopy";
import ContactFormFields from "./ContactFormFields";

const initial: ContactFormState = { ok: false };

type Props = {
  heading: string;
  body: string;
  buttonLabel: string;
  layout: ContactFormLayout;
  showPhone: boolean;
  standId: string;
  editable?: boolean;
};

/** Contact form that emails the shop owner. Stacked (centred) or split (text beside the form). */
export default function StudioContactFormBlock({ heading, body, buttonLabel, layout, showPhone, standId, editable = false }: Props) {
  const [state, action, pending] = useActionState(sendContactEnquiry, initial);
  const split = layout === "split";
  const thanks = (
    <SectionCopy
      k="thanks"
      fallback="Thanks - your message is on its way. We'll reply by email soon."
      as="p"
      multiline
      className="rounded-lg bg-[var(--wash,#f2f6ef)] p-4 text-[var(--ok,#2e7d3f)]"
    />
  );

  const intro = (
    <div className={split ? "" : "text-center"}>
      <StudioSectionHeading editable={editable} value={heading} fallback="Get in touch" placeholder="Form heading" />
      {editable ? (
        <InlineRichText prop="body" value={body} className="mt-3 text-[var(--muted)]" placeholder="Add a short intro, opening hours or other ways to reach you" />
      ) : body ? (
        <RichText value={body} className="mt-3 text-[var(--muted)]" />
      ) : null}
    </div>
  );

  const form = state.ok && !editable ? (
    thanks
  ) : (
    <form action={action} className="relative flex flex-col gap-4">
      <ContactFormFields standId={standId} showPhone={showPhone} disabled={editable} />
      {state.error ? <p role="alert" className="text-sm text-[var(--gone,#8a2e2e)]">{state.error}</p> : null}
      {editable ? (
        <InlineEditableText prop="buttonLabel" value={buttonLabel || "Send message"} as="span" className="studio-btn studio-btn--primary self-start" placeholder="Button label" />
      ) : (
        <button type="submit" disabled={pending} className="studio-btn studio-btn--primary self-start">
          {pending ? "Sending…" : buttonLabel || "Send message"}
        </button>
      )}
    </form>
  );

  return (
    <section className="studio-section">
      <div className={`studio-section__inner mx-auto ${split ? "grid gap-8 sf-md:grid-cols-2 sf-md:gap-12" : "max-w-[var(--studio-prose-max)]"}`}>
        {intro}
        <div className={split ? "" : "mt-8"}>
          {form}
          {editable ? (
            <div className="mt-4 rounded-md border border-dashed border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]">
              <span>Shown after a message is sent:</span>
              <div className="mt-2">{thanks}</div>
              <div className="mt-2 flex flex-wrap gap-x-2">
                <span>Message box hint:</span>
                <SectionCopy k="messagePlaceholder" fallback="How can we help?" className="italic" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
