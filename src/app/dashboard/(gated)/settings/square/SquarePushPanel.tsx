"use client";

import { useState, useTransition } from "react";
import { formatMoney } from "@/lib/money";
import { pushProductsToSquareAction } from "./push-actions";
import { useActionStatus } from "./use-action-status";
import ActionStatusText from "./ActionStatusText";

export type PushCandidate = {
  id: string;
  name: string;
  priceCents: number;
  stockQuantity: number;
  standName: string;
};

export default function SquarePushPanel({
  candidates,
  currency,
  stockWillSync,
  otherCurrencyCount,
}: {
  candidates: PushCandidate[];
  currency: string;
  stockWillSync: boolean;
  otherCurrencyCount: number;
}) {
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(candidates.map((c) => c.id)),
  );
  const { status, report, fail } = useActionStatus();
  const showStand = new Set(candidates.map((c) => c.standName)).size > 1;

  const currencyNote =
    otherCurrencyCount > 0
      ? `${otherCurrencyCount} product${otherCurrencyCount === 1 ? " is" : "s are"} priced in another currency and can't be added - your Square account only accepts ${currency} prices.`
      : null;

  if (candidates.length === 0) {
    return (
      <p className="text-[var(--muted)]">
        Every active {currency} product is already linked to Square.
        {currencyNote ? ` ${currencyNote}` : ""}
      </p>
    );
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allOn = selected.size === candidates.length;

  return (
    <div className="space-y-3">
      <p className="text-[var(--muted)]">
        Create these Vendl products as Square items and link them.
        {stockWillSync
          ? " Square stock at your primary location is set to Vendl's count."
          : " Turn on POS inventory sync to also copy stock counts."}
        {currencyNote ? ` ${currencyNote}` : ""}
      </p>
      <button
        type="button"
        className="text-xs font-semibold underline"
        onClick={() =>
          setSelected(allOn ? new Set() : new Set(candidates.map((c) => c.id)))
        }
      >
        {allOn ? "Select none" : "Select all"}
      </button>
      <ul className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-[var(--line)] p-2">
        {candidates.map((c) => (
          <li key={c.id}>
            <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--wash)]">
              <input
                type="checkbox"
                checked={selected.has(c.id)}
                onChange={() => toggle(c.id)}
              />
              <span className="flex-1">
                {c.name}
                {showStand ? (
                  <span className="text-[var(--muted)]"> · {c.standName}</span>
                ) : null}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {formatMoney(c.priceCents, currency)} · {c.stockQuantity} in stock
              </span>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={pending || selected.size === 0}
        className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        onClick={() => {
          const ids = [...selected];
          start(async () => {
            try {
              const res = await pushProductsToSquareAction(ids);
              report(res, "ok" in res ? res.message : "");
            } catch (error) {
              fail(error);
            }
          });
        }}
      >
        {pending
          ? "Adding to Square…"
          : `Add ${selected.size} product${selected.size === 1 ? "" : "s"} to Square`}
      </button>
      <ActionStatusText status={status} />
    </div>
  );
}
