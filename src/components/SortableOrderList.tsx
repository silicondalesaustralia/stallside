"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type SortableItem = { id: string; label: string; detail?: string; href?: string };

type SaveResult = { ok: true } | { error: string };

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, item);
  return next;
}

const arrowClass =
  "flex size-8 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-sm font-bold disabled:opacity-30";

export default function SortableOrderList({
  items: initial,
  onSave,
  emptyText = "Nothing to arrange yet.",
}: {
  items: SortableItem[];
  onSave: (ids: string[]) => Promise<SaveResult>;
  emptyText?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = items.some((item, i) => item.id !== initial[i]?.id);

  function moveTo(from: number, to: number) {
    if (to === from) return;
    setMessage(null);
    setItems((list) => move(list, from, to));
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await onSave(items.map((i) => i.id));
      if ("error" in result) {
        setMessage(result.error);
        return;
      }
      setMessage("Order saved.");
      router.refresh();
    });
  }

  if (items.length === 0) {
    return <p className="text-sm text-[var(--muted)]">{emptyText}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col divide-y divide-[var(--line)] rounded-xl border border-[var(--line)] bg-white">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center gap-3 px-3 py-2">
            <input
              key={`${item.id}-${index}`}
              type="number"
              min={1}
              max={items.length}
              defaultValue={index + 1}
              aria-label={`Position of ${item.label}`}
              onBlur={(e) => moveTo(index, Number(e.target.value) - 1)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              className="w-14 rounded-lg border border-[var(--line)] px-2 py-1 text-center text-sm tabular-nums"
            />
            <div className="min-w-0 flex-1">
              {item.href ? (
                <Link href={item.href} className="block truncate font-semibold hover:underline">
                  {item.label}
                </Link>
              ) : (
                <p className="truncate font-semibold">{item.label}</p>
              )}
              {item.detail ? (
                <p className="truncate text-xs text-[var(--muted)]">{item.detail}</p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label={`Move ${item.label} up`}
              disabled={index === 0}
              onClick={() => moveTo(index, index - 1)}
              className={arrowClass}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`Move ${item.label} down`}
              disabled={index === items.length - 1}
              onClick={() => moveTo(index, index + 1)}
              className={arrowClass}
            >
              ↓
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save order"}
        </button>
        <p className="text-sm text-[var(--muted)]">
          {message ?? (dirty ? "Unsaved changes." : "Use the arrows or type a position.")}
        </p>
      </div>
    </div>
  );
}
