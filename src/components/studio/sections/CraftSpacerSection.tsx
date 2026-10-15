"use client";

import { useNode } from "@craftjs/core";
import { useRef, type PointerEvent } from "react";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import StudioSpacerBlock from "@/components/studio/blocks/StudioSpacerBlock";
import { spacerHeightOf, spacerView } from "@/lib/studio/spacer-settings";

export type CraftSpacerProps = { height?: number; mobileHeight?: number };

/** Blank space between sections; drag the bottom handle to change the height. */
export default function CraftSpacerSection(props: CraftSpacerProps) {
  const {
    connectors: { connect, drag },
    actions: { setProp },
  } = useNode();
  const view = spacerView(props);
  const start = useRef<{ y: number; height: number } | null>(null);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { y: e.clientY, height: view.height };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!start.current) return;
    const next = spacerHeightOf(start.current.height + e.clientY - start.current.y);
    setProp((p: CraftSpacerProps) => {
      p.height = next;
    }, 300);
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    start.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <div ref={(dom) => { if (dom) connect(drag(dom)); }}>
      <CraftSectionChrome>
        <div className="relative outline-1 -outline-offset-1 outline-dashed outline-[var(--line)]">
          <StudioSpacerBlock height={view.height} mobileHeight={view.mobileHeight} />
          <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[11px] font-semibold text-[var(--muted)]">
            Spacer · {view.height}px
          </span>
          <div
            role="separator"
            aria-label="Drag to change the spacer height"
            title="Drag to change the height"
            draggable={false}
            onMouseDown={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="absolute inset-x-0 -bottom-1.5 z-10 flex h-3 cursor-ns-resize touch-none items-center justify-center"
          >
            <span className="h-1.5 w-12 rounded-full bg-[var(--leaf)] shadow" />
          </div>
        </div>
      </CraftSectionChrome>
    </div>
  );
}

CraftSpacerSection.craft = {
  displayName: "CraftSpacerSection",
  props: { height: 48 },
  rules: { canDrag: () => true, canMoveIn: () => false },
};
