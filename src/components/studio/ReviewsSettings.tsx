"use client";

import type { CraftReviewsProps } from "@/components/studio/sections/CraftReviewsSection";
import SiteChoice from "./SiteChoice";

const LAYOUTS = ["cards", "quote", "featured"] as const;
const LAYOUT_LABELS = { cards: "Cards (2 across)", quote: "List", featured: "One big quote" } as const;

/** Reviews section: layout, how many show, and whether shoppers can leave one. */
export default function ReviewsSettings({
  props,
  setProp,
}: {
  props: CraftReviewsProps;
  setProp: (k: string, v: unknown) => void;
}) {
  const max = Math.max(1, Math.min(Number(props.maxItems ?? 4), 8));
  return (
    <>
      <p className="text-xs text-[var(--muted)]">
        Only reviews you approve under Marketing → Reviews are shown. Style stars, names and review text under Text
        elements.
      </p>
      <SiteChoice label="Layout" options={LAYOUTS} labels={LAYOUT_LABELS} value={props.preset ?? "cards"} onChange={(v) => setProp("preset", v)} />
      <div className="space-y-1.5">
        <label htmlFor="reviews-max" className="flex justify-between text-xs font-semibold text-[var(--field)]">
          Reviews shown <span className="font-normal text-[var(--muted)]">{max}</span>
        </label>
        <input
          id="reviews-max"
          type="range"
          min={1}
          max={8}
          value={max}
          onChange={(e) => setProp("maxItems", Number(e.target.value))}
          className="w-full accent-[var(--leaf)]"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={props.showForm !== false} onChange={(e) => setProp("showForm", e.target.checked)} />
        Let customers leave a review
      </label>
      <p className="text-xs text-[var(--muted)]">New reviews wait for your approval. Edit the form wording on the page.</p>
    </>
  );
}
