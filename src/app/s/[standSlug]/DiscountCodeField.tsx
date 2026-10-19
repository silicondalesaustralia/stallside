"use client";

import { useState, useTransition } from "react";
import { formatMoney } from "@/lib/public-product";
import type { DiscountPreview } from "./discount-code-actions";

type Props = {
  currency: string;
  applied: DiscountPreview | null;
  check: (code: string) => Promise<DiscountPreview | { error: string }>;
  onApplied: (preview: DiscountPreview | null) => void;
  showFirstOrderNote: boolean;
};

export default function DiscountCodeField({
  currency,
  applied,
  check,
  onApplied,
  showFirstOrderNote,
}: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function apply() {
    if (!code.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await check(code);
        if ("error" in result) {
          setError(result.error);
          return;
        }
        onApplied(result);
        setCode("");
      } catch (e) {
        console.error("[DiscountCodeField]", e);
        setError("Could not check that code. Try again.");
      }
    });
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm">
        <span>
          <strong>{applied.code}</strong> ·{" "}
          {applied.freeShipping
            ? "Free shipping"
            : `${formatMoney(applied.discountCents, currency)} off`}
          {showFirstOrderNote ? (
            <span className="block text-xs text-[var(--muted)]">
              If your first-order discount saves more, you get that instead.
            </span>
          ) : null}
        </span>
        <button type="button" onClick={() => onApplied(null)} className="text-sm underline">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") apply();
          }}
          placeholder="Discount code"
          autoCapitalize="characters"
          className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base uppercase"
        />
        <button
          type="button"
          onClick={apply}
          disabled={pending || !code.trim()}
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2.5 text-base font-semibold disabled:opacity-50"
        >
          {pending ? "Checking…" : "Apply"}
        </button>
      </div>
      {error ? <p className="text-sm text-[var(--gone)]">{error}</p> : null}
    </div>
  );
}
