"use client";

import { useStudioEditorChrome } from "./StudioEditorContext";
import {
  CONTENT_WIDTHS,
  CORNERS,
  HEADER_SCROLLS,
  SECTION_DIVIDERS,
  SECTION_SPACINGS,
  SIDE_MARGINS,
} from "@/lib/storefront/site-style";
import SiteChoice from "./SiteChoice";
import SiteStyleSelect from "./SiteStyleSelect";

const WIDTHS = { narrow: "Narrow", standard: "Standard", wide: "Wide", full: "Full width" } as const;
const SPACINGS = { compact: "Compact", standard: "Standard", roomy: "Roomy", spacious: "Spacious" } as const;
const MARGINS = { tight: "Tight", standard: "Standard", wide: "Wide", extra: "Extra wide" } as const;
const CORNER_LABELS = { square: "Square", soft: "Soft", rounded: "Rounded", round: "Very round" } as const;
const HEADERS = { sticky: "Stays at the top", scroll: "Scrolls away" } as const;
const DIVIDERS = { none: "None", line: "Thin lines", alternate: "Alternate backgrounds" } as const;

/** Site-wide width, spacing, margins, corners, header behaviour and section dividers. */
export default function SiteLayoutSettings() {
  const { siteStyle = {}, setSiteStyleField } = useStudioEditorChrome();
  const set = setSiteStyleField ?? (() => undefined);

  return (
    <div className="mt-6 space-y-4 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Layout &amp; spacing</p>
      <SiteChoice
        label="Content width"
        options={CONTENT_WIDTHS}
        labels={WIDTHS}
        value={siteStyle.contentWidth ?? "standard"}
        onChange={(v) => set("contentWidth", v === "standard" ? undefined : v)}
      />
      <SiteChoice
        label="Space between sections"
        options={SECTION_SPACINGS}
        labels={SPACINGS}
        value={siteStyle.sectionSpacing ?? "standard"}
        onChange={(v) => set("sectionSpacing", v === "standard" ? undefined : v)}
      />
      <SiteChoice
        label="Side margins"
        options={SIDE_MARGINS}
        labels={MARGINS}
        value={siteStyle.sideMargins ?? "standard"}
        onChange={(v) => set("sideMargins", v === "standard" ? undefined : v)}
      />
      <SiteStyleSelect
        id="site-corners"
        label="Corners (cards & images)"
        options={CORNERS}
        labels={CORNER_LABELS}
        value={siteStyle.corners}
        onChange={(v) => set("corners", v)}
        defaultLabel="Template default"
      />
      <SiteChoice
        label="Header"
        options={HEADER_SCROLLS}
        labels={HEADERS}
        value={siteStyle.headerScroll ?? "sticky"}
        onChange={(v) => set("headerScroll", v === "sticky" ? undefined : v)}
      />
      <SiteChoice
        label="Between sections"
        options={SECTION_DIVIDERS}
        labels={DIVIDERS}
        value={siteStyle.dividers ?? "none"}
        onChange={(v) => set("dividers", v === "none" ? undefined : v)}
      />
    </div>
  );
}
