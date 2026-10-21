"use client";

import type { FontSample } from "@/lib/storefront/font-sample";

/** Shows the chosen font's name written in that font, under a font picker. */
export default function FontSamplePreview({ sample }: { sample: FontSample }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--wash)] px-3 py-2" aria-live="polite">
      {sample.href ? <link rel="stylesheet" href={sample.href} precedence="default" /> : null}
      <p className="truncate text-lg leading-snug text-[var(--ink)]" style={{ fontFamily: sample.family }}>
        {sample.name}
      </p>
      <p className="truncate text-sm text-[var(--muted)]" style={{ fontFamily: sample.family }}>
        The quick brown fox jumps over the lazy dog
      </p>
    </div>
  );
}
