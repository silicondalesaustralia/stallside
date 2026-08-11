"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";
import {
  parseAddonDiscountKind,
  resolveAddonPricing,
  type AddonDiscountKind,
} from "@/lib/preorder-upsell-pricing";

function parseDollars(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number.parseFloat(t.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export default function PreOrderAddonFields({
  currency,
  name,
  priceCents,
  discountKind,
  discountValue,
  intro,
}: {
  currency: string;
  name: string | null;
  priceCents: number | null;
  discountKind: string | null;
  discountValue: number | null;
  intro: string;
}) {
  const [price, setPrice] = useState(
    priceCents != null ? (priceCents / 100).toFixed(2) : "",
  );
  const [kind, setKind] = useState<AddonDiscountKind | "">(
    parseAddonDiscountKind(discountKind ?? "") ?? "",
  );
  const [off, setOff] = useState(() => {
    if (discountValue == null) return "";
    if (discountKind === "AMOUNT") return (discountValue / 100).toFixed(2);
    return String(discountValue);
  });

  const preview = useMemo(() => {
    const list = parseDollars(price);
    if (list == null) return null;
    let value: number | null = null;
    if (kind === "PERCENT") {
      const n = Number.parseInt(off.trim(), 10);
      value = Number.isFinite(n) ? n : null;
    } else if (kind === "AMOUNT") {
      value = parseDollars(off);
    }
    return resolveAddonPricing(list, kind || null, value);
  }, [price, kind, off]);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-base font-semibold">Pre-order add-on</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{intro}</p>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Add-on name</span>
        <input
          name="preOrderUpsellName"
          defaultValue={name ?? ""}
          maxLength={120}
          placeholder="e.g. Bag 6 x Choc Chip Cookies"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Add-on price ({currency})</span>
        <input
          name="preOrderUpsellPrice"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Discount (optional)</span>
          <select
            name="preOrderUpsellDiscountKind"
            value={kind}
            onChange={(e) =>
              setKind(
                (parseAddonDiscountKind(e.target.value) ?? "") as
                  | AddonDiscountKind
                  | "",
              )
            }
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          >
            <option value="">None</option>
            <option value="PERCENT">Percent off</option>
            <option value="AMOUNT">Amount off ({currency})</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">
            {kind === "PERCENT"
              ? "Percent"
              : kind === "AMOUNT"
                ? `Amount (${currency})`
                : "Value"}
          </span>
          <input
            name="preOrderUpsellDiscountValue"
            inputMode="decimal"
            value={off}
            onChange={(e) => setOff(e.target.value)}
            disabled={!kind}
            placeholder={kind === "PERCENT" ? "e.g. 20" : "e.g. 2.00"}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 disabled:opacity-50"
          />
        </label>
      </div>
      {preview ? (
        <p className="text-sm text-[var(--muted)]">
          Customer sees:{" "}
          {preview.compareAtCents != null ? (
            <>
              <span className="line-through">
                {formatMoney(preview.compareAtCents, currency)}
              </span>{" "}
              <span className="font-medium text-[var(--ink)]">
                {formatMoney(preview.saleCents, currency)}
              </span>
            </>
          ) : (
            <span className="font-medium text-[var(--ink)]">
              {formatMoney(preview.saleCents, currency)}
            </span>
          )}
        </p>
      ) : null}
    </div>
  );
}
