"use client";

/** Poster block toggles for Feature 7 - saved with QR print form. */

export type PosterBlockValues = {
  posterShowCta: boolean;
  posterCtaText: string | null;
  posterShowBundles: boolean;
  posterShowFirstOrder: boolean;
  posterShowInstructions: boolean;
  posterShowFreshness: boolean;
  posterShowHowItWorks: boolean;
};

export default function PosterBlockToggles({
  values,
}: {
  values: PosterBlockValues;
}) {
  return (
    <fieldset className="flex flex-col gap-2 rounded-lg border border-[var(--line)] p-3">
      <legend className="px-1 text-sm font-medium">Poster sections</legend>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="posterShowCta"
          defaultChecked={values.posterShowCta}
          className="size-4"
        />
        Big CTA headline
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">CTA text</span>
        <input
          name="posterCtaText"
          maxLength={60}
          defaultValue={values.posterCtaText ?? "SCAN TO PAY - CASH OR CARD"}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="posterShowBundles"
          defaultChecked={values.posterShowBundles}
          className="size-4"
        />
        Bundle / volume prices
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="posterShowFirstOrder"
          defaultChecked={values.posterShowFirstOrder}
          className="size-4"
        />
        First-order offer
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="posterShowInstructions"
          defaultChecked={values.posterShowInstructions}
          className="size-4"
        />
        Custom note / instructions
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="posterShowFreshness"
          defaultChecked={values.posterShowFreshness}
          className="size-4"
        />
        Freshness lines
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="posterShowHowItWorks"
          defaultChecked={values.posterShowHowItWorks}
          className="size-4"
        />
        How it works (Scan · Pick · Pay)
      </label>
    </fieldset>
  );
}
