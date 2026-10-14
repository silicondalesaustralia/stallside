"use client";

import type { ThemePalette } from "@/lib/website/sections/colour";
import type { ElementStyle, ElementStyles } from "@/lib/website/sections/element-style";
import type { SectionElementDef } from "@/lib/website/sections/section-elements";
import ElementStyleFields from "./ElementStyleFields";

/** One collapsible block per element (price, bullet points…) with its own look. */
export default function SectionElementStyles({
  elements,
  value,
  onChange,
  palette,
}: {
  elements: SectionElementDef[];
  value: ElementStyles | undefined;
  onChange: (next: ElementStyles | undefined) => void;
  palette: ThemePalette;
}) {
  function setElement(id: string, next: ElementStyle) {
    const all: ElementStyles = { ...value };
    if (Object.keys(next).length) all[id] = next;
    else delete all[id];
    onChange(Object.keys(all).length ? all : undefined);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--muted)]">Leave a setting on Default to keep the section&apos;s own look.</p>
      {elements.map((el) => {
        const style = value?.[el.id] ?? {};
        const changed = Object.keys(style).length > 0;
        return (
          <details key={el.id} className="rounded-lg border border-[var(--line)] px-3 py-2">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--field)]">
              {el.label}
              {changed ? <span className="ml-2 text-xs font-normal text-[var(--muted)]">Customised</span> : null}
            </summary>
            <div className="mt-3 space-y-3">
              <ElementStyleFields id={`el-${el.id}`} value={style} onChange={(next) => setElement(el.id, next)} palette={palette} />
              {changed ? (
                <button type="button" className="text-xs font-semibold text-[var(--muted)] underline" onClick={() => setElement(el.id, {})}>
                  Reset {el.label.toLowerCase()}
                </button>
              ) : null}
            </div>
          </details>
        );
      })}
    </div>
  );
}
