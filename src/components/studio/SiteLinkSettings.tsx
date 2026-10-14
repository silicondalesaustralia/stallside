"use client";

import { useStudioMetadata, useStudioEditorChrome } from "./StudioEditorContext";
import { paletteOf } from "@/lib/website/sections/colour";
import ColourField from "./ColourField";

/** One colour for text links in page content on every page (header and footer have their own). */
export default function SiteLinkSettings() {
  const palette = paletteOf(useStudioMetadata().resolvedBranding);
  const { siteLinkColour, setSiteLinkColour, siteLinkColourStatus, siteLinkColourError } = useStudioEditorChrome();

  return (
    <div className="mt-6 space-y-4 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Links (whole site)</p>
      <ColourField
        label="Link colour"
        value={siteLinkColour ?? undefined}
        onChange={(value) => setSiteLinkColour?.(value ?? null)}
        palette={palette}
        noneLabel="Template default"
      />
      <p className="text-xs text-[var(--muted)]">
        Links in text, blog posts, the cart and shop pages. Header and footer links have their own settings.
      </p>
      {siteLinkColourStatus === "saving" ? <p className="text-xs text-[var(--muted)]">Saving…</p> : null}
      {siteLinkColourStatus === "saved" ? (
        <p className="text-xs text-[var(--muted)]">Saved to your draft. Goes live when you publish.</p>
      ) : null}
      {siteLinkColourStatus === "error" ? (
        <p className="text-xs text-red-700">{siteLinkColourError ?? "Couldn't save. Try again."}</p>
      ) : null}
    </div>
  );
}
