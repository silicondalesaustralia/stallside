"use client";

import { useStudioMetadata, useStudioEditorChrome } from "./StudioEditorContext";
import {
  BRAND_MARK_LABELS,
  BRAND_MARK_MODES,
  HEADER_LAYOUT_LABELS,
  HEADER_LAYOUTS,
  type BrandMarkMode,
  type HeaderLayout,
} from "@/lib/storefront/header-style";

export default function HeaderStyleSettings() {
  const {
    headerLayout = "classic",
    brandMark = "logo-and-name",
    setHeaderStyle,
    headerStyleStatus,
    setChromeTarget,
  } = useStudioEditorChrome();
  const hasLogo = Boolean(useStudioMetadata().resolvedBranding.logoUrl);

  return (
    <aside className="vendl-studio-settings" role="complementary" aria-label="Header settings">
      <div className="vendl-studio-settings__head flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[var(--field)]">Header</h2>
        <button
          type="button"
          className="text-xs font-semibold text-[var(--muted)]"
          onClick={() => setChromeTarget?.(null)}
        >
          Done
        </button>
      </div>
      <div className="vendl-studio-settings__body space-y-4">
        <div className="space-y-1.5">
          <p className="block text-xs font-semibold text-[var(--field)]">Layout</p>
          <div className="grid grid-cols-2 gap-2">
            {HEADER_LAYOUTS.map((id) => (
              <button
                key={id}
                type="button"
                className={`rounded-lg border px-2 py-2 text-left text-xs font-semibold ${
                  headerLayout === id
                    ? "border-[var(--field)] bg-[var(--wash)] text-[var(--field)]"
                    : "border-[var(--line)] text-[var(--muted)]"
                }`}
                onClick={() => setHeaderStyle?.({ headerLayout: id as HeaderLayout })}
              >
                {HEADER_LAYOUT_LABELS[id]}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="block text-xs font-semibold text-[var(--field)]">Brand mark</p>
          {BRAND_MARK_MODES.map((id) => (
            <label key={id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="brandMark"
                checked={brandMark === id}
                disabled={id === "logo-only" && !hasLogo}
                onChange={() => setHeaderStyle?.({ brandMark: id as BrandMarkMode })}
              />
              {BRAND_MARK_LABELS[id]}
              {id === "logo-only" && !hasLogo ? (
                <span className="text-xs text-[var(--muted)]">(upload a logo first)</span>
              ) : null}
            </label>
          ))}
        </div>
        {headerStyleStatus === "saving" ? (
          <p className="text-xs text-[var(--muted)]">Saving…</p>
        ) : null}
        {headerStyleStatus === "saved" ? (
          <p className="text-xs text-[var(--muted)]">Header style saved.</p>
        ) : null}
        {headerStyleStatus === "error" ? (
          <p className="text-xs text-red-700">Couldn’t save. Try again.</p>
        ) : null}
      </div>
    </aside>
  );
}
