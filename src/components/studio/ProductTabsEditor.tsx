"use client";

import { WEBSITE_LIMITS } from "@/lib/website/schema/limits";
import { newMenuId } from "@/lib/studio/header-menu";
import {
  PRODUCT_TABS_MAX,
  PRODUCT_TAB_TITLE_MAX,
  parseProductTabs,
  type ProductTab,
} from "@/lib/studio/product-detail-settings";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";
const ICON_BTN = "rounded border border-[var(--line)] px-2 text-xs disabled:opacity-30";

/** Collapsible info tabs shown on every product page (Ingredients, Storage…). */
export default function ProductTabsEditor({ value, onChange }: { value: unknown; onChange: (tabs: ProductTab[]) => void }) {
  const tabs = parseProductTabs(value);
  const update = (id: string, patch: Partial<ProductTab>) => onChange(tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  function move(i: number, delta: -1 | 1) {
    const next = [...tabs];
    const [tab] = next.splice(i, 1);
    if (tab) next.splice(i + delta, 0, tab);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[var(--field)]">Info tabs</p>
      <p className="text-xs text-[var(--muted)]">Collapsible sections under the details, the same on every product page.</p>
      {tabs.map((tab, i) => (
        <div key={tab.id} className="space-y-2 rounded-lg border border-[var(--line)] bg-[var(--cream,#fafaf7)] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-[var(--field)]">Tab {i + 1}</p>
            <div className="flex gap-1">
              <button type="button" className={ICON_BTN} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move tab up">↑</button>
              <button type="button" className={ICON_BTN} disabled={i === tabs.length - 1} onClick={() => move(i, 1)} aria-label="Move tab down">↓</button>
              <button type="button" className="px-1 text-xs font-semibold text-red-700" onClick={() => onChange(tabs.filter((t) => t.id !== tab.id))}>
                Remove
              </button>
            </div>
          </div>
          <input
            className={INPUT}
            maxLength={PRODUCT_TAB_TITLE_MAX}
            aria-label={`Tab ${i + 1} title`}
            placeholder="Title, e.g. Storage"
            value={tab.title}
            onChange={(e) => update(tab.id, { title: e.target.value })}
          />
          <textarea
            className={INPUT}
            rows={3}
            maxLength={WEBSITE_LIMITS.bodyChars}
            aria-label={`Tab ${i + 1} text`}
            placeholder="e.g. Keep refrigerated. Best within 3 weeks."
            value={tab.body}
            onChange={(e) => update(tab.id, { body: e.target.value })}
          />
        </div>
      ))}
      {tabs.length < PRODUCT_TABS_MAX ? (
        <button
          type="button"
          className="w-full rounded-lg border border-dashed border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--field)]"
          onClick={() => onChange([...tabs, { id: newMenuId(), title: "", body: "" }])}
        >
          + Add tab
        </button>
      ) : null}
    </div>
  );
}
