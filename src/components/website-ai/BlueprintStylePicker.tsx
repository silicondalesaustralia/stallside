"use client";

import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import {
  listWebsiteBlueprints,
  type BlueprintRecommendation,
  type WebsiteBlueprintId,
} from "@/lib/website/blueprints";
import {
  DEMO_KIT_IDS,
  getDemoKit,
  type DemoKitId,
} from "@/lib/website/demo-kits";
import StyleDemoLightbox from "./demo/StyleDemoLightbox";
import StyleSlideCard from "./demo/StyleSlideCard";
import StyleSliderShell from "./demo/StyleSliderShell";
import VendlChooseCard from "./demo/VendlChooseCard";

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
  recommendation: BlueprintRecommendation;
  businessName?: string;
  logoUrl?: string | null;
  defaultKitId?: DemoKitId;
};

const KIT_LABELS: Record<DemoKitId, string> = {
  "green-valley": "Green Valley",
  "mill-and-crumb": "Mill & Crumb",
  "north-and-field": "North & Field",
};

export default function BlueprintStylePicker({
  selectedId,
  onSelect,
  recommendation,
  businessName,
  logoUrl,
  defaultKitId = "green-valley",
}: Props) {
  const blueprints = listWebsiteBlueprints();
  const [kitId, setKitId] = useState<DemoKitId>(defaultKitId);
  const [slideIndex, setSlideIndex] = useState(0);
  const [lightboxId, setLightboxId] = useState<WebsiteBlueprintId | null>(null);
  const touchStartX = useRef<number | null>(null);
  const kit = useMemo(() => getDemoKit(kitId), [kitId]);
  const lightbox = blueprints.find((b) => b.id === lightboxId) ?? null;
  const name = businessName?.trim() || kit.placeholderName;

  const ordered = useMemo(() => {
    const suggested = recommendation.recommendedBlueprintId;
    return [...blueprints].sort((a, b) => {
      if (a.id === suggested) return -1;
      if (b.id === suggested) return 1;
      return 0;
    });
  }, [blueprints, recommendation.recommendedBlueprintId]);

  const current = ordered[slideIndex] ?? ordered[0]!;
  const total = ordered.length;

  useEffect(() => {
    const idx = ordered.findIndex((b) => b.id === selectedId);
    if (idx >= 0) setSlideIndex(idx);
  }, [selectedId, ordered]);

  function go(delta: number) {
    setSlideIndex((i) => (i + delta + total) % total);
  }

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: TouchEvent) {
    const start = touchStartX.current;
    const end = e.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (start == null || end == null) return;
    const dx = end - start;
    if (Math.abs(dx) < 48) return;
    go(dx < 0 ? 1 : -1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-[var(--field)]">Choose your starting style</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Same example products in every style — only the design changes. Slide to compare.
        </p>
      </div>

      <VendlChooseCard
        selected={selectedId === "vendl-choose"}
        recommendation={recommendation}
        suggestedName={
          blueprints.find((b) => b.id === recommendation.recommendedBlueprintId)?.name
        }
        onSelect={() => onSelect("vendl-choose")}
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
        <span>Showing styles with example products:</span>
        <select
          className="rounded border border-[var(--border)] bg-white px-2 py-1 text-xs font-medium text-[var(--field)]"
          value={kitId}
          onChange={(e) => setKitId(e.target.value as DemoKitId)}
        >
          {DEMO_KIT_IDS.map((id) => (
            <option key={id} value={id}>
              {KIT_LABELS[id]}
            </option>
          ))}
        </select>
      </div>

      <StyleSliderShell
        index={slideIndex}
        total={total}
        label={current.name}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        dots={ordered}
        onDot={setSlideIndex}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <StyleSlideCard
          blueprint={current}
          kit={kit}
          businessName={name}
          logoUrl={logoUrl}
          selected={selectedId === current.id}
          recommended={current.id === recommendation.recommendedBlueprintId}
          onSelect={() => onSelect(current.id)}
          onSeeDemo={() => setLightboxId(current.id)}
        />
      </StyleSliderShell>

      {lightbox ? (
        <StyleDemoLightbox
          blueprint={lightbox}
          kit={kit}
          businessName={name}
          logoUrl={logoUrl}
          onClose={() => setLightboxId(null)}
          onUse={() => {
            onSelect(lightbox.id);
            setLightboxId(null);
          }}
        />
      ) : null}
    </div>
  );
}
