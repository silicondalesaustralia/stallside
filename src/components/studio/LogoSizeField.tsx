"use client";

import {
  LOGO_HEIGHT_DEFAULT,
  LOGO_HEIGHT_MAX,
  LOGO_HEIGHT_MIN,
  clampLogoHeight,
} from "@/lib/storefront/header-style";

/** Header logo size slider: previews while sliding, saves when released. */
export default function LogoSizeField({
  disabled,
  height,
  onPreview,
  onCommit,
}: {
  disabled: boolean;
  height: number;
  onPreview: (height: number) => void;
  onCommit: (height: number) => void;
}) {
  const commit = () => onCommit(height);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor="header-logo-size" className="block text-xs font-semibold text-[var(--field)]">
          Logo size
        </label>
        <span className="text-xs text-[var(--muted)]">{height}px</span>
      </div>
      <input
        id="header-logo-size"
        type="range"
        className="w-full accent-[var(--field)]"
        min={LOGO_HEIGHT_MIN}
        max={LOGO_HEIGHT_MAX}
        step={2}
        value={height}
        disabled={disabled}
        onChange={(e) => {
          const next = clampLogoHeight(Number(e.target.value));
          if (next !== undefined) onPreview(next);
        }}
        onPointerUp={commit}
        onKeyUp={(e) => {
          if (/^(Arrow|Page|Home|End)/.test(e.key)) commit();
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--muted)]">
          {disabled
            ? "Upload a logo and show it in the header to resize it."
            : "Or click the logo and drag its corner. Phones show it up to 56px."}
        </p>
        {!disabled && height !== LOGO_HEIGHT_DEFAULT ? (
          <button
            type="button"
            className="shrink-0 text-xs font-semibold text-[var(--field)] underline"
            onClick={() => onCommit(LOGO_HEIGHT_DEFAULT)}
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
