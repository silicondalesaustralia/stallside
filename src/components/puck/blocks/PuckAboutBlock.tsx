"use client";

import InlineEditableText from "@/components/studio/InlineEditableText";
import SectionHeadingTag from "@/components/studio/SectionHeadingTag";
import InlineRichText from "@/components/studio/InlineRichText";
import RichText from "@/components/studio/RichText";

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
      <InlineRichText prop="body" value={body} className={bodyClass} placeholder="Tell your story — click to edit" />
    </>
  ) : (
    <>
      <SectionHeadingTag className={headingClass}>{heading || "About us"}</SectionHeadingTag>
      {body ? <RichText value={body} className={bodyClass} /> : null}
    </>
  );

  if (layout === "card") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sf-sm:px-6">
        <div className="rounded-2xl border border-[var(--line)] bg-white p-6 sf-sm:p-8">
          {inner}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sf-sm:px-6">{inner}</section>
  );
}
