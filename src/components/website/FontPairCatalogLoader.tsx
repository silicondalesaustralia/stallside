"use client";

import { useEffect } from "react";
import { listFontPairs } from "@/lib/website/brand-looks";

/** Prefetch curated Google Fonts so font pickers can preview type. */
export default function FontPairCatalogLoader() {
  useEffect(() => {
    const hrefs = listFontPairs()
      .map((p) => p.googleFontsHref)
      .filter(Boolean);
    for (const href of hrefs) {
      if (document.querySelector(`link[data-vendl-font="${href}"]`)) continue;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.vendlFont = href;
      document.head.appendChild(link);
    }
  }, []);
  return null;
}
