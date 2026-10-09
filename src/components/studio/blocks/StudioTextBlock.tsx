"use client";

import InlineEditableText from "@/components/studio/InlineEditableText";

export default function StudioTextBlock({
  heading,
  body,
  alignment,
  editable = false,
}: {
  heading: string;
  body: string;
  alignment: "left" | "centre";
  editable?: boolean;
}) {
  const align = alignment === "centre" ? "text-center mx-auto" : "text-left";
  const headingClass = `font-[family-name:var(--font-display)] text-2xl font-bold tracking-[var(--studio-heading-tracking)] text-[var(--field)] ${align}`;
  const bodyClass = `mt-4 whitespace-pre-wrap text-lg leading-relaxed text-[var(--muted)] ${align}`;

  if (editable) {
    return (
      <section className="studio-section mx-auto max-w-3xl px-4 py-[var(--studio-section-py,3rem)] sm:px-6">
        <InlineEditableText
          prop="heading"
          value={heading}
          as="h2"
          className={headingClass}
          placeholder="Add a heading"
        />
        <InlineEditableText
          prop="body"
          value={body}
          as="p"
          className={bodyClass}
          multiline
          placeholder="Add text — click to edit"
        />
      </section>
    );
  }

  return (
    <section className="studio-section mx-auto max-w-3xl px-4 py-[var(--studio-section-py,3rem)] sm:px-6">
      {heading ? <h2 className={headingClass}>{heading}</h2> : null}
      {body ? <p className={bodyClass}>{body}</p> : null}
    </section>
  );
}
