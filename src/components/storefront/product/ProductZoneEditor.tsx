"use client";

import { Fragment, type ReactNode } from "react";
import {
  PRODUCT_BLOCK_LABELS,
  PRODUCT_ZONE_LABELS,
  type ProductBlockId,
  type ProductZone,
} from "@/lib/studio/product-blocks";
import { useProductBlockDrag } from "./ProductBlockDrag";

const MARKER = <div aria-hidden className="my-2 h-1 rounded-full bg-[var(--leaf)]" />;

/** A product page zone in the editor: each block gets a drag handle; a line shows where a dragged block will snap in. */
export default function ProductZoneEditor({
  zone,
  items,
  className = "",
}: {
  zone: ProductZone;
  items: { id: ProductBlockId; node: ReactNode }[];
  className?: string;
}) {
  const dnd = useProductBlockDrag();
  const drag = dnd?.drag ?? null;
  if (!items.length && !drag) return null;

  const target = drag?.target?.zone === zone ? drag.target.index : null;
  const others = items.filter((item) => item.id !== drag?.id);

  return (
    <div
      data-pd-zone={zone}
      className={`${className} ${drag ? "rounded-xl outline-2 outline-offset-4 outline-dashed outline-[var(--line)]" : ""} ${target !== null ? "outline-[var(--leaf)]" : ""}`}
    >
      {items.map((item) => {
        const dragged = item.id === drag?.id;
        const slot = others.findIndex((o) => o.id === item.id);
        const marker = !dragged && target === slot ? MARKER : null;
        return (
          <Fragment key={item.id}>
            {marker}
            <div data-pd-block={item.id} className={`group/pd relative ${dragged ? "opacity-40" : ""}`}>
              {dnd ? (
                <button
                  type="button"
                  {...dnd.handleProps(item.id)}
                  aria-label={`Drag ${PRODUCT_BLOCK_LABELS[item.id]}`}
                  className="absolute -top-3 right-0 z-10 cursor-grab touch-none rounded-full border border-[var(--line)] bg-white px-2 py-0.5 text-[11px] font-semibold text-[var(--field)] opacity-0 shadow-sm transition-opacity group-hover/pd:opacity-100 focus:opacity-100 active:cursor-grabbing"
                >
                  ⠿ {PRODUCT_BLOCK_LABELS[item.id]}
                </button>
              ) : null}
              {item.node}
            </div>
          </Fragment>
        );
      })}
      {target === others.length ? MARKER : null}
      {drag && !others.length ? (
        <p className="flex min-h-20 items-center justify-center text-xs font-semibold text-[var(--muted)]">
          Drop here: {PRODUCT_ZONE_LABELS[zone]}
        </p>
      ) : null}
    </div>
  );
}
