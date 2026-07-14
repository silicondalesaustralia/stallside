"use client";

import { useMemo, useState, useTransition } from "react";
import CheckoutCashConfirm from "./CheckoutCashConfirm";
import CheckoutPayStep from "./CheckoutPayStep";
import TapAndGoInterestCta from "./TapAndGoInterestCta";
import { confirmCashCheckout } from "./actions";
import { startCardCheckout } from "./digital-checkout-actions";
import { startPayPalCheckout } from "./paypal-checkout-actions";

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  stockQuantity: number;
  label: string;
  soldOut: boolean;
};

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function stockTone(label: string) {
  if (label === "Sold out") return "text-[var(--gone)]";
  if (label === "Low stock") return "text-[var(--warn)]";
  return "text-[var(--ok)]";
}

export default function PublicCart({
  standSlug,
  currency,
  products,
  cardEnabled,
  paypalEnabled,
}: {
  standSlug: string;
  currency: string;
  products: ProductRow[];
  cardEnabled: boolean;
  paypalEnabled: boolean;
}) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [step, setStep] = useState<"cart" | "pay" | "cash-confirm">("cart");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const lines = useMemo(
    () =>
      products
        .map((p) => ({ product: p, quantity: qty[p.id] ?? 0 }))
        .filter((l) => l.quantity > 0),
    [products, qty],
  );
  const total = lines.reduce((sum, l) => sum + l.product.priceCents * l.quantity, 0);
  const payload = lines.map((l) => ({
    productId: l.product.id,
    quantity: l.quantity,
  }));

  function bump(id: string, stock: number, delta: number) {
    setQty((prev) => {
      const next = Math.max(0, Math.min(stock, (prev[id] ?? 0) + delta));
      return { ...prev, [id]: next };
    });
  }

  function payCash() {
    setError(null);
    startTransition(async () => {
      const result = await confirmCashCheckout({ standSlug, items: payload });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("orderNumber" in result) {
        setDone(true);
        setQty({});
      }
    });
  }

  function payCard() {
    setError(null);
    startTransition(async () => {
      const result = await startCardCheckout({ standSlug, items: payload });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("url" in result && result.url) {
        window.location.href = result.url;
      }
    });
  }

  function payPayPal() {
    setError(null);
    startTransition(async () => {
      const result = await startPayPalCheckout({ standSlug, items: payload });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("url" in result && result.url) {
        window.location.href = result.url;
      }
    });
  }

  if (done) {
    return (
      <div className="mt-10 flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-8">
          <div
            aria-hidden
            className="absolute left-4 top-4 size-8 border-l-[3px] border-t-[3px] border-[var(--leaf)]"
            style={{ borderTopLeftRadius: 8 }}
          />
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Thank you
          </h2>
          <p className="mt-3 text-xl text-[var(--muted)]">
            Cash payment confirmed. You&apos;re all set.
          </p>
        </div>
        {!cardEnabled && !paypalEnabled ? (
          <TapAndGoInterestCta standSlug={standSlug} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4 pb-40">
      <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {products.map((product) => (
          <li
            key={product.id}
            className={`flex items-center justify-between gap-4 py-5 ${product.soldOut ? "opacity-45" : ""}`}
          >
            <div className="min-w-0">
              <p className="text-xl font-semibold">{product.name}</p>
              {product.description ? (
                <p className="mt-1 text-lg leading-snug text-[var(--muted)]">
                  {product.description}
                </p>
              ) : null}
              <p className="mt-2 font-receipt text-lg">
                {money(product.priceCents, currency)}
              </p>
              <p className={`mt-1.5 font-receipt text-base ${stockTone(product.label)}`}>
                ● {product.label}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--panel)] p-1.5">
              <button
                type="button"
                disabled={product.soldOut || (qty[product.id] ?? 0) <= 0 || step !== "cart"}
                onClick={() => bump(product.id, product.stockQuantity, -1)}
                className="flex size-14 items-center justify-center rounded-[var(--radius-pill)] text-2xl disabled:opacity-40"
              >
                −
              </button>
              <span className="w-10 text-center font-receipt text-xl">
                {qty[product.id] ?? 0}
              </span>
              <button
                type="button"
                disabled={
                  product.soldOut ||
                  (qty[product.id] ?? 0) >= product.stockQuantity ||
                  step !== "cart"
                }
                onClick={() => bump(product.id, product.stockQuantity, 1)}
                className="flex size-14 items-center justify-center rounded-[var(--radius-pill)] text-2xl disabled:opacity-40"
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      {error ? <p className="text-lg text-[var(--gone)]">{error}</p> : null}

      {step === "pay" ? (
        <CheckoutPayStep
          cardEnabled={cardEnabled}
          paypalEnabled={paypalEnabled}
          pending={pending}
          onCash={() => setStep("cash-confirm")}
          onCard={payCard}
          onPayPal={payPayPal}
          onBack={() => setStep("cart")}
        />
      ) : null}

      {step === "cash-confirm" ? (
        <CheckoutCashConfirm
          amountLabel={money(total, currency)}
          pending={pending}
          onConfirm={payCash}
          onBack={() => setStep("pay")}
        />
      ) : null}

      {step === "cart" ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-[var(--panel)]/95 px-4 py-4 backdrop-blur pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-lg flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-base text-[var(--muted)]">Total</p>
              <p className="font-receipt text-3xl font-semibold tabular-nums">
                {money(total, currency)}
              </p>
            </div>
            <button
              type="button"
              disabled={pending || total <= 0}
              onClick={() => setStep("pay")}
              className="w-full rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-4 text-lg font-semibold text-white disabled:opacity-50"
            >
              Continue to payment
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
