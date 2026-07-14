"use client";

import { useMemo, useState, useTransition } from "react";
import { confirmCashCheckout, startCardCheckout } from "./actions";

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
}: {
  standSlug: string;
  currency: string;
  products: ProductRow[];
  cardEnabled: boolean;
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

  if (done) {
    return (
      <div className="relative mt-10 overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-8">
        <div
          aria-hidden
          className="absolute left-4 top-4 size-8 border-l-[3px] border-t-[3px] border-[var(--leaf)]"
          style={{ borderTopLeftRadius: 8 }}
        />
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
          Thank you
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          Cash payment confirmed. You&apos;re all set.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4 pb-28">
      <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {products.map((product) => (
          <li
            key={product.id}
            className={`flex items-center justify-between gap-4 py-4 ${product.soldOut ? "opacity-45" : ""}`}
          >
            <div className="min-w-0">
              <p className="font-medium">{product.name}</p>
              <p className="mt-1 font-receipt text-sm">{money(product.priceCents, currency)}</p>
              <p className={`mt-1 font-receipt text-xs ${stockTone(product.label)}`}>
                ● {product.label}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--panel)] p-1">
              <button
                type="button"
                disabled={product.soldOut || (qty[product.id] ?? 0) <= 0 || step !== "cart"}
                onClick={() => bump(product.id, product.stockQuantity, -1)}
                className="flex size-11 items-center justify-center rounded-[var(--radius-pill)] text-lg disabled:opacity-40"
              >
                −
              </button>
              <span className="w-8 text-center font-receipt text-sm">{qty[product.id] ?? 0}</span>
              <button
                type="button"
                disabled={
                  product.soldOut ||
                  (qty[product.id] ?? 0) >= product.stockQuantity ||
                  step !== "cart"
                }
                onClick={() => bump(product.id, product.stockQuantity, 1)}
                className="flex size-11 items-center justify-center rounded-[var(--radius-pill)] text-lg disabled:opacity-40"
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      {error ? <p className="text-sm text-[var(--gone)]">{error}</p> : null}

      {step === "pay" ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">How would you like to pay?</p>
          <button
            type="button"
            disabled={pending}
            onClick={() => setStep("cash-confirm")}
            className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-4 py-5 text-left text-sm font-semibold"
          >
            Pay cash
          </button>
          <button
            type="button"
            disabled={pending || !cardEnabled}
            onClick={payCard}
            className="rounded-[var(--radius)] bg-[var(--leaf)] px-4 py-5 text-left text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Opening checkout…" : "Card / Tap & Go (Apple Pay · Google Pay)"}
          </button>
          {!cardEnabled ? (
            <p className="text-xs text-[var(--muted)]">
              Card payments unavailable — stand owner hasn&apos;t connected Stripe yet.
            </p>
          ) : null}
          <button
            type="button"
            className="text-sm text-[var(--leaf-dark)] underline"
            onClick={() => setStep("cart")}
          >
            Back to cart
          </button>
        </div>
      ) : null}

      {step === "cash-confirm" ? (
        <div className="flex flex-col gap-4 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Please place</p>
          <p className="font-receipt text-4xl font-semibold tracking-tight">
            {money(total, currency)}
          </p>
          <p className="text-sm text-[var(--muted)]">
            in the cash slot. Once you have placed the cash in the slot, tap below so we can
            update the stand&apos;s stock.
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={payCash}
            className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Logging…" : "I have paid cash"}
          </button>
          <button
            type="button"
            className="text-sm text-[var(--leaf-dark)] underline"
            onClick={() => setStep("pay")}
          >
            Back
          </button>
        </div>
      ) : null}

      {step === "cart" ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-[var(--panel)]/95 px-4 py-3 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[var(--muted)]">Total</p>
              <p className="font-receipt text-xl font-semibold">{money(total, currency)}</p>
            </div>
            <button
              type="button"
              disabled={pending || total <= 0}
              onClick={() => setStep("pay")}
              className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Continue to payment
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
