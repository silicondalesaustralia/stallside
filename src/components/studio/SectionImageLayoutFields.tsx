"use client";

import {
  IMAGE_RADII,
  IMAGE_RADIUS_SECTIONS,
  SPLIT_SECTIONS,
  type ImageRadius,
} from "@/lib/website/sections/section-style";

const RADIUS_LABELS: Record<ImageRadius, string> = {
  none: "Square",
  sm: "S",
  md: "M",
  lg: "L",
  xl: "XL",
};
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

  return (
    <>
      {hasImage ? (
        <div className="space-y-1.5">
          <p className="block text-xs font-semibold text-[var(--field)]">Image corners</p>
          {craftName === "CraftHeroSection" ? (
            <p className="text-xs text-[var(--muted)]">
              For Split, Produce split, collage and banner layouts. Full-background heroes have no corners.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              className={`${PILL} ${!imageRadius ? PILL_ON : PILL_OFF}`}
              onClick={() => onRadius(undefined)}
            >
              Default
            </button>
            {IMAGE_RADII.map((r) => (
              <button
                key={r}
                type="button"
                className={`${PILL} ${imageRadius === r ? PILL_ON : PILL_OFF}`}
                onClick={() => onRadius(r)}
              >
                {RADIUS_LABELS[r]}
              </button>
            ))}
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
