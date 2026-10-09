"use client";

import { listFontPairs, getFontPair } from "@/lib/website/brand-looks";
import FontPairCatalogLoader from "@/components/website/FontPairCatalogLoader";

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
  /** Form field name when used inside a form (default fontPairId). */
  name?: string;
  recommendedId?: string | null;
  compact?: boolean;
};

export default function FontPairPicker({
  selectedId,
  onSelect,
  name = "fontPairId",
  recommendedId,
  compact = false,
}: Props) {
  const pairs = listFontPairs();

  return (
    <fieldset className="flex flex-col gap-3">
      <FontPairCatalogLoader />
      <legend className="text-sm font-medium text-[var(--field)]">Fonts</legend>
      <p className="text-xs text-[var(--muted)]">
        {recommendedId
          ? `Suggested with your palette: ${getFontPair(recommendedId)?.label ?? "Market"}. Change anytime.`
          : "Headlines and body text. You can change this later in Branding."}
      </p>
      <div
        className={
          compact
            ? "grid gap-2 sm:grid-cols-2"
            : "grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {pairs.map((pair) => {
          const selected = selectedId === pair.id;
          const recommended = recommendedId === pair.id;
          return (
            <button
              key={pair.id}
              type="button"
              onClick={() => onSelect(pair.id)}
              aria-pressed={selected}
              className={`rounded-lg border p-3 text-left transition ${
                selected
                  ? "border-[var(--field)] ring-2 ring-[var(--field)]/20"
                  : "border-[var(--border)] hover:border-[var(--field)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <p
                  className="text-base font-semibold text-[var(--field)]"
                  style={{ fontFamily: pair.displayFamily }}
                >
                  {pair.label}
                </p>
                {recommended ? (
                  <span className="rounded bg-[var(--field)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--field)]">
                    Suggested
                  </span>
                ) : null}
              </div>
              <p
                className="mt-1 text-xs text-[var(--muted)]"
                style={{ fontFamily: pair.bodyFamily }}
              >
                {pair.description}
              </p>
              <p
                className="mt-2 text-sm text-[var(--field)]"
                style={{ fontFamily: pair.displayFamily }}
              >
                Your shop
              </p>
              <p
                className="text-xs text-[var(--muted)]"
                style={{ fontFamily: pair.bodyFamily }}
              >
                Fresh picks this week
              </p>
            </button>
          );
        })}
      </div>
      <input type="hidden" name={name} value={selectedId} />
    </fieldset>
  );
}
