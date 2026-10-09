"use client";

import { useEditor } from "@craftjs/core";
import { useStudioMetadata, useStudioEditorChrome } from "./StudioEditorContext";
import { paletteOf } from "@/lib/website/sections/colour";
import ColourField from "./ColourField";

/** Background behind the sections: this page's own colour, and the default for every page. */
export default function PageStyleSettings() {
  const metadata = useStudioMetadata();
  const palette = paletteOf(metadata.resolvedBranding);
  const { sitePageBackground, setSitePageBackground, sitePageBackgroundStatus, sitePageBackgroundError } =
    useStudioEditorChrome();
  const { actions, canvasId, background } = useEditor((state) => {
    const childId = state.nodes.ROOT?.data.nodes.find((id) => {
      const node = state.nodes[id];
      return node?.data.displayName === "CraftPageRoot" || node?.data.isCanvas;
    });
    const id = childId ?? "ROOT";
    const bg = (state.nodes[id]?.data.props as Record<string, unknown> | undefined)?.background;
    return { canvasId: id, background: typeof bg === "string" ? bg : undefined };
  });

  function setPageBackground(value: string | undefined) {
    actions.setProp(canvasId, (props: Record<string, unknown>) => {
      if (value) props.background = value;
      else delete props.background;
    });
  }

  return (
    <div className="mt-6 space-y-4 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Page background</p>
      <ColourField
        label="This page"
        value={background}
        onChange={setPageBackground}
        palette={palette}
        noneLabel="Same as all pages"
      />
      <ColourField
        label="All pages"
        value={sitePageBackground ?? undefined}
        onChange={(value) => setSitePageBackground?.(value ?? null)}
        palette={palette}
        noneLabel="Template default"
      />
      {sitePageBackgroundStatus === "saving" ? <p className="text-xs text-[var(--muted)]">Saving…</p> : null}
      {sitePageBackgroundStatus === "saved" ? (
        <p className="text-xs text-[var(--muted)]">Saved to your draft. Goes live when you publish.</p>
      ) : null}
      {sitePageBackgroundStatus === "error" ? (
        <p className="text-xs text-red-700">{sitePageBackgroundError ?? "Couldn't save. Try again."}</p>
      ) : null}
    </div>
  );
}
