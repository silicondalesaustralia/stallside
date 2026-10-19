"use client";

import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import type { ScopeOption } from "../upsells/ScopeChecklist";
import { deleteDiscount, saveDiscount } from "./actions";
import type { DiscountInput } from "@/lib/discounts/input";
import DiscountValueFields from "./DiscountValueFields";
import DiscountScopeFields from "./DiscountScopeFields";
import DiscountLimitFields from "./DiscountLimitFields";

const inputClass = "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm";

export default function DiscountForm({
  discountId,
  initial,
  categories,
  products,
  currency,
}: {
  discountId: string | null;
  initial: DiscountInput;
  categories: ScopeOption[];
  products: ScopeOption[];
  currency: string;
}) {
  const [value, setValue] = useState<DiscountInput>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const update = (patch: Partial<DiscountInput>) => setValue((v) => ({ ...v, ...patch }));

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

  function onDelete() {
    if (!discountId || !window.confirm("Delete this discount? Shoppers won't be able to use the code.")) return;
    run(() => deleteDiscount(discountId), "Could not delete the discount. Please try again.");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveDiscount(discountId, value), "Could not save the discount. Please try again.");
      }}
      className="flex flex-col gap-5"
    >
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Code</span>
        <input
          required
          maxLength={30}
          value={value.code}
          onChange={(e) => update({ code: e.target.value.toUpperCase() })}
          placeholder="SUMMER10"
          className={`${inputClass} font-mono uppercase`}
        />
        <span className="text-xs text-[var(--muted)]">Shoppers type this at checkout.</span>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Name (optional)</span>
        <input
          maxLength={80}
          value={value.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Summer market promo"
          className={inputClass}
        />
        <span className="text-xs text-[var(--muted)]">Only you see this.</span>
      </label>

      <DiscountValueFields value={value} onChange={update} currency={currency} />
      <DiscountScopeFields value={value} onChange={update} categories={categories} products={products} />
      <DiscountLimitFields value={value} onChange={update} />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.isActive}
          onChange={(e) => update({ isActive: e.target.checked })}
          className="size-4"
        />
        Turned on
      </label>
      <p className="text-xs text-[var(--muted)]">
        If a shopper also qualifies for your first-order discount, they get whichever saves more.
      </p>

      {message ? <p className="text-sm text-[var(--warn)]">{message}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="submit" disabled={pending} className={dashCtaClass}>
          {pending ? "Saving…" : "Save discount"}
        </button>
        {discountId ? (
          <button type="button" onClick={onDelete} disabled={pending} className="text-sm text-[var(--warn)] underline">
            Delete discount
          </button>
        ) : null}
      </div>
    </form>
  );
}
