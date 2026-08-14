"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/money";

function parseDollars(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number.parseFloat(t.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export default function ProductOwnerMetaFields({
  currency,
  sku,
  upc,
  costCents,
  priceCents,
  priceFieldName = "price",
}: {
  currency: string;
  sku: string | null;
  upc: string | null;
  costCents: number | null;
  priceCents: number;
  priceFieldName?: string;
}) {
  const [cost, setCost] = useState(
    costCents != null ? (costCents / 100).toFixed(2) : "",
  );
  const [price, setPrice] = useState((priceCents / 100).toFixed(2));

  useEffect(() => {
    const form = document.querySelector(
      `input[name="${priceFieldName}"]`,
    )?.closest("form");
    const input = form?.elements.namedItem(priceFieldName);
    if (!(input instanceof HTMLInputElement)) return;
    const handler = () => setPrice(input.value);
    input.addEventListener("input", handler);
    handler();
    return () => input.removeEventListener("input", handler);
  }, [priceFieldName]);

  const costParsed = parseDollars(cost);
  const priceParsed = parseDollars(price);
  const profit =
    costParsed != null && priceParsed != null
      ? priceParsed - costParsed
      : null;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-base font-semibold">Owner details</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          SKU, UPC, and cost are only visible to you - not on your storefront.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">SKU (optional)</span>
          <input
            name="sku"
            defaultValue={sku ?? ""}
            maxLength={64}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 font-receipt"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">UPC (optional)</span>
          <input
            name="upc"
            defaultValue={upc ?? ""}
            maxLength={32}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 font-receipt"
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Cost ({currency})</span>
        <input
          name="cost"
          inputMode="decimal"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="What it costs you"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <p className="text-sm text-[var(--muted)]">
        Profit:{" "}
        <span className="font-medium text-[var(--ink)]">
          {profit != null ? formatMoney(profit, currency) : "—"}
        </span>
        <span className="ml-1">(price - cost)</span>
      </p>
    </div>
  );
}
