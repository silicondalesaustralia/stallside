"use client";

import { Element } from "@craftjs/core";
import type { ReactNode } from "react";
import { useNode } from "@craftjs/core";
import CraftHeroSection from "./CraftHeroSection";
import CraftProductGridSection from "./CraftProductGridSection";
import CraftNextDropSection from "./CraftNextDropSection";
import CraftAboutSection from "./CraftAboutSection";

export default function CraftPageRoot({ children }: { children?: ReactNode }) {
  const { connectors: { connect } } = useNode();
  return (
    <div ref={(dom) => { if (dom) connect(dom); }} className="craft-page-root">
      {children}
    </div>
  );
}

CraftPageRoot.craft = {
  displayName: "CraftPageRoot",
  isCanvas: true,
  rules: {
    canDrag: () => false,
    canMoveIn: (incoming: Array<{ data: { displayName: string } }>) =>
      incoming.every((node) =>
        [
          "CraftHeroSection",
          "CraftProductGridSection",
          "CraftNextDropSection",
          "CraftAboutSection",
        ].includes(node.data.displayName),
      ),
  },
};

export function CraftStarterTree({
  headline,
  subheadline,
  about,
  showNextDrop,
}: {
  headline: string;
  subheadline: string | null;
  about: string | null;
  showNextDrop: boolean;
}) {
  return (
    <Element is={CraftPageRoot} canvas>
      <CraftHeroSection
        headline={headline}
        supportingText={subheadline ?? ""}
        layout="simple"
        ctaLabel="Shop now"
        showCta
      />
      {showNextDrop ? (
        <CraftNextDropSection
          maxItems={3}
          showClosingDate
          showPickupDate
          preset="card"
          heading="Next drop"
        />
      ) : null}
      <CraftProductGridSection
        source="all"
        categoryId=""
        productIds={[]}
        limit={8}
        layout="grid"
        columns={3}
        preset="classic"
        heading="Products"
        showPrice
        showAvailability
      />
      <CraftAboutSection
        heading="About us"
        body={about ?? "Tell customers who you are and what you make."}
        layout="simple"
      />
    </Element>
  );
}
