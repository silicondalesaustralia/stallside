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
};

export default function StyleSlideCard({
  blueprint,
  kit,
  businessName,
  logoUrl,
  selected,
  recommended,
  onSelect,
}: Props) {
  return (
    <div
      className={
        selected
          ? "overflow-hidden rounded-md border-2 border-[var(--field)] bg-white"
          : "overflow-hidden rounded-md border border-[var(--border)] bg-white"
      }
    >
      <div className="relative max-h-[28rem] overflow-y-auto overscroll-contain border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="pointer-events-none min-h-full origin-top scale-[0.98]">
          <BlueprintHomepagePreview
            blueprint={blueprint}
            kit={kit}
            businessName={businessName}
            logoUrl={logoUrl}
            expanded
          />
        </div>
        <p className="sticky bottom-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2 text-center text-[10px] font-medium text-white">
          Scroll to see more of this style
        </p>
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
      <div className="flex gap-2 border-t border-[var(--border)] px-3 py-2">
        <button
          type="button"
          className="ml-auto rounded-md bg-[var(--field)] px-3 py-1.5 text-xs font-medium text-white"
          onClick={onSelect}
        >
          Use this style
        </button>
      </div>
    </div>
  );
}
