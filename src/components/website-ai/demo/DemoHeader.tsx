"use client";

import type { WebsiteBlueprint } from "@/lib/website/blueprints";
import DemoBrandMark from "./DemoBrandMark";

type Props = {
  blueprint: WebsiteBlueprint;
  businessName: string;
  logoUrl?: string | null;
  announcement?: string;
};

export default function DemoHeader({
  blueprint,
  businessName,
  logoUrl,
  announcement,
}: Props) {
  const header = blueprint.layout.header;
  const mark = (
    <DemoBrandMark
      businessName={businessName}
      logoUrl={logoUrl}
      brandKit={blueprint.brandKit}
      align={
        header === "CENTRED" || header === "STACKED" ? "center" : "left"
      }
    />
  );

  if (header === "STACKED") {
    return (
      <div className="border-b px-2 py-2 text-center" style={{ borderColor: "var(--demo-surface)" }}>
        <div className="mb-1">{mark}</div>
        <div className="mx-auto flex max-w-[90%] items-center gap-2 text-[6px]" style={{ color: "var(--demo-muted)" }}>
          <span className="h-px flex-1" style={{ background: "var(--demo-muted)" }} />
          Shop · About · Visit
          <span className="h-px flex-1" style={{ background: "var(--demo-muted)" }} />
        </div>
      </div>
    );
  }

  if (header === "BOLD_BAR") {
    return (
      <div
        className="flex items-center justify-between gap-2 px-2 py-1.5 text-[6px] font-bold uppercase"
        style={{ background: "var(--demo-primary)", color: "var(--demo-on-primary)" }}
      >
        {mark}
        <span className="truncate">Shop · About · Drops</span>
        <span className="shrink-0 px-1.5 py-0.5" style={{ background: "var(--demo-accent)", color: "var(--demo-on-accent)" }}>
          Cart 0
        </span>
      </div>
    );
  }

  if (header === "INFO_BAR") {
    return (
      <div>
        <div className="px-2 py-1 text-[6px]" style={{ background: "var(--demo-surface)", color: "var(--demo-muted)" }}>
          Open today 8am–1pm · Pickup at the stand
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 text-[6px]" style={{ borderBottom: "1px solid var(--demo-surface)" }}>
          {mark}
          <span style={{ color: "var(--demo-muted)" }}>Shop · Visit · Cart</span>
        </div>
      </div>
    );
  }

  if (header === "UTILITY_SEARCH") {
    return (
      <div style={{ borderBottom: "1px solid var(--demo-surface)" }}>
        {announcement ? (
          <div className="px-2 py-1 text-center text-[6px]" style={{ background: "var(--demo-primary)", color: "var(--demo-on-primary)" }}>
            {announcement}
          </div>
        ) : null}
        <div className="flex items-center gap-2 px-2 py-1.5">
          {mark}
          <div className="h-4 flex-1 rounded-sm text-[6px] leading-4" style={{ background: "var(--demo-surface)", color: "var(--demo-muted)", paddingLeft: 6 }}>
            Search products…
          </div>
          <span className="text-[6px]" style={{ color: "var(--demo-muted)" }}>Cart</span>
        </div>
      </div>
    );
  }

  if (header === "MINIMAL_ICON") {
    return (
      <div className="flex items-center justify-between px-2 py-1.5 text-[6px]" style={{ borderBottom: "1px solid var(--demo-surface)" }}>
        {mark}
        <span style={{ color: "var(--demo-muted)" }}>Menu · Cart</span>
      </div>
    );
  }

  if (header === "CENTRED") {
    return (
      <div>
        {announcement ? (
          <div className="px-2 py-1 text-center text-[6px]" style={{ background: "var(--demo-surface)", color: "var(--demo-muted)" }}>
            {announcement}
          </div>
        ) : null}
        <div className="grid grid-cols-3 items-center px-2 py-1.5 text-[6px]" style={{ borderBottom: "1px solid var(--demo-surface)" }}>
          <span style={{ color: "var(--demo-muted)" }}>Shop · About</span>
          <div className="flex justify-center">{mark}</div>
          <span className="text-right" style={{ color: "var(--demo-muted)" }}>Search · Cart</span>
        </div>
      </div>
    );
  }

  // CLASSIC
  return (
    <div style={{ borderBottom: "1px solid var(--demo-surface)" }}>
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-[6px]">
        {mark}
        <span className="truncate" style={{ color: "var(--demo-muted)" }}>
          Shop · Collections · About
        </span>
        <span style={{ color: "var(--demo-muted)" }}>Search · Cart</span>
      </div>
    </div>
  );
}
