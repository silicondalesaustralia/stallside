"use client";

import type { QrPoster } from "@/lib/qr/poster";
import type { PosterExtras } from "@/lib/qr/poster-extras";

type ToggleKey = "showInstructions" | "showBundles" | "showFirstOrder" | "showFreshness" | "showHowItWorks";

export default function PosterSectionToggles({
  poster,
  extras,
  onChange,
}: {
  poster: QrPoster;
  extras: PosterExtras;
  onChange: (patch: Partial<QrPoster>) => void;
}) {
  const toggles: { key: ToggleKey; label: string; hint: string | null }[] = [
    { key: "showInstructions", label: "Sign message + instructions", hint: null },
    { key: "showBundles", label: "Bundle / volume prices", hint: extras.bundleLines.length ? null : "(none set on products yet)" },
    { key: "showFirstOrder", label: "First-order offer", hint: extras.firstOrderLine ? null : "(enable in business conversion settings)" },
    { key: "showFreshness", label: "Freshness lines", hint: extras.freshnessLines.length ? null : "(add freshness notes on products)" },
    { key: "showHowItWorks", label: "How it works (Scan · Pick · Pay)", hint: null },
  ];

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-[var(--line)] p-3">
      <legend className="px-1 text-sm font-medium">Poster sections</legend>
      <p className="text-xs text-[var(--muted)]">Tick to show on the printout.</p>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={poster.showCta}
          onChange={(e) => onChange({ showCta: e.target.checked })}
          className="size-4"
        />
        Big headline
      </label>
      {poster.showCta ? (
        <label className="flex flex-col gap-1 pl-6 text-sm">
          <span className="font-medium">Headline text</span>
          <input
            maxLength={60}
            value={poster.ctaText}
            onChange={(e) => onChange({ ctaText: e.target.value })}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
      ) : null}

      {toggles.map((t) => (
        <label key={t.key} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={poster[t.key]}
            onChange={(e) => onChange({ [t.key]: e.target.checked })}
            className="size-4"
          />
          {t.label}
          {t.hint ? <span className="text-xs text-[var(--muted)]">{t.hint}</span> : null}
        </label>
      ))}
    </fieldset>
  );
}
