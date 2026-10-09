"use client";

import Image from "next/image";
import InlineEditableText from "@/components/studio/InlineEditableText";

export default function StudioImageTextBlock({
  imageUrl,
  heading,
  body,
  layout,
  ctaLabel,
  editable = false,
}: {
  imageUrl: string | null;
  heading: string;
  body: string;
  layout: "image-left" | "image-right" | "editorial";
  ctaLabel: string;
  editable?: boolean;
}) {
  const reverse = layout === "image-right";
  const headingClass =
    "font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]";
  const bodyClass = "mt-4 whitespace-pre-wrap text-lg text-[var(--muted)]";

  return (
    <section className="studio-section mx-auto max-w-5xl px-4 py-[var(--studio-section-py,3rem)] sm:px-6">
      <div
        className={`grid items-center gap-8 ${layout === "editorial" ? "lg:grid-cols-1" : "lg:grid-cols-2"} ${reverse ? "lg:[direction:rtl]" : ""}`}
      >
        <div className={reverse ? "lg:[direction:ltr]" : ""}>
          {imageUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--studio-card-radius)]">
              <Image src={imageUrl} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 480px" />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-[var(--studio-card-radius)] border border-dashed border-[var(--line)] bg-[var(--wash)] text-sm text-[var(--muted)]">
              Add an image
            </div>
          )}
        </div>
        <div className={reverse ? "lg:[direction:ltr]" : ""}>
          {editable ? (
            <>
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
              {ctaLabel ? (
                <InlineEditableText
                  prop="ctaLabel"
                  value={ctaLabel}
                  as="span"
                  className="mt-6 inline-flex rounded-full bg-[var(--leaf-dark)] px-5 py-2.5 text-sm font-semibold text-white"
                  placeholder="Button label"
                />
              ) : null}
            </>
          ) : (
            <>
              {heading ? <h2 className={headingClass}>{heading}</h2> : null}
              {body ? <p className={bodyClass}>{body}</p> : null}
              {ctaLabel ? (
                <span className="mt-6 inline-flex rounded-full bg-[var(--leaf-dark)] px-5 py-2.5 text-sm font-semibold text-white">
                  {ctaLabel}
                </span>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
