"use client";

import { useStudioEditorChrome } from "./StudioEditorContext";
import {
  CONTENT_WIDTHS,
  SECTION_SPACINGS,
  type ContentWidth,
  type SectionSpacing,
} from "@/lib/storefront/site-style";

const WIDTH_LABELS: Record<ContentWidth, string> = {
  narrow: "Narrow",
  standard: "Standard",
  wide: "Wide",
  full: "Full width",
};
const SPACING_LABELS: Record<SectionSpacing, string> = {
  compact: "Compact",
  standard: "Standard",
  roomy: "Roomy",
  spacious: "Spacious",
};

function Choice<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="block text-xs font-semibold text-[var(--field)]">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((id) => (
          <button
            key={id}
            type="button"
            className={`rounded-lg border px-2 py-2 text-left text-xs font-semibold ${
              value === id
                ? "border-[var(--field)] bg-[var(--wash)] text-[var(--field)]"
                : "border-[var(--line)] text-[var(--muted)]"
            }`}
            onClick={() => onChange(id)}
          >
            {labels[id]}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Site-wide content width and space between sections. "Standard" = the template's own. */
export default function SiteLayoutSettings() {
  const { siteStyle = {}, setSiteStyleField, siteStyleStatus, siteStyleError } = useStudioEditorChrome();
  const set = setSiteStyleField ?? (() => undefined);

  return (
    <div className="mt-6 space-y-4 border-t border-[var(--line)] pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Layout &amp; spacing</p>
      <Choice
        label="Content width"
        options={CONTENT_WIDTHS}
        labels={WIDTH_LABELS}
        value={siteStyle.contentWidth ?? "standard"}
        onChange={(v) => set("contentWidth", v === "standard" ? undefined : v)}
      />
      <Choice
        label="Space between sections"
        options={SECTION_SPACINGS}
        labels={SPACING_LABELS}
        value={siteStyle.sectionSpacing ?? "standard"}
        onChange={(v) => set("sectionSpacing", v === "standard" ? undefined : v)}
      />
      {siteStyleStatus === "saving" ? <p className="text-xs text-[var(--muted)]">Saving…</p> : null}
      {siteStyleStatus === "saved" ? (
        <p className="text-xs text-[var(--muted)]">Saved to your draft. Goes live when you publish.</p>
      ) : null}
      {siteStyleStatus === "error" ? (
        <p className="text-xs text-red-700">{siteStyleError ?? "Couldn't save. Try again."}</p>
      ) : null}
    </div>
  );
}
