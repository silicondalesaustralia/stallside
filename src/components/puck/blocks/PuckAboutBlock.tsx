"use client";

import InlineEditableText from "@/components/studio/InlineEditableText";

type AboutProps = {
  heading: string;
  body: string;
  layout: "simple" | "card";
  editable?: boolean;
};

export default function PuckAboutBlock({
  heading,
  body,
  layout,
  editable = false,
}: AboutProps) {
  const headingClass =
    "font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]";
  const bodyClass =
    "mt-4 whitespace-pre-wrap text-lg leading-relaxed text-[var(--muted)]";

  const inner = editable ? (
    <>
      <InlineEditableText
        prop="heading"
        value={heading}
        as="h2"
        className={headingClass}
        placeholder="About us"
      />
      <InlineEditableText
        prop="body"
        value={body}
        as="p"
        className={bodyClass}
        multiline
        placeholder="Tell your story — click to edit"
      />
    </>
  ) : (
    <>
      <h2 className={headingClass}>{heading || "About us"}</h2>
      {body ? <p className={bodyClass}>{body}</p> : null}
    </>
  );

  if (layout === "card") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
          {inner}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">{inner}</section>
  );
}
