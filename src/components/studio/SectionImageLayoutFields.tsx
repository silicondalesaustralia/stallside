"use client";

import {
  IMAGE_RADIUS_MAX,
  IMAGE_RADIUS_SECTIONS,
  SPLIT_SECTIONS,
  type ImageRadius,
} from "@/lib/website/sections/section-style";

/** Older saves used size names; show them as their pixel size. */
const PRESET_PX: Record<string, number> = { none: 0, sm: 8, md: 16, lg: 28, xl: 48 };
const PILL = "rounded-lg border px-2.5 py-1.5 text-xs font-semibold";
const PILL_ON = "border-[var(--field)] bg-[var(--wash)] text-[var(--field)]";
const PILL_OFF = "border-[var(--line)] text-[var(--muted)]";

/** Image corner rounding and side swap for sections that have them. */
export default function SectionImageLayoutFields({
  craftName,
  imageRadius,
  swapSides,
  onRadius,
  onSwap,
}: {
  craftName: string;
  imageRadius?: ImageRadius;
  swapSides?: boolean;
  onRadius: (value: ImageRadius | undefined) => void;
  onSwap: (value: boolean) => void;
}) {
  const hasImage = IMAGE_RADIUS_SECTIONS.has(craftName);
  const isSplit = SPLIT_SECTIONS.has(craftName);
  if (!hasImage && !isSplit) return null;
  const px = imageRadius === undefined ? undefined : typeof imageRadius === "number" ? imageRadius : PRESET_PX[imageRadius];

  return (
    <>
      {hasImage ? (
        <div className="space-y-1.5">
          <p className="block text-xs font-semibold text-[var(--field)]">Image corner radius</p>
          {craftName === "CraftHeroSection" ? (
            <p className="text-xs text-[var(--muted)]">
              For Split, Produce split, collage and banner layouts. Full-background heroes have no corners.
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={px ?? 0}
              onChange={(e) => onRadius(Number(e.target.value))}
              className="min-w-0 flex-1"
              aria-label="Image corner radius"
            />
            <input
              type="number"
              min={0}
              max={IMAGE_RADIUS_MAX}
              value={px ?? ""}
              placeholder="—"
              onChange={(e) => onRadius(clampRadius(e.target.value))}
              className="w-16 rounded-lg border border-[var(--line)] bg-white px-2 py-1 text-sm"
              aria-label="Image corner radius in pixels"
            />
            <span className="text-xs text-[var(--muted)]">px</span>
            <button
              type="button"
              className={`${PILL} ${px === undefined ? PILL_ON : PILL_OFF}`}
              onClick={() => onRadius(undefined)}
            >
              Default
            </button>
          </div>
        </div>
      ) : null}
      {isSplit ? (
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--field)]">
            <input type="checkbox" checked={Boolean(swapSides)} onChange={(e) => onSwap(e.target.checked)} />
            Swap image and text sides
          </label>
          <p className="text-xs text-[var(--muted)]">
            Side-by-side layouts only. Phones always stack them.
          </p>
        </div>
      ) : null}
    </>
  );
}

function clampRadius(raw: string): number | undefined {
  if (raw.trim() === "") return undefined;
  const n = Math.round(Number(raw));
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), IMAGE_RADIUS_MAX) : undefined;
}
