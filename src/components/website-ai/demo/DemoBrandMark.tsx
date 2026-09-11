"use client";

import type { BlueprintBrandKit } from "@/lib/website/blueprints";
import { formatWordmark } from "@/lib/website/presets/logo-placement";

type Props = {
  businessName: string;
  logoUrl?: string | null;
  brandKit: BlueprintBrandKit;
  maxHeightPx?: number;
  align?: "left" | "center";
};

export default function DemoBrandMark({
  businessName,
  logoUrl,
  brandKit,
  maxHeightPx,
  align = "left",
}: Props) {
  const place = brandKit.logoPlacement;
  const height = maxHeightPx ?? place.maxHeightPx;
  const plate =
    place.plate === "NONE"
      ? undefined
      : {
          background: brandKit.palette.surface,
          borderRadius: place.plate === "BADGE" ? 999 : 4,
          padding: place.plate === "STICKER" ? "2px 6px" : "2px 8px",
        };

  if (logoUrl) {
    return (
      <span
        className={align === "center" ? "inline-flex justify-center" : "inline-flex"}
        style={plate}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={businessName}
          style={{ height, width: "auto", maxWidth: "40%", objectFit: "contain" }}
        />
      </span>
    );
  }

  const { lines, fontSizeScale } = formatWordmark(businessName, place.wordmark);
  const fontFamily =
    place.wordmark.font === "DISPLAY"
      ? "var(--demo-display)"
      : "var(--demo-body)";

  return (
    <span
      className={
        align === "center"
          ? "inline-flex flex-col items-center text-center"
          : "inline-flex flex-col"
      }
      style={{
        ...plate,
        fontFamily,
        letterSpacing: `${place.wordmark.trackingEm}em`,
        fontSize: `${Math.max(7, 11 * fontSizeScale)}px`,
        fontWeight: 600,
        lineHeight: 1.1,
        color: "var(--demo-text)",
      }}
    >
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}
