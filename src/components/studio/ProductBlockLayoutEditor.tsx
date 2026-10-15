"use client";

import {
  PRODUCT_BLOCK_LABELS,
  PRODUCT_ZONES,
  PRODUCT_ZONE_LABELS,
  moveBlock,
  type ProductBlockLayout,
  type ProductZone,
} from "@/lib/studio/product-blocks";

const ARROW = "rounded-md border border-[var(--line)] px-2 py-0.5 text-xs font-semibold disabled:opacity-30";

/** Settings-panel version of drag-and-drop: pick a block's zone and nudge it up or down. */
export default function ProductBlockLayoutEditor({
  layout,
  onChange,
}: {
  layout: ProductBlockLayout;
  onChange: (next: ProductBlockLayout) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="block text-xs font-semibold text-[var(--field)]">Page blocks</p>
      <p className="text-xs text-[var(--muted)]">
        Drag a block on the page by its handle, or move it here. Blocks snap to the width of the area you drop them in.
      </p>
      {PRODUCT_ZONES.map((zone) => (
        <div key={zone} className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{PRODUCT_ZONE_LABELS[zone]}</p>
          {layout[zone].length === 0 ? <p className="text-xs text-[var(--muted)]">Empty</p> : null}
          {layout[zone].map((block, i) => (
            <div key={block} className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-2 py-1.5">
              <span className="min-w-0 flex-1 truncate text-sm">{PRODUCT_BLOCK_LABELS[block]}</span>
              <button type="button" className={ARROW} aria-label={`Move ${PRODUCT_BLOCK_LABELS[block]} up`} disabled={i === 0} onClick={() => onChange(moveBlock(layout, block, zone, i - 1))}>
                ↑
              </button>
              <button type="button" className={ARROW} aria-label={`Move ${PRODUCT_BLOCK_LABELS[block]} down`} disabled={i === layout[zone].length - 1} onClick={() => onChange(moveBlock(layout, block, zone, i + 1))}>
                ↓
              </button>
              <select
                aria-label={`Area for ${PRODUCT_BLOCK_LABELS[block]}`}
                className="rounded-md border border-[var(--line)] bg-white px-1 py-0.5 text-xs"
                value={zone}
                onChange={(e) => {
                  const to = e.target.value as ProductZone;
                  onChange(moveBlock(layout, block, to, layout[to].length));
                }}
              >
                {PRODUCT_ZONES.map((z) => (
                  <option key={z} value={z}>{PRODUCT_ZONE_LABELS[z]}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
