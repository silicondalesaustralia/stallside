"use client";

import type { WebsiteBlueprint } from "@/lib/website/blueprints";
import type { DemoKit } from "@/lib/website/demo-kits";
import BlueprintHomepagePreview from "../BlueprintHomepagePreview";

type Props = {
  blueprint: WebsiteBlueprint;
  kit: DemoKit;
  businessName: string;
  logoUrl?: string | null;
  onClose: () => void;
  onUse: () => void;
};

export default function StyleDemoLightbox({
  blueprint,
  kit,
  businessName,
  logoUrl,
  onClose,
  onUse,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-8"
      role="dialog"
      aria-modal
      aria-label={`${blueprint.name} style demo`}
      onClick={onClose}
    >
      <div className="my-4 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-950">
          Preview with your logo. Photos, products and prices are examples.
        </div>
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <div>
            <p className="font-semibold">{blueprint.name}</p>
            <p className="text-sm text-white/80">{blueprint.cardDescription}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-[var(--field)]"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <BlueprintHomepagePreview
          blueprint={blueprint}
          kit={kit}
          businessName={businessName}
          logoUrl={logoUrl}
          expanded
        />
        <div className="mt-3 rounded-md bg-white p-3 text-xs text-[var(--muted)]">
          <p className="font-medium text-[var(--field)]">Style details</p>
          <p className="mt-1">{blueprint.layoutTags.join(" · ")}</p>
          <p className="mt-1">
            {blueprint.brandKit.typography.display.family} / {blueprint.brandKit.typography.body.family}
          </p>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-[var(--field)]"
            onClick={onUse}
          >
            Use this style
          </button>
        </div>
      </div>
    </div>
  );
}
