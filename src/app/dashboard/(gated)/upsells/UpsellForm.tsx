"use client";

import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { deleteUpsell, saveUpsell, type UpsellInput } from "./actions";
import type { ScopeOption } from "./ScopeChecklist";
import UpsellScopeFields from "./UpsellScopeFields";

const inputClass = "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm";

export default function UpsellForm({
  upsellId,
  initial,
  offerProducts,
  categories,
  products,
  currency,
}: {
  upsellId: string | null;
  initial: UpsellInput;
  offerProducts: ScopeOption[];
  categories: ScopeOption[];
  products: ScopeOption[];
  currency: string;
}) {
  const [value, setValue] = useState<UpsellInput>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const update = (patch: Partial<UpsellInput>) => setValue((v) => ({ ...v, ...patch }));

  function run(action: () => Promise<{ error: string } | { ok: true }>, failure: string) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await action();
        if ("error" in result) setMessage(result.error);
      } catch (err) {
        unstable_rethrow(err);
        setMessage(failure);
      }
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(() => saveUpsell(upsellId, value), "Could not save the upsell. Please try again.");
  }

  function onDelete() {
    if (!upsellId || !window.confirm("Delete this upsell?")) return;
    run(() => deleteUpsell(upsellId), "Could not delete the upsell. Please try again.");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Name</span>
        <input
          required
          maxLength={80}
          value={value.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Eggs with any bread"
          className={inputClass}
        />
        <span className="text-xs text-[var(--muted)]">Only you see this.</span>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Product to offer</span>
        <select
          required
          value={value.offerProductId}
          onChange={(e) => update({ offerProductId: e.target.value })}
          className={inputClass}
        >
          <option value="">Choose a product…</option>
          {offerProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Special price (optional)</span>
        <input
          inputMode="decimal"
          value={value.price}
          onChange={(e) => update({ price: e.target.value })}
          placeholder={`Leave blank for the normal ${currency} price`}
          className={inputClass}
        />
      </label>

      <UpsellScopeFields value={value} onChange={update} categories={categories} products={products} />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.isActive}
          onChange={(e) => update({ isActive: e.target.checked })}
          className="size-4"
        />
        Turned on
      </label>

      {message ? <p className="text-sm text-[var(--warn)]">{message}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="submit" disabled={pending} className={dashCtaClass}>
          {pending ? "Saving…" : "Save upsell"}
        </button>
        {upsellId ? (
          <button type="button" onClick={onDelete} disabled={pending} className="text-sm text-[var(--warn)] underline">
            Delete upsell
          </button>
        ) : null}
      </div>
    </form>
  );
}
