"use client";

import type { WebsiteBlueprint } from "@/lib/website/blueprints";
import DemoBrandMark from "./DemoBrandMark";

type Props = {
  blueprint: WebsiteBlueprint;
  businessName: string;
  logoUrl?: string | null;
};

export default function DemoBrandStrip({ blueprint, businessName, logoUrl }: Props) {
  const p = blueprint.brandKit.palette;
  const swatches = [p.background, p.surface, p.text, p.primary, p.accent];
  const display = blueprint.brandKit.typography.display.family;
  const body = blueprint.brandKit.typography.body.family;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] px-3 py-2">
      <DemoBrandMark
        businessName={businessName}
        logoUrl={logoUrl}
        brandKit={blueprint.brandKit}
        maxHeightPx={20}
      />
      <div className="flex gap-0.5">
        {swatches.map((hex) => (
          <span
            key={hex}
            title={hex}
            className="h-3 w-3 rounded-sm border border-black/10"
            style={{ background: hex }}
          />
        ))}
      </div>
      <span className="ml-auto text-[10px] text-[var(--muted)]">
        <span style={{ fontFamily: `"${display}", Georgia, serif` }}>Aa</span>
        {" / "}
        <span style={{ fontFamily: `"${body}", system-ui, sans-serif` }}>Aa</span>
      </span>
    </div>
  );
}
