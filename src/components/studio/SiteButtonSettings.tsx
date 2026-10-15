"use client";

import { useEditor } from "@craftjs/core";
import { useStudioMetadata, useStudioEditorChrome } from "./StudioEditorContext";
import { hasLowContrast, paletteOf } from "@/lib/website/sections/colour";
import ColourField from "./ColourField";

function hasOwnButtonColour(style: unknown): boolean {
  if (!style || typeof style !== "object") return false;
  const s = style as Record<string, unknown>;
  return Boolean(s.buttonColour || s.buttonTextColour);
}

/** One colour for every main button on the site, including add to cart, cart and checkout. */
export default function SiteButtonSettings() {
  const metadata = useStudioMetadata();
  const palette = paletteOf(metadata.resolvedBranding);
  const { siteButtonColours, setSiteButtonColours, siteButtonColoursStatus, siteButtonColoursError } =
    useStudioEditorChrome();
  const { actions, overrideIds } = useEditor((state) => ({
    overrideIds: Object.keys(state.nodes).filter((id) =>
      hasOwnButtonColour((state.nodes[id]?.data.props as Record<string, unknown> | undefined)?.style),
    ),
  }));
  const colours = siteButtonColours ?? { background: null, text: null };
  const lowContrast =
    Boolean(colours.background || colours.text) &&
    hasLowContrast({ background: colours.background ?? "accent", textColour: colours.text ?? undefined }, palette);

  function clearSectionColours() {
    for (const id of overrideIds) {
      actions.setProp(id, (props: Record<string, unknown>) => {
        if (!props.style || typeof props.style !== "object") return;
        const next = { ...(props.style as Record<string, unknown>) };
        delete next.buttonColour;
        delete next.buttonTextColour;
        props.style = next;
      });
    }
  }

  return (
    <div className="mt-6 space-y-4 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Buttons (whole site)</p>
      <ColourField
        label="Button colour"
        value={colours.background ?? undefined}
        onChange={(background) => setSiteButtonColours?.({ ...colours, background: background ?? null })}
        palette={palette}
        noneLabel="Template default: the colour your template uses for buttons"
        noneChip={{ text: "Template default" }}
      />
      <ColourField
        label="Button text colour"
        value={colours.text ?? undefined}
        onChange={(text) => setSiteButtonColours?.({ ...colours, text: text ?? null })}
        palette={palette}
        noneLabel="Auto (readable on the button)"
        noneChip={{ text: "Auto" }}
      />
      {lowContrast ? (
        <p className="text-xs text-red-700">The button text may be hard to read. Try Auto text colour.</p>
      ) : null}
      <p className="text-xs text-[var(--muted)]">
        Used by section buttons, add to cart, the cart and checkout. A section&apos;s own button colour still wins.
      </p>
      {overrideIds.length > 0 ? (
        <button
          type="button"
          className="text-left text-xs font-semibold text-[var(--field)] underline"
          onClick={clearSectionColours}
        >
          Clear button colours set on {overrideIds.length === 1 ? "1 section" : `${overrideIds.length} sections`} on
          this page
        </button>
      ) : null}
      {siteButtonColoursStatus === "saving" ? <p className="text-xs text-[var(--muted)]">Saving…</p> : null}
      {siteButtonColoursStatus === "saved" ? (
        <p className="text-xs text-[var(--muted)]">Saved to your draft. Goes live when you publish.</p>
      ) : null}
      {siteButtonColoursStatus === "error" ? (
        <p className="text-xs text-red-700">{siteButtonColoursError ?? "Couldn't save. Try again."}</p>
      ) : null}
    </div>
  );
}
