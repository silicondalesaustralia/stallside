"use client";

import {
  NAV_TEXT_SIZE_DEFAULT,
  NAV_TEXT_SIZE_MAX,
  NAV_TEXT_SIZE_MIN,
  clampNavTextSize,
} from "@/lib/storefront/header-style";
import { useStudioEditorChrome } from "./StudioEditorContext";

/** Text size for header menu links (desktop, dropdowns and the phone menu). */
export default function NavTextSizeField() {
  const { navTextSize, setNavTextSize, navTextSizeStatus, navTextSizeError } = useStudioEditorChrome();
  const size = navTextSize ?? NAV_TEXT_SIZE_DEFAULT;

  return (
    <div className="mb-4 space-y-1.5 border-b border-[var(--line)] pb-4">
      <div className="flex items-center justify-between">
        <label htmlFor="header-nav-text-size" className="block text-xs font-semibold text-[var(--field)]">
          Menu text size
        </label>
        <span className="text-xs text-[var(--muted)]">{size}px</span>
      </div>
      <input
        id="header-nav-text-size"
        type="range"
        className="w-full accent-[var(--field)]"
        min={NAV_TEXT_SIZE_MIN}
        max={NAV_TEXT_SIZE_MAX}
        step={1}
        value={size}
        onChange={(e) => {
          const next = clampNavTextSize(Number(e.target.value));
          if (next !== undefined) setNavTextSize?.(next === NAV_TEXT_SIZE_DEFAULT ? null : next);
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--muted)]">
          {navTextSizeStatus === "saving"
            ? "Saving…"
            : navTextSizeStatus === "saved"
              ? "Saved to your draft."
              : "Menu links, dropdowns and the phone menu."}
        </p>
        {navTextSize ? (
          <button
            type="button"
            className="shrink-0 text-xs font-semibold text-[var(--field)] underline"
            onClick={() => setNavTextSize?.(null)}
          >
            Reset
          </button>
        ) : null}
      </div>
      {navTextSizeStatus === "error" ? (
        <p className="text-xs text-red-700">{navTextSizeError ?? "Couldn't save. Try again."}</p>
      ) : null}
    </div>
  );
}
