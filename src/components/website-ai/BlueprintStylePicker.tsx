"use client";

import { useState } from "react";
import {
  listWebsiteBlueprints,
  type BlueprintRecommendation,
  type WebsiteBlueprintId,
} from "@/lib/website/blueprints";
import BlueprintHomepagePreview from "./BlueprintHomepagePreview";

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
  recommendation: BlueprintRecommendation;
  businessName?: string;
};

export default function BlueprintStylePicker({
  selectedId,
  onSelect,
  recommendation,
  businessName,
}: Props) {
  const blueprints = listWebsiteBlueprints();
  const [lightboxId, setLightboxId] = useState<WebsiteBlueprintId | null>(null);
  const lightbox = blueprints.find((b) => b.id === lightboxId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-[var(--field)]">Choose your starting style</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Vendl can choose for you, or pick a look you like. Examples show a full homepage
          with sample products — not a live store yet.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onSelect("vendl-choose")}
        aria-pressed={selectedId === "vendl-choose"}
        className={
          selectedId === "vendl-choose"
            ? "rounded-md border-2 border-[var(--field)] bg-[var(--field)]/5 px-4 py-4 text-left"
            : "rounded-md border border-[var(--border)] bg-white px-4 py-4 text-left hover:border-[var(--field)]"
        }
      >
        <p className="text-sm font-semibold text-[var(--field)]">Let Vendl choose for me</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {recommendation.userFacingReason} Suggested:{" "}
          <span className="font-medium text-[var(--field)]">
            {blueprints.find((b) => b.id === recommendation.recommendedBlueprintId)?.name}
          </span>
          .
        </p>
      </button>

      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        Explore styles
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {blueprints.map((bp) => {
          const selected = selectedId === bp.id;
          const recommended = bp.id === recommendation.recommendedBlueprintId;
          return (
            <div
              key={bp.id}
              className={
                selected
                  ? "overflow-hidden rounded-md border-2 border-[var(--field)] bg-white"
                  : "overflow-hidden rounded-md border border-[var(--border)] bg-white"
              }
            >
              <button
                type="button"
                className="block w-full text-left"
                onClick={() => onSelect(bp.id)}
                aria-pressed={selected}
              >
                <div className="relative aspect-[4/5] overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
                  <div className="absolute inset-0 origin-top scale-[0.92]">
                    <BlueprintHomepagePreview
                      blueprint={bp}
                      businessName={businessName}
                    />
                  </div>
                </div>
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--field)]">{bp.name}</p>
                    {recommended ? (
                      <span className="rounded bg-[var(--field)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--field)]">
                        Suggested
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">
                    {bp.description}
                  </p>
                </div>
              </button>
              <div className="flex gap-2 border-t border-[var(--border)] px-3 py-2">
                <button
                  type="button"
                  className="text-xs font-medium text-[var(--muted)] underline"
                  onClick={() => setLightboxId(bp.id)}
                >
                  See example
                </button>
                <button
                  type="button"
                  className="ml-auto text-xs font-medium text-[var(--field)] underline"
                  onClick={() => onSelect(bp.id)}
                >
                  Use this style
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-8"
          role="dialog"
          aria-modal
          aria-label={`${lightbox.name} homepage example`}
          onClick={() => setLightboxId(null)}
        >
          <div
            className="my-4 w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <div>
                <p className="font-semibold">{lightbox.name}</p>
                <p className="text-sm text-white/80">{lightbox.description}</p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-[var(--field)]"
                onClick={() => setLightboxId(null)}
              >
                Close
              </button>
            </div>
            <BlueprintHomepagePreview
              blueprint={lightbox}
              businessName={businessName}
              expanded
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-[var(--field)]"
                onClick={() => {
                  onSelect(lightbox.id);
                  setLightboxId(null);
                }}
              >
                Use this style
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
