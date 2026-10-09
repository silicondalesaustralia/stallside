"use client";

import type { ReactNode } from "react";
import { useNode } from "@craftjs/core";
import { STUDIO_RESOLVER_NAMES } from "@/lib/studio/section-registry";
import { isColourValue } from "@/lib/website/sections/section-style";
import { colourCss } from "@/lib/website/sections/colour";

const ALLOWED = STUDIO_RESOLVER_NAMES.filter((n) => n !== "CraftPageRoot");

export default function StudioPageRoot({
  children,
  background,
}: {
  children?: ReactNode;
  /** This page's background behind the sections; empty uses the site default. */
  background?: string;
}) {
  const { connectors: { connect } } = useNode();
  return (
    <div
      ref={(dom) => { if (dom) connect(dom); }}
      className="studio-page-root"
      style={isColourValue(background) ? { backgroundColor: colourCss(background) } : undefined}
    >
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
