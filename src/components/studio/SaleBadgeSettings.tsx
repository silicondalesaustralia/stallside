"use client";

import { useState } from "react";
import { paletteOf } from "@/lib/website/sections/colour";
import { BUTTON_SHAPES, siteStyleSchema } from "@/lib/storefront/site-style";
import { useStudioEditorChrome, useStudioMetadata } from "./StudioEditorContext";
import ColourField from "./ColourField";
import SiteStyleSelect from "./SiteStyleSelect";

const SHAPES = { square: "Square", rounded: "Rounded", pill: "Pill" } as const;
const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

/** The "Sale" badge shown next to the price of every on-sale product, site-wide. */
export default function SaleBadgeSettings() {
  const { siteStyle = {}, setSiteStyleField } = useStudioEditorChrome();
  const palette = paletteOf(useStudioMetadata().resolvedBranding);
  const set = setSiteStyleField ?? (() => undefined);
  const enabled = siteStyle.saleBadge !== false;
  const [text, setText] = useState(siteStyle.saleBadgeText ?? "");
  const [textError, setTextError] = useState<string | null>(null);

  function commitText(raw: string) {
    setText(raw);
    if (!raw.trim()) {
      setTextError(null);
      set("saleBadgeText", undefined);
      return;
    }
    const parsed = siteStyleSchema.shape.saleBadgeText.safeParse(raw);
    if (!parsed.success) {
      setTextError(parsed.error.issues[0]?.message ?? "Check the badge text.");
      return;
    }
    setTextError(null);
    set("saleBadgeText", parsed.data);
  }

  return (
    <div className="mt-6 space-y-3 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Sale badge</p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={(e) => set("saleBadge", e.target.checked ? undefined : false)} />
        Show a badge on sale prices
      </label>
      {enabled ? (
        <>
          <div className="space-y-1.5">
            <label htmlFor="sale-badge-text" className="block text-xs font-semibold text-[var(--field)]">Badge text</label>
            <input id="sale-badge-text" className={INPUT} value={text} maxLength={16} placeholder="Sale" onChange={(e) => commitText(e.target.value)} />
            {textError ? <p className="text-xs text-[var(--gone)]">{textError}</p> : null}
          </div>
          <ColourField label="Badge colour" value={siteStyle.saleBadgeBackground} onChange={(v) => set("saleBadgeBackground", v)} palette={palette} noneLabel="Default (red)" />
          <ColourField label="Badge text colour" value={siteStyle.saleBadgeColour} onChange={(v) => set("saleBadgeColour", v)} palette={palette} noneLabel="Default (white)" />
          <SiteStyleSelect id="sale-badge-shape" label="Badge shape" options={BUTTON_SHAPES} labels={SHAPES} value={siteStyle.saleBadgeShape} onChange={(v) => set("saleBadgeShape", v)} defaultLabel="Pill" />
        </>
      ) : null}
      <p className="text-xs text-[var(--muted)]">
        Put a product on sale by adding a &ldquo;Was price&rdquo; on its page under Products in the dashboard.
      </p>
    </div>
  );
}
