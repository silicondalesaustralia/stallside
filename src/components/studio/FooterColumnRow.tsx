"use client";

import {
  FOOTER_HEADING_MAX,
  FOOTER_MAX_LINKS,
  type FooterColumn,
  type FooterLink,
} from "@/lib/studio/footer-settings";
import { newMenuId } from "@/lib/studio/header-menu";
import FooterLinkRow from "./FooterLinkRow";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";
const ICON_BTN = "rounded border border-[var(--line)] px-2 text-xs disabled:opacity-30";

/** One footer column: its heading and links. */
export default function FooterColumnRow({
  column,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  column: FooterColumn;
  index: number;
  count: number;
  onChange: (next: FooterColumn) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
}) {
  const links = column.links;
  const setLinks = (next: FooterLink[]) => onChange({ ...column, links: next });

  function moveLink(i: number, delta: -1 | 1) {
    const next = [...links];
    const [link] = next.splice(i, 1);
    if (link) next.splice(i + delta, 0, link);
    setLinks(next);
  }

  return (
    <li className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3">
      <div className="flex items-center gap-2">
        <div className="flex shrink-0 flex-col gap-0.5">
          <button type="button" className={ICON_BTN} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move column up">
            ↑
          </button>
          <button
            type="button"
            className={ICON_BTN}
            disabled={index === count - 1}
            onClick={() => onMove(1)}
            aria-label="Move column down"
          >
            ↓
          </button>
        </div>
        <input
          className={`${INPUT} font-semibold`}
          value={column.heading}
          maxLength={FOOTER_HEADING_MAX}
          aria-label="Column heading"
          placeholder="Heading (optional)"
          onChange={(e) => onChange({ ...column, heading: e.target.value })}
        />
        <button type="button" className="shrink-0 text-xs font-semibold text-red-700" onClick={onRemove}>
          Remove
        </button>
      </div>
      <ul className="space-y-2 border-l-2 border-[var(--line)] pl-3">
        {links.map((link, i) => (
          <FooterLinkRow
            key={link.id}
            link={link}
            index={i}
            count={links.length}
            onChange={(next) => setLinks(links.map((l) => (l.id === link.id ? next : l)))}
            onMove={(delta) => moveLink(i, delta)}
            onRemove={() => setLinks(links.filter((l) => l.id !== link.id))}
          />
        ))}
      </ul>
      {links.length < FOOTER_MAX_LINKS ? (
        <button
          type="button"
          className="text-xs font-semibold text-[var(--field)] underline"
          onClick={() => setLinks([...links, { id: newMenuId(), label: "New link", link: "page:home" }])}
        >
          Add a link
        </button>
      ) : null}
    </li>
  );
}
