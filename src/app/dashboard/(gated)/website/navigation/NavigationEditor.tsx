"use client";

import { useMemo, useState, useTransition } from "react";
import type { NavEditorItem } from "@/lib/studio/navigation";
import {
  footerNavItems,
  headerNavItems,
  layoutFromEditorItems,
} from "@/lib/studio/navigation";
import { saveNavigationLayout } from "./actions";
import FooterColumnsEditor from "./FooterColumnsEditor";
import HeaderNavEditor from "./HeaderNavEditor";

export default function NavigationEditor({
  initialItems,
  hasMenus,
  customHeaderMenu,
  customFooterColumns,
}: {
  initialItems: NavEditorItem[];
  hasMenus: boolean;
  customHeaderMenu: boolean;
  customFooterColumns: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [pending, startTransition] = useTransition();
  const headerItems = useMemo(() => headerNavItems(items), [items]);
  const footerItems = useMemo(() => footerNavItems(items), [items]);

  return (
    <div className="flex flex-col gap-6">
      {customHeaderMenu ? (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--field)]">
          <p className="font-semibold">Your header uses a custom menu</p>
          <p className="mt-1 text-[var(--muted)]">
            It&apos;s built in the website builder (click the header, then Menu links). The header settings
            below only apply if you reset it to automatic.
          </p>
        </section>
      ) : null}
      {customFooterColumns ? (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--wash)] p-4 text-sm text-[var(--field)]">
          <p className="font-semibold">Your footer uses custom link columns</p>
          <p className="mt-1 text-[var(--muted)]">
            They&apos;re built in the website builder (click the footer, then Link columns). The footer settings
            below only apply if you go back to automatic columns.
          </p>
        </section>
      ) : null}
      <section className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">
        <p className="font-semibold text-[var(--field)]">Always shown first in the header</p>
        <p className="mt-1">
          Home · Shop{hasMenus ? " · Menus" : ""} — fixed order, not editable here.
        </p>
      </section>

      <HeaderNavEditor items={headerItems} allItems={items} onChange={setItems} />
      <FooterColumnsEditor
        items={footerItems}
        allItems={items}
        onChange={setItems}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            const payload = layoutFromEditorItems(items);
            startTransition(async () => {
              await saveNavigationLayout(JSON.stringify(payload));
            });
          }}
          className="rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save navigation"}
        </button>
      </div>
    </div>
  );
}
