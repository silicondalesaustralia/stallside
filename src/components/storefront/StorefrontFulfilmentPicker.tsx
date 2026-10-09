"use client";

import { useEffect, useState } from "react";
import type { ShopFulfilmentOptionView } from "@/lib/fulfilment/shop-types";
import { formatPickupWindowLabelPlain } from "@/lib/fulfilment/window-label";
import {
  readShopFulfilmentOptionClient,
  writeShopFulfilmentOption,
} from "@/lib/fulfilment/shop-option";
import { formatMoney } from "@/lib/public-product";

function optionSummary(option: ShopFulfilmentOptionView): string {
  if (option.kind === "DELIVERY") {
    const fee = option.deliveryZone?.deliveryFeeCents ?? option.feeCents ?? 0;
    const parts = [option.deliveryZone?.name ?? option.label];
    if (fee > 0) parts.push(formatMoney(fee, "AUD"));
    return parts.join(" · ");
  }
  const windowLabel = option.pickupWindow
    ? formatPickupWindowLabelPlain(option.pickupWindow)
    : null;
  const place =
    option.pickupLocation?.publicLabel ?? option.pickupLocation?.suburb;
  if (windowLabel && place) return `${windowLabel} · ${place}`;
  return windowLabel ?? option.label;
}

export default function StorefrontFulfilmentPicker({
  options,
  currency,
}: {
  options: ShopFulfilmentOptionView[];
  currency: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = readShopFulfilmentOptionClient();
    if (saved && options.some((o) => o.id === saved)) {
      setSelectedId(saved);
      return;
    }
    if (options.length === 1) {
      writeShopFulfilmentOption(options[0].id);
      setSelectedId(options[0].id);
    }
  }, [options]);

  if (options.length <= 1) return null;

  function choose(id: string) {
    writeShopFulfilmentOption(id);
    setSelectedId(id);
  }

  return (
    <section className="border-b border-[var(--line)] bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <p className="text-sm font-semibold text-[var(--field)]">
          How would you like to receive your order?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((option) => {
            const active = selectedId === option.id;
            const fee =
              option.kind === "DELIVERY"
                ? option.deliveryZone?.deliveryFeeCents ?? option.feeCents ?? 0
                : 0;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option.id)}
                className={`rounded-full border px-4 py-2 text-left text-sm transition ${
                  active
                    ? "border-[var(--leaf-dark)] bg-[var(--wash)] font-semibold text-[var(--field)]"
                    : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--leaf)]"
                }`}
              >
                <span className="block">{option.label}</span>
                <span className="block text-xs text-[var(--muted)]">
                  {optionSummary(option)}
                  {fee > 0 ? ` · ${formatMoney(fee, currency)} delivery` : null}
                </span>
              </button>
            );
          })}
        </div>
        {!selectedId ? (
          <p className="mt-2 text-xs text-[var(--warn)]">
            Choose pickup or delivery before adding items to your cart.
          </p>
        ) : null}
      </div>
    </section>
  );
}
