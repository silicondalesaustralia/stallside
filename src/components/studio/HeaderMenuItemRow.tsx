"use client";

import {
  HEADER_MENU_LABEL_MAX,
  HEADER_MENU_MAX_CHILDREN,
  newMenuId,
  type HeaderMenuChild,
  type HeaderMenuItem,
} from "@/lib/studio/header-menu";
import ButtonLinkField from "./ButtonLinkField";
import HeaderMenuChildRow from "./HeaderMenuChildRow";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";
const ICON_BTN = "rounded border border-[var(--line)] px-2 text-xs disabled:opacity-30";

/** One top-level header link: its text, where it goes, and optional dropdown links. */
export default function HeaderMenuItemRow({
  item,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  item: HeaderMenuItem;
  index: number;
  count: number;
  onChange: (next: HeaderMenuItem) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
}) {
  const children = item.children ?? [];
  const hasDropdown = children.length > 0;

  function setChildren(next: HeaderMenuChild[]) {
    if (next.length) onChange({ ...item, children: next });
    else onChange({ id: item.id, label: item.label, link: item.link ?? "page:home" });
  }

  return (
    <li className="space-y-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3">
      <div className="flex items-center gap-2">
        <div className="flex shrink-0 flex-col gap-0.5">
          <button type="button" className={ICON_BTN} disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">
            ↑
          </button>
          <button
            type="button"
            className={ICON_BTN}
            disabled={index === count - 1}
            onClick={() => onMove(1)}
            aria-label="Move down"
          >
            ↓
          </button>
        </div>
        <input
          className={INPUT}
          value={item.label}
          maxLength={HEADER_MENU_LABEL_MAX}
          aria-label="Link text"
          placeholder="Link text"
          onChange={(e) => onChange({ ...item, label: e.target.value })}
        />
        <button type="button" className="shrink-0 text-xs font-semibold text-red-700" onClick={onRemove}>
          Remove
        </button>
      </div>
      {hasDropdown ? (
        <p className="text-xs text-[var(--muted)]">
          Opens a dropdown. On phones these links are listed under “{item.label || "this heading"}”.
        </p>
      ) : (
        <ButtonLinkField
          label="Goes to"
          defaultLabel={null}
          value={item.link}
          onChange={(link) => onChange({ ...item, link: link ?? "page:home" })}
        />
      )}
      {hasDropdown ? (
        <ul className="space-y-2 pl-3">
          {children.map((child, i) => (
            <HeaderMenuChildRow
              key={child.id}
              child={child}
              onChange={(next) => setChildren(children.map((c, j) => (j === i ? next : c)))}
              onRemove={() => setChildren(children.filter((_, j) => j !== i))}
            />
          ))}
        </ul>
      ) : null}
      {children.length < HEADER_MENU_MAX_CHILDREN ? (
        <button
          type="button"
          className="text-xs font-semibold text-[var(--leaf-dark)] underline"
          onClick={() => setChildren([...children, { id: newMenuId(), label: "New link", link: "page:shop" }])}
        >
          {hasDropdown ? "+ Add dropdown link" : "+ Turn into a dropdown"}
        </button>
      ) : null}
    </li>
  );
}
