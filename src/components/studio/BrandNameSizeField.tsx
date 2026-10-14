"use client";

import {
  BRAND_NAME_SIZE_DEFAULT,
  BRAND_NAME_SIZE_MAX,
  BRAND_NAME_SIZE_MIN,
  clampBrandNameSize,
} from "@/lib/storefront/header-style";
import { useStudioEditorChrome } from "./StudioEditorContext";

/** Text size for the business name beside (or instead of) the header logo. */
export default function BrandNameSizeField({ disabled }: { disabled?: boolean }) {
  const { brandNameSize, setBrandNameSize, brandNameSizeStatus, brandNameSizeError } = useStudioEditorChrome();
  const size = brandNameSize ?? BRAND_NAME_SIZE_DEFAULT;

  return (
    <div className={`space-y-1.5 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between">
        <label htmlFor="header-brand-name-size" className="block text-xs font-semibold text-[var(--field)]">
          Name text size
        </label>
        <span className="text-xs text-[var(--muted)]">{brandNameSize ? `${size}px` : "Template default"}</span>
      </div>
      <input
        id="header-brand-name-size"
        type="range"
        className="w-full accent-[var(--field)]"
        min={BRAND_NAME_SIZE_MIN}
        max={BRAND_NAME_SIZE_MAX}
        step={1}
        value={size}
        disabled={disabled}
        onChange={(e) => {
          const next = clampBrandNameSize(Number(e.target.value));
          if (next !== undefined) setBrandNameSize?.(next);
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--muted)]">
          {disabled
            ? "The name is hidden (logo only)."
            : brandNameSizeStatus === "saving"
              ? "Saving…"
              : brandNameSizeStatus === "saved"
                ? "Saved to your draft."
                : "Phones show it at up to 24px so long names fit."}
        </p>
        {brandNameSize && !disabled ? (
          <button
            type="button"
            className="shrink-0 text-xs font-semibold text-[var(--field)] underline"
            onClick={() => setBrandNameSize?.(null)}
          >
            Reset
          </button>
        ) : null}
      </div>
      {brandNameSizeStatus === "error" ? (
        <p className="text-xs text-red-700">{brandNameSizeError ?? "Couldn't save. Try again."}</p>
      ) : null}
    </div>
  );
}
