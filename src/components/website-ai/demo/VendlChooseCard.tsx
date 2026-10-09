"use client";

import type { BlueprintRecommendation } from "@/lib/website/blueprints";

type Props = {
  selected: boolean;
  recommendation: BlueprintRecommendation;
  suggestedName?: string;
  onSelect: () => void;
};

export default function VendlChooseCard({
  selected,
  recommendation,
  suggestedName,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={
        selected
          ? "rounded-md border-2 border-[var(--field)] bg-[var(--field)]/5 px-4 py-4 text-left"
          : "rounded-md border border-[var(--border)] bg-white px-4 py-4 text-left hover:border-[var(--field)]"
      }
    >
      <p className="text-sm font-semibold text-[var(--field)]">Let Vendl choose for me</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {recommendation.userFacingReason} Suggested:{" "}
        <span className="font-medium text-[var(--field)]">{suggestedName}</span>.
      </p>
    </button>
  );
}
