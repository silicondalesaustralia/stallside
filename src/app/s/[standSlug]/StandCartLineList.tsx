"use client";

import Image from "next/image";
import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/money";
import { productQtyInCart, type CartLine } from "@/lib/stand-cart-storage";
import PreOrderDetails from "./PreOrderDetails";

export type StandCartLineView = {
  key: string;
  product: PublicProductCard;
  quantity: number;
  choiceIds: string[];
  asUpsell: boolean;
  optionsLabel: string | null;
  unitCents: number;
  lineTotalCents: number;
  usedTier: boolean;
  saveCents: number;
};

function stockTone(label: string) {
  if (label.startsWith("Sold out") || label.startsWith("Orders closed")) {
    return "text-[var(--gone)]";
  }
  if (label === "Low stock") return "text-[var(--warn)]";
  return "text-[var(--ok)]";
}

export default function StandCartLineList({
  lines,
  currency,
  step,
  cartLines,
  onBump,
}: {
  lines: StandCartLineView[];
  currency: string;
  step: string;
  cartLines: CartLine[];
  onBump: (line: StandCartLineView, delta: number) => void;
}) {
  return (
    <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {lines.map((line) => (
        <li key={line.key} className="flex flex-col gap-3 py-5">
          <div className="flex gap-3">
            {line.product.imageUrl ? (
              <Image
                src={line.product.imageUrl}
                alt=""
                width={64}
                height={64}
                className="size-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-[var(--wash)] px-1 text-center"
                aria-hidden
              >
                <span className="font-[family-name:var(--font-display)] text-xs font-bold leading-tight text-[var(--field)]">
                  {line.product.name.slice(0, 12)}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xl font-semibold">{line.product.name}</p>
              {line.optionsLabel ? (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {line.optionsLabel}
                </p>
              ) : null}
              {line.product.preOrderDetails ? (
                <PreOrderDetails details={line.product.preOrderDetails} />
              ) : null}
              {line.product.freshnessNote ? (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {line.product.freshnessNote}
                </p>
              ) : null}
              <p className="mt-2 font-receipt text-lg">
                {formatMoney(line.lineTotalCents, currency)}
                {line.quantity > 1 && !line.usedTier
                  ? ` · ${formatMoney(line.unitCents, currency)} each`
                  : null}
              </p>
              {line.usedTier && line.saveCents > 0 ? (
                <p className="mt-1 text-sm text-[var(--leaf-dark)]">
                  Volume price - save {formatMoney(line.saveCents, currency)}
                </p>
              ) : null}
              {line.asUpsell ? (
                <p className="mt-1 text-sm text-[var(--muted)]">Add-on</p>
              ) : null}
              <p
                className={`mt-1.5 font-receipt text-base ${stockTone(line.product.label)}`}
              >
                ● {line.product.label}
              </p>
            </div>
          </div>
          {step === "cart" ? (
            <div className="flex w-full items-center justify-center gap-1 rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--panel)] p-1.5">
              <button
                type="button"
                disabled={line.quantity <= 0}
                onClick={() => onBump(line, -1)}
                className="flex size-14 items-center justify-center rounded-[var(--radius-pill)] text-2xl disabled:opacity-40"
              >
                −
              </button>
              <span className="w-10 text-center font-receipt text-xl">
                {line.quantity}
              </span>
              <button
                type="button"
                disabled={
                  productQtyInCart(cartLines, line.product.id) >=
                  line.product.stockQuantity
                }
                onClick={() => onBump(line, 1)}
                className="flex size-14 items-center justify-center rounded-[var(--radius-pill)] text-2xl disabled:opacity-40"
              >
                +
              </button>
            </div>
          ) : (
            <p className="font-receipt text-lg">Qty {line.quantity}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
