"use client";

import type { CSSProperties } from "react";
import type { WebsiteBlueprint } from "@/lib/website/blueprints";
import type { DemoKit } from "@/lib/website/demo-kits";
import { brandKitCssVars } from "@/lib/website/presets/logo-placement";
import DemoHeader from "./demo/DemoHeader";
import DemoHero from "./demo/DemoHero";
import DemoMerch from "./demo/DemoMerch";

type Props = {
  blueprint: WebsiteBlueprint;
  kit: DemoKit;
  businessName?: string;
  logoUrl?: string | null;
  expanded?: boolean;
};

export default function BlueprintHomepagePreview({
  blueprint,
  kit,
  businessName,
  logoUrl,
  expanded = false,
}: Props) {
  const name = businessName?.trim() || kit.placeholderName;
  const vars = brandKitCssVars(blueprint.brandKit) as CSSProperties;

  return (
    <div
      className={
        expanded
          ? "mx-auto w-full max-w-3xl overflow-hidden rounded-lg border border-black/10 shadow-lg"
          : "pointer-events-none h-full w-full overflow-hidden"
      }
      style={{
        ...vars,
        background: "var(--demo-bg)",
        color: "var(--demo-text)",
        fontFamily: "var(--demo-body)",
      }}
    >
      <DemoHeader
        blueprint={blueprint}
        businessName={name}
        logoUrl={logoUrl}
        announcement={
          blueprint.layout.header === "UTILITY_SEARCH" ||
          blueprint.id === "boutique"
            ? kit.copy.announcement
            : undefined
        }
      />
      <DemoHero
        blueprint={blueprint}
        kit={kit}
        businessName={name}
        expanded={expanded}
      />
      <DemoMerch
        blueprint={blueprint}
        kit={kit}
        businessName={name}
        expanded={expanded}
      />
      <div
        className="px-2 py-2 text-center text-[7px]"
        style={{ background: "var(--demo-text)", color: "var(--demo-bg)" }}
      >
        {name}
      </div>
    </div>
  );
}
