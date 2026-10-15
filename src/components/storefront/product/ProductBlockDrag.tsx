"use client";

import { createContext, useContext, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  PRODUCT_BLOCK_LABELS,
  moveBlock,
  type ProductBlockId,
  type ProductBlockLayout,
  type ProductZone,
} from "@/lib/studio/product-blocks";

type DropTarget = { zone: ProductZone; index: number };
type DragState = { id: ProductBlockId; x: number; y: number; target: DropTarget | null; doc: Document };

type DragContext = {
  drag: DragState | null;
  handleProps: (id: ProductBlockId) => {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerCancel: () => void;
    onMouseDown: (e: { preventDefault: () => void }) => void;
  };
};

const Ctx = createContext<DragContext | null>(null);

export function useProductBlockDrag(): DragContext | null {
  return useContext(Ctx);
}

/** Where a block would land: the zone under the pointer, before the first block whose middle is below it. */
function dropTarget(doc: Document, x: number, y: number, dragged: ProductBlockId): DropTarget | null {
  const zoneEl = doc
    .elementsFromPoint(x, y)
    .map((el) => el.closest<HTMLElement>("[data-pd-zone]"))
    .find((el): el is HTMLElement => Boolean(el));
  const zone = zoneEl?.dataset.pdZone as ProductZone | undefined;
  if (!zoneEl || !zone) return null;
  const blocks = Array.from(zoneEl.querySelectorAll<HTMLElement>(":scope > [data-pd-block]")).filter(
    (el) => el.dataset.pdBlock !== dragged,
  );
  const index = blocks.filter((el) => {
    const box = el.getBoundingClientRect();
    return box.top + box.height / 2 < y;
  }).length;
  return { zone, index };
}

/** Editor-only: lets the seller drag product page blocks between zones; drops snap into place. */
export default function ProductBlockDragProvider({
  layout,
  onChange,
  children,
}: {
  layout: ProductBlockLayout;
  onChange: (next: ProductBlockLayout) => void;
  children: ReactNode;
}) {
  const [drag, setDrag] = useState<DragState | null>(null);

  const handleProps = (id: ProductBlockId) => ({
    // Stops the builder's own section drag from starting.
    onMouseDown: (e: { preventDefault: () => void }) => e.preventDefault(),
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setDrag({ id, x: e.clientX, y: e.clientY, target: null, doc: e.currentTarget.ownerDocument });
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      if (!drag || drag.id !== id) return;
      const target = dropTarget(drag.doc, e.clientX, e.clientY, id);
      setDrag({ ...drag, x: e.clientX, y: e.clientY, target });
    },
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => {
      if (!drag || drag.id !== id) return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (drag.target) onChange(moveBlock(layout, id, drag.target.zone, drag.target.index));
      setDrag(null);
    },
    onPointerCancel: () => setDrag(null),
  });

  return (
    <Ctx.Provider value={{ drag, handleProps }}>
      {children}
      {drag
        ? createPortal(
            <div
              className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-full bg-[var(--field)] px-3 py-1 text-xs font-semibold text-white shadow-lg"
              style={{ left: drag.x, top: drag.y - 8 }}
            >
              {PRODUCT_BLOCK_LABELS[drag.id]}
            </div>,
            drag.doc.body,
          )
        : null}
    </Ctx.Provider>
  );
}
