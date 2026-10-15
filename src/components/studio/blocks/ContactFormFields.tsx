"use client";

import { useEffect, useId, useRef } from "react";
import SectionCopy from "@/components/studio/SectionCopy";
import { useSectionText } from "@/components/studio/SectionStyleContext";
import { CONTACT_LIMITS, CONTACT_TRAP_FIELD } from "@/lib/studio/contact-form";

const INPUT =
  "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base text-[var(--ink,#182c1b)] disabled:opacity-70";
const LABEL = "mb-1 block text-sm font-semibold text-[var(--field)]";

/** Name, email, optional phone and message inputs, plus the hidden spam checks. */
export default function ContactFormFields({ standId, showPhone, disabled }: { standId: string; showPhone: boolean; disabled: boolean }) {
  const id = useId();
  const startedRef = useRef<HTMLInputElement | null>(null);
  const messagePlaceholder = useSectionText("messagePlaceholder", "How can we help?");

  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  return (
    <>
      <input type="hidden" name="standId" value={standId} />
      <input ref={startedRef} type="hidden" name="startedAt" defaultValue="" />
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-hp`}>Leave this empty</label>
        <input id={`${id}-hp`} name={CONTACT_TRAP_FIELD} tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sf-sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={LABEL}>
            <SectionCopy k="nameLabel" fallback="Name" />
          </label>
          <input id={`${id}-name`} name="name" required maxLength={CONTACT_LIMITS.name} autoComplete="name" disabled={disabled} className={INPUT} />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={LABEL}>
            <SectionCopy k="emailLabel" fallback="Email" />
          </label>
          <input id={`${id}-email`} name="email" type="email" required maxLength={CONTACT_LIMITS.email} autoComplete="email" disabled={disabled} className={INPUT} />
        </div>
        {showPhone ? (
          <div className="sf-sm:col-span-2">
            <label htmlFor={`${id}-phone`} className={LABEL}>
              <SectionCopy k="phoneLabel" fallback="Phone (optional)" />
            </label>
            <input id={`${id}-phone`} name="phone" type="tel" maxLength={CONTACT_LIMITS.phone} autoComplete="tel" disabled={disabled} className={INPUT} />
          </div>
        ) : null}
        <div className="sf-sm:col-span-2">
          <label htmlFor={`${id}-message`} className={LABEL}>
            <SectionCopy k="messageLabel" fallback="Message" />
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            required
            rows={5}
            maxLength={CONTACT_LIMITS.message}
            placeholder={messagePlaceholder}
            disabled={disabled}
            className={INPUT}
          />
        </div>
      </div>
    </>
  );
}
