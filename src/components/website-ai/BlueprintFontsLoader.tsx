"use client";

import { BLUEPRINT_FONT_PAIRS } from "@/lib/website/blueprints/font-pairs";

/** Preload Google Fonts for starting-style brand kits in the style gallery. */
export default function BlueprintFontsLoader() {
  return (
    <>
      {BLUEPRINT_FONT_PAIRS.map((pair) =>
        pair.googleFontsHref ? (
          <link key={pair.id} rel="stylesheet" href={pair.googleFontsHref} />
        ) : null,
      )}
    </>
  );
}
