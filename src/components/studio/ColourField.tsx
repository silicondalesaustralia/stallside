"use client";

import { COLOUR_TOKENS, type ColourToken } from "@/lib/website/sections/section-style";
import { COLOUR_LABELS, colourHex, type ThemePalette } from "@/lib/website/sections/colour";

const SWATCH = "size-7 shrink-0 rounded-full border border-[var(--line)]";
const RING = "ring-2 ring-[var(--leaf)] ring-offset-2";

/** Theme colour swatches plus a custom colour picker; "none" falls back to the default. */
export default function ColourField({
  label,
  value,
  onChange,
  palette,
  noneLabel,
}: {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  palette: ThemePalette;
  noneLabel: string;
}) {
  const isToken = (COLOUR_TOKENS as readonly string[]).includes(value ?? "");
  const isCustom = Boolean(value) && !isToken;
  const description = !value ? noneLabel : isToken ? COLOUR_LABELS[value as ColourToken] : value;

  return (
    <div className="space-y-1.5">
      <p className="block text-xs font-semibold text-[var(--field)]">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          title={noneLabel}
          aria-label={noneLabel}
          aria-pressed={!value}
          className={`${SWATCH} bg-white bg-[linear-gradient(135deg,transparent_45%,#dc2626_45%,#dc2626_55%,transparent_55%)] ${!value ? RING : ""}`}
          onClick={() => onChange(undefined)}
        />
        {COLOUR_TOKENS.map((token) => (
          <button
            key={token}
            type="button"
            title={COLOUR_LABELS[token]}
            aria-label={COLOUR_LABELS[token]}
            aria-pressed={value === token}
            className={`${SWATCH} ${value === token ? RING : ""}`}
            style={{ backgroundColor: colourHex(token, palette) }}
            onClick={() => onChange(token)}
          />
        ))}
        <label title="Custom colour" className={`relative ${SWATCH} overflow-hidden ${isCustom ? RING : ""}`}>
          <span
            aria-hidden
            className="absolute inset-0 bg-[conic-gradient(#ef4444,#f59e0b,#22c55e,#3b82f6,#a855f7,#ef4444)]"
            style={isCustom ? { background: value } : undefined}
          />
          <input
            type="color"
            aria-label={`${label}: custom colour`}
            className="absolute inset-0 cursor-pointer opacity-0"
            value={isCustom ? value : "#ffffff"}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      </div>
      <p className="text-xs text-[var(--muted)]">{description}</p>
    </div>
  );
}
