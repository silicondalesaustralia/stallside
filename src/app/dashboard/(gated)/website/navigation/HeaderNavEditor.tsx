"use client";

import Link from "next/link";
import type { NavEditorItem } from "@/lib/studio/navigation";

function moveItem(list: NavEditorItem[], index: number, delta: number): NavEditorItem[] {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, i) => ({ ...item, sortOrder: (i + 1) * 10 }));
}

export default function HeaderNavEditor({
  items,
  allItems,
  onChange,
}: {
  items: NavEditorItem[];
  allItems: NavEditorItem[];
  onChange: (next: NavEditorItem[]) => void;
}) {
  const pool = allItems.filter(
    (item) => (item.placement === "blog" || item.enabled) && !item.showInNav,
  );

  function updateItem(key: string, patch: Partial<NavEditorItem>) {
    onChange(allItems.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function reorder(nextVisible: NavEditorItem[]) {
    onChange(
      allItems.map((item) => {
        const hit = nextVisible.find((r) => r.key === item.key);
        return hit ? { ...item, sortOrder: hit.sortOrder } : item;
      }),
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <h2 className="font-semibold text-[var(--field)]">Header links</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Pages and blog shown after Home and Shop. Rename labels and reorder.
      </p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">No links in this menu yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item, index) => (
            <li
              key={item.key}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3"
            >
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => reorder(moveItem(items, index, -1))}
                  className="rounded border border-[var(--line)] px-2 text-xs disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => reorder(moveItem(items, index, 1))}
                  className="rounded border border-[var(--line)] px-2 text-xs disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--field)]">{item.title}</p>
                {item.editHref ? (
                  <Link href={item.editHref} className="text-xs text-[var(--leaf-dark)] underline">
                    Edit page
                  </Link>
                ) : null}
              </div>
              <input
                value={item.navLabel}
                onChange={(e) => updateItem(item.key, { navLabel: e.target.value })}
                className="min-w-[8rem] flex-1 rounded-lg border border-[var(--line)] px-2 py-1.5 text-sm"
                maxLength={40}
              />
              <button
                type="button"
                onClick={() => updateItem(item.key, { showInNav: false })}
                className="text-sm font-semibold text-[var(--gone)]"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {pool.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-[var(--field)]">Add link</label>
          <select
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            defaultValue=""
            onChange={(e) => {
              const key = e.target.value;
              if (!key) return;
              const maxOrder = items.reduce((m, i) => Math.max(m, i.sortOrder), 0);
              onChange(
                allItems.map((i) =>
                  i.key === key
                    ? { ...i, showInNav: true, sortOrder: maxOrder + 10 }
                    : i,
                ),
              );
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              Choose a page…
            </option>
            {pool.map((item) => (
              <option key={item.key} value={item.key}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </section>
  );
}
