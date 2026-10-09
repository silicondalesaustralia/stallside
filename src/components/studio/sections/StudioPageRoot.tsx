"use client";

import type { ReactNode } from "react";
import { useNode } from "@craftjs/core";
import { STUDIO_RESOLVER_NAMES } from "@/lib/studio/section-registry";

const ALLOWED = STUDIO_RESOLVER_NAMES.filter((n) => n !== "CraftPageRoot");

export default function StudioPageRoot({ children }: { children?: ReactNode }) {
  const { connectors: { connect } } = useNode();
  return (
    <div ref={(dom) => { if (dom) connect(dom); }} className="studio-page-root">
      {children}
    </div>
  );
}

StudioPageRoot.craft = {
  displayName: "CraftPageRoot",
  isCanvas: true,
  rules: {
    canDrag: () => false,
    canMoveIn: (incoming: Array<{ data: { displayName: string } }>) =>
      incoming.every((node) =>
        ALLOWED.includes(node.data.displayName as (typeof ALLOWED)[number]),
      ),
  },
};
