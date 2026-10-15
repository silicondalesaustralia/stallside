"use client";

import { FOOTER_LABEL_MAX, type FooterLink } from "@/lib/studio/footer-view";
import ButtonLinkField from "./ButtonLinkField";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";
const ICON_BTN = "rounded border border-[var(--line)] px-2 text-xs disabled:opacity-30";

/** One link in a footer column: its text and where it goes. */
export default function FooterLinkRow({
  link,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  link: FooterLink;
  index: number;
  count: number;
  onChange: (next: FooterLink) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <li className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex shrink-0 gap-0.5">
          <button type="button" className={ICON_BTN} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move link up">
            ↑
          </button>
          <button
            type="button"
            className={ICON_BTN}
            disabled={index === count - 1}
            onClick={() => onMove(1)}
            aria-label="Move link down"
          >
            ↓
          </button>
        </div>
        <input
          className={INPUT}
          value={link.label}
          maxLength={FOOTER_LABEL_MAX}
          aria-label="Link text"
          placeholder="Link text"
          onChange={(e) => onChange({ ...link, label: e.target.value })}
        />
        <button type="button" className="shrink-0 text-xs font-semibold text-red-700" onClick={onRemove}>
          Remove
        </button>
      </div>
      <ButtonLinkField
        label="Goes to"
        defaultLabel={null}
        value={link.link}
        onChange={(value) => onChange({ ...link, link: value ?? "page:home" })}
      />
    </li>
  );
}
