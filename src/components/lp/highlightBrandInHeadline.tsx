import type { ReactNode } from "react";

/** Brand phrases highlighted in marigold (icon yellow) inside LP / product heroes. */
const BRAND_PHRASES = [
  "Vendl Pre-Orders",
  "Vendl Pre-orders",
  "Vendl Stall",
  "Vendl",
] as const;

export function highlightBrandInHeadline(headline: string): ReactNode {
  for (const phrase of BRAND_PHRASES) {
    const idx = headline.indexOf(phrase);
    if (idx === -1) continue;
    const before = headline.slice(0, idx);
    const after = headline.slice(idx + phrase.length);
    return (
      <>
        {before}
        <span className="text-[var(--marigold)]">{phrase}</span>
        {after ? highlightBrandInHeadline(after) : null}
      </>
    );
  }
  return headline;
}
