"use client";

import { HEADER_MENU_LABEL_MAX, type HeaderMenuChild } from "@/lib/studio/header-menu";
import ButtonLinkField from "./ButtonLinkField";

const INPUT = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

/** One link inside a header dropdown. */
export default function HeaderMenuChildRow({
  child,
  onChange,
  onRemove,
}: {
  child: HeaderMenuChild;
  onChange: (next: HeaderMenuChild) => void;
  onRemove: () => void;
}) {
  return (
    <li className="space-y-2 rounded-lg border border-[var(--line)] bg-white p-2">
      <div className="flex items-center gap-2">
        <input
          className={INPUT}
          value={child.label}
          maxLength={HEADER_MENU_LABEL_MAX}
          aria-label="Dropdown link text"
          placeholder="Link text"
          onChange={(e) => onChange({ ...child, label: e.target.value })}
        />
        <button type="button" className="shrink-0 text-xs font-semibold text-red-700" onClick={onRemove}>
          Remove
        </button>
      </div>
      <ButtonLinkField
        label="Goes to"
        defaultLabel={null}
        value={child.link}
        onChange={(link) => onChange({ ...child, link: link ?? "page:home" })}
      />
    </li>
  );
}
