"use client";

import type { StorefrontPageId } from "@/lib/storefront/types";
import { buildAutoNavItems } from "@/lib/studio/auto-header-nav";
import {
  HEADER_MENU_MAX_ITEMS,
  newMenuId,
  seedHeaderMenu,
  type HeaderMenuItem,
} from "@/lib/studio/header-menu";
import { useStudioEditorChrome, useStudioMetadata } from "./StudioEditorContext";
import HeaderMenuItemRow from "./HeaderMenuItemRow";

const DEFAULT_PAGES: StorefrontPageId[] = ["home", "shop", "about", "contact"];

/** Build the header menu: link text, where each goes, order and dropdowns. */
export default function HeaderMenuEditor() {
  const meta = useStudioMetadata();
  const { headerMenu, setHeaderMenu, headerMenuStatus, headerMenuError } = useStudioEditorChrome();
  const autoItems = buildAutoNavItems({
    enabledPages: meta.enabledPages ?? DEFAULT_PAGES,
    storefrontSlug: meta.storefrontSlug,
    draft: true,
    basePath: meta.basePath,
    templateId: meta.templateId,
    hasMenus: meta.menus.length > 0,
    customNavPages: meta.customNavPages,
  });

  const statusLine =
    headerMenuStatus === "saving" ? (
      <p className="text-xs text-[var(--muted)]">Saving…</p>
    ) : headerMenuStatus === "saved" ? (
      <p className="text-xs text-[var(--muted)]">Menu saved to draft.</p>
    ) : headerMenuStatus === "error" ? (
      <p className="text-xs text-red-700">{headerMenuError ?? "Couldn’t save the menu. Try again."}</p>
    ) : null;

  if (!headerMenu) {
    return (
      <div className="space-y-2">
        <p className="block text-xs font-semibold text-[var(--field)]">Menu links</p>
        <p className="text-xs text-[var(--muted)]">
          Automatic: {autoItems.map((i) => i.label).join(" · ") || "no links"}. New pages are added for you.
        </p>
        <button
          type="button"
          className="rounded-lg border border-[var(--field)] px-3 py-1.5 text-xs font-semibold text-[var(--field)]"
          onClick={() => setHeaderMenu?.(seedHeaderMenu(autoItems))}
        >
          Customise menu
        </button>
        {statusLine}
      </div>
    );
  }

  const items = headerMenu.items;
  const setItems = (next: HeaderMenuItem[]) => setHeaderMenu?.({ items: next });
  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setItems(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="block text-xs font-semibold text-[var(--field)]">Menu links</p>
        <button
          type="button"
          className="text-xs font-semibold text-[var(--muted)] underline"
          onClick={() => {
            if (window.confirm("Go back to the automatic menu? Your custom links will be removed.")) {
              setHeaderMenu?.(null);
            }
          }}
        >
          Reset to automatic
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">New pages aren&apos;t added automatically while you use your own menu.</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <HeaderMenuItemRow
            key={item.id}
            item={item}
            index={index}
            count={items.length}
            onChange={(next) => setItems(items.map((it, i) => (i === index ? next : it)))}
            onMove={(delta) => move(index, delta)}
            onRemove={() => setItems(items.filter((_, i) => i !== index))}
          />
        ))}
      </ul>
      {items.length < HEADER_MENU_MAX_ITEMS ? (
        <button
          type="button"
          className="rounded-lg border border-dashed border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--field)]"
          onClick={() => setItems([...items, { id: newMenuId(), label: "New link", link: "page:shop" }])}
        >
          + Add link
        </button>
      ) : null}
      {statusLine}
    </div>
  );
}
