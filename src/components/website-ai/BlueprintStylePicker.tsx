"use client";

import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import {
  listWebsiteBlueprints,
  type BlueprintRecommendation,
} from "@/lib/website/blueprints";
import {
  DEMO_KIT_IDS,
  getDemoKit,
  recommendDemoKit,
  type DemoKitId,
} from "@/lib/website/demo-kits";
import StyleSlideCard from "./demo/StyleSlideCard";
import StyleSliderShell from "./demo/StyleSliderShell";
import VendlChooseCard from "./demo/VendlChooseCard";
import BlueprintFontsLoader from "./BlueprintFontsLoader";

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
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const kit = useMemo(() => getDemoKit(kitId), [kitId]);
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

  useEffect(() => {
    if (!selectedId || selectedId === "vendl-choose") return;
    setKitId(
      recommendDemoKit({
        blueprintId: selectedId,
      }),
    );
  }, [selectedId]);

  function go(delta: number) {
    setSlideIndex((i) => (i + delta + total) % total);
  }

  function onTouchStart(e: TouchEvent) {
    const t = e.changedTouches[0];
    touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
  }

  function onTouchEnd(e: TouchEvent) {
    const start = touchStart.current;
    const end = e.changedTouches[0];
    touchStart.current = null;
    if (!start || !end) return;
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? 1 : -1);
  }

  return (
    <div className="flex flex-col gap-4">
      <BlueprintFontsLoader />
      <div>
        <p className="text-sm font-medium text-[var(--field)]">Choose your starting style</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Scroll each preview to see the full page. Use Prev/Next to compare styles.
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
        />
      </StyleSliderShell>
      <input type="hidden" name="demoKitId" value={kitId} />
    </div>
  );
}
