import type { BlueprintBrandKit } from "@/lib/website/blueprints/layout-types";

export type DemoBranding =
  | { kind: "LOGO"; logoUrl: string; businessName: string }
  | { kind: "WORDMARK"; businessName: string };

export function formatWordmark(
  name: string,
  wordmark: BlueprintBrandKit["logoPlacement"]["wordmark"],
): { lines: string[]; fontSizeScale: number } {
  let text = name;
  if (wordmark.case === "UPPER") text = name.toUpperCase();
  if (wordmark.case === "LOWER") text = name.toLowerCase();

  if (text.length <= 20) return { lines: [text], fontSizeScale: 1 };
  if (text.length <= 32 && wordmark.longName === "SCALE") {
    return { lines: [text], fontSizeScale: 0.85 };
  }

  const mid = Math.floor(text.length / 2);
  const space = text.lastIndexOf(" ", mid) || text.indexOf(" ", mid);
  if (space > 0) {
    return {
      lines: [text.slice(0, space), text.slice(space + 1)],
      fontSizeScale: 0.9,
    };
  }
  return {
    lines: [text.slice(0, mid), text.slice(mid)],
    fontSizeScale: 0.85,
  };
}

export function brandKitCssVars(kit: BlueprintBrandKit): Record<string, string> {
  const p = kit.palette;
  return {
    ["--demo-bg"]: p.background,
    ["--demo-surface"]: p.surface,
    ["--demo-text"]: p.text,
    ["--demo-muted"]: p.muted,
    ["--demo-primary"]: p.primary,
    ["--demo-on-primary"]: p.onPrimary,
    ["--demo-accent"]: p.accent,
    ["--demo-on-accent"]: p.onAccent,
    ["--demo-radius"]: `${kit.shape.radiusPx}px`,
    ["--demo-display"]: `"${kit.typography.display.family}", Georgia, serif`,
    ["--demo-body"]: `"${kit.typography.body.family}", system-ui, sans-serif`,
    ["--demo-tracking"]: `${kit.typography.headingTrackingEm}em`,
  };
}
