"use client";

import type { WebsiteBlueprint } from "@/lib/website/blueprints";
import type { DemoKit } from "@/lib/website/demo-kits";
import BlueprintHomepagePreview from "../BlueprintHomepagePreview";
import DemoBrandStrip from "./DemoBrandStrip";

type Props = {
  blueprint: WebsiteBlueprint;
  kit: DemoKit;
  businessName: string;
  logoUrl?: string | null;
  selected: boolean;
  recommended: boolean;
  onSelect: () => void;
  onSeeDemo: () => void;
};

export default function StyleSlideCard({
  blueprint,
  kit,
  businessName,
  logoUrl,
  selected,
  recommended,
  onSelect,
  onSeeDemo,
}: Props) {
  return (
    <div
      className={
        selected
          ? "overflow-hidden rounded-md border-2 border-[var(--field)] bg-white"
          : "overflow-hidden rounded-md border border-[var(--border)] bg-white"
      }
    >
      <button type="button" className="block w-full text-left" onClick={onSelect} aria-pressed={selected}>
        <div className="relative aspect-[16/10] overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="absolute inset-0 origin-top scale-[0.95]">
            <BlueprintHomepagePreview
              blueprint={blueprint}
              kit={kit}
              businessName={businessName}
              logoUrl={logoUrl}
            />
          </div>
        </div>
        <DemoBrandStrip blueprint={blueprint} businessName={businessName} logoUrl={logoUrl} />
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[var(--field)]">{blueprint.name}</p>
            {recommended ? (
              <span className="rounded bg-[var(--field)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--field)]">
                Suggested
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{blueprint.cardDescription}</p>
          <p className="mt-1 text-[10px] text-[var(--muted)]">{blueprint.layoutTags.join(" · ")}</p>
          <p className="mt-0.5 text-[10px] text-[var(--muted)]">
            {blueprint.brandKit.typography.display.family} / {blueprint.brandKit.typography.body.family}
          </p>
        </div>
      </button>
      <div className="flex gap-2 border-t border-[var(--border)] px-3 py-2">
        <button type="button" className="text-xs font-medium text-[var(--muted)] underline" onClick={onSeeDemo}>
          See demo
        </button>
        <button
          type="button"
          className="ml-auto text-xs font-medium text-[var(--field)] underline"
          onClick={onSelect}
        >
          Use this style
        </button>
      </div>
    </div>
  );
}
