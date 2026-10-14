"use client";

import InlineEditableText from "@/components/studio/InlineEditableText";
import SectionHeadingTag from "@/components/studio/SectionHeadingTag";
import RichText from "@/components/studio/RichText";
import { visibleFaqItems, type FaqItem } from "@/lib/studio/faq-items";

const HEADING =
  "font-[family-name:var(--font-display)] text-2xl font-bold tracking-[var(--studio-heading-tracking)] text-[var(--field)]";
const INTRO = "mt-3 text-lg leading-relaxed text-[var(--muted)]";

/** Questions with answers that open on click (or start open). */
export default function StudioFaqBlock({
  heading,
  intro,
  items,
  startOpen,
  editable = false,
}: {
  heading: string;
  intro: string;
  items: FaqItem[];
  startOpen: boolean;
  editable?: boolean;
}) {
  const shown = editable ? items : visibleFaqItems(items);
  if (!editable && !shown.length) return null;

  return (
    <section className="studio-section mx-auto max-w-3xl py-[var(--studio-section-py,3rem)] studio-gutter">
      {editable ? (
        <InlineEditableText prop="heading" value={heading} as="h2" className={HEADING} placeholder="Add a heading" />
      ) : heading ? (
        <SectionHeadingTag className={HEADING}>{heading}</SectionHeadingTag>
      ) : null}
      {editable ? (
        <InlineEditableText prop="intro" value={intro} className={INTRO} placeholder="Add an intro (optional)" />
      ) : intro ? (
        <p className={INTRO}>{intro}</p>
      ) : null}
      {shown.length ? (
        <div className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {shown.map((item) => (
            <details key={`${item.id}-${startOpen ? "open" : "closed"}`} open={startOpen} className="group py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-lg font-semibold text-[var(--field)] [&::-webkit-details-marker]:hidden">
                <span>{item.question || "Untitled question"}</span>
                <span aria-hidden className="mt-0.5 shrink-0 text-xl leading-none transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              {item.answer ? (
                <RichText value={item.answer} className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--muted)]" />
              ) : null}
            </details>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-dashed border-[var(--line)] p-4 text-sm text-[var(--muted)]">
          No questions yet. Use &ldquo;Add question&rdquo; in the settings panel.
        </p>
      )}
    </section>
  );
}
