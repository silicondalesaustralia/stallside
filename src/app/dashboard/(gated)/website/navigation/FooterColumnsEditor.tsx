"use client";

import Link from "next/link";
import type { NavEditorItem } from "@/lib/studio/navigation";
import {
  FOOTER_COLUMNS,
  type FooterColumnId,
} from "@/lib/studio/custom-pages";

function moveItem(list: NavEditorItem[], index: number, delta: number) {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, i) => ({ ...item, sortOrder: (i + 1) * 10 }));
}

export default function FooterColumnsEditor({
  items,
  allItems,
  onChange,
}: {
  items: NavEditorItem[];
  allItems: NavEditorItem[];
  onChange: (next: NavEditorItem[]) => void;
}) {
  const pool = allItems.filter(
    (item) =>
      (item.enabled || item.placement === "blog") && !item.showInFooter,
  );

  function updateItem(key: string, patch: Partial<NavEditorItem>) {
    onChange(allItems.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function columnItems(col: FooterColumnId) {
    return items
      .filter((i) => i.footerColumn === col)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function reorderColumn(col: FooterColumnId, nextVisible: NavEditorItem[]) {
    const reordered = nextVisible.map((item, i) => ({
      ...item,
      sortOrder: (i + 1) * 10 + (col === "shop" ? 0 : col === "visit" ? 100 : 200),
    }));
    onChange(
      allItems.map((item) => {
        const hit = reordered.find((r) => r.key === item.key);
        return hit ? { ...item, sortOrder: hit.sortOrder } : item;
      }),
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <h2 className="font-semibold text-[var(--field)]">Footer (4 columns)</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Brand is automatic. Assign links to Shop, Visit &amp; Learn, or Policies.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            Brand
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Business name, tagline, region and contact email — from Shop details.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => {
          const colItems = columnItems(col.id);
          return (
            <div
              key={col.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                {col.label}
              </p>
              {colItems.length === 0 ? (
                <p className="mt-3 text-xs text-[var(--muted)]">No links yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {colItems.map((item, index) => (
                    <li
                      key={item.key}
                      className="rounded-lg border border-[var(--line)] bg-white p-2"
                    >
                      <div className="flex items-start gap-1">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() =>
                              reorderColumn(col.id, moveItem(colItems, index, -1))
                            }
                            className="rounded border border-[var(--line)] px-1.5 text-[10px] disabled:opacity-30"
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={index === colItems.length - 1}
                            onClick={() =>
                              reorderColumn(col.id, moveItem(colItems, index, 1))
                            }
                            className="rounded border border-[var(--line)] px-1.5 text-[10px] disabled:opacity-30"
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                        </div>
                        <div className="min-w-0 flex-1">
                          <input
                            value={item.navLabel}
                            onChange={(e) =>
                              updateItem(item.key, { navLabel: e.target.value })
                            }
                            className="w-full rounded border border-[var(--line)] px-2 py-1 text-xs"
                            maxLength={40}
                          />
                          {item.editHref ? (
                            <Link
                              href={item.editHref}
                              className="mt-1 block text-[10px] text-[var(--leaf-dark)] underline"
                            >
                              Edit
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.key, { showInFooter: false })
                            }
                            className="mt-1 text-[10px] font-semibold text-[var(--gone)]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {pool.length > 0 ? (
                <select
                  className="mt-3 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-1.5 text-xs"
                  defaultValue=""
                  onChange={(e) => {
                    const key = e.target.value;
                    if (!key) return;
                    const maxOrder = colItems.reduce(
                      (m, i) => Math.max(m, i.sortOrder),
                      col.id === "shop" ? 0 : col.id === "visit" ? 100 : 200,
                    );
                    onChange(
                      allItems.map((i) =>
                        i.key === key
                          ? {
                              ...i,
                              showInFooter: true,
                              footerColumn: col.id,
                              sortOrder: maxOrder + 10,
                            }
                          : i,
                      ),
                    );
                    e.target.value = "";
                  }}
                >
                  <option value="" disabled>
                    Add link…
                  </option>
                  {pool.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.title}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
