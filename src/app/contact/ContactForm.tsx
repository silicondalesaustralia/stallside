"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "./actions";
import {
  CONTACT_SUBJECTS,
  type ContactSubject,
} from "@/lib/contact-subjects";

const initial: ContactState = { ok: false };

const fieldClass =
  "mt-1.5 w-full rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-3 py-2.5 text-[var(--ink)] outline-none focus:border-[var(--leaf)]";

export default function ContactForm({
  defaultSubject = "General",
}: {
  defaultSubject?: ContactSubject;
}) {
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.ok && !state.error) {
    return (
      <p
        className="rounded-[var(--radius)] border border-[var(--leaf)]/40 bg-[var(--panel)] p-5 text-[var(--field)]"
        role="status"
      >
        Thanks. Your message was sent. We&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="stallside_hp">Leave blank</label>
        <input
          id="stallside_hp"
          name="stallside_hp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
        />
      </div>

      <div>
        <label htmlFor="name" className="text-sm font-medium text-[var(--ink)]">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={120}
          className={fieldClass}
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium text-[var(--ink)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={200}
          className={fieldClass}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="subject" className="text-sm font-medium text-[var(--ink)]">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          required
          defaultValue={defaultSubject}
          className={fieldClass}
        >
          {CONTACT_SUBJECTS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium text-[var(--ink)]">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          className={fieldClass}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
