"use client";

import { newMenuId } from "@/lib/studio/header-menu";
import {
  INFO_ROWS_MAX,
  INFO_ROW_ICONS,
  INFO_ROW_TEXT_MAX,
  parseInfoRows,
  type InfoRow,
  type InfoRowIcon,
} from "@/lib/studio/product-detail-settings";

const INPUT = "rounded-lg border border-[var(--line)] bg-white px-2 py-1.5 text-sm";
const ICONS: Record<InfoRowIcon, string> = {
  pickup: "Pickup",
  delivery: "Delivery",
  secure: "Secure",
  fresh: "Fresh",
  local: "Local",
  info: "Info",
};

/** Short lines under Add to cart, each with an icon. */
export default function ProductInfoRowsEditor({ value, onChange }: { value: unknown; onChange: (rows: InfoRow[]) => void }) {
  const rows = parseInfoRows(value);
  const update = (id: string, patch: Partial<InfoRow>) => onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[var(--field)]">Info under Add to cart</p>
      {rows.map((row, i) => (
        <div key={row.id} className="flex items-center gap-1.5">
          <select aria-label={`Icon ${i + 1}`} className={INPUT} value={row.icon} onChange={(e) => update(row.id, { icon: e.target.value as InfoRowIcon })}>
            {INFO_ROW_ICONS.map((icon) => (
              <option key={icon} value={icon}>{ICONS[icon]}</option>
            ))}
          </select>
          <input
            aria-label={`Info line ${i + 1}`}
            className={`${INPUT} min-w-0 flex-1`}
            maxLength={INFO_ROW_TEXT_MAX}
            placeholder="e.g. Pickup Saturdays at the farm gate"
            value={row.text}
            onChange={(e) => update(row.id, { text: e.target.value })}
          />
          <button type="button" aria-label={`Remove info line ${i + 1}`} className="px-1 text-xs font-semibold text-red-700" onClick={() => onChange(rows.filter((r) => r.id !== row.id))}>
            ✕
          </button>
        </div>
      ))}
      {rows.length < INFO_ROWS_MAX ? (
        <button
          type="button"
          className="w-full rounded-lg border border-dashed border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--field)]"
          onClick={() => onChange([...rows, { id: newMenuId(), icon: "info", text: "" }])}
        >
          + Add info line
        </button>
      ) : null}
    </div>
  );
}
