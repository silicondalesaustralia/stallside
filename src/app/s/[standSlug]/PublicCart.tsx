"use client";

import { useMemo, useState, useTransition } from "react";
import DemoCardHint from "@/components/DemoCardHint";
import CheckoutCashConfirm from "./CheckoutCashConfirm";
import CheckoutLocalTransferConfirm from "./CheckoutLocalTransferConfirm";
import CheckoutPayStep from "./CheckoutPayStep";
import TapAndGoInterestCta from "./TapAndGoInterestCta";
import {
  confirmCashCheckout,
  confirmLocalTransferCheckout,
} from "./actions";
import { isEmbeddedCheckout, notifyDemoSale, storePendingDemoSale } from "@/lib/demo-sale-message";
import type { DemoRegion } from "@/lib/demo";
import { startCardCheckout } from "./digital-checkout-actions";

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  stockQuantity: number;
  label: string;
  soldOut: boolean;
};

type LocalTransferInfo = {
  methodId: string;
  buttonLabel: string;
  aliasLabel: string;
  alias: string;
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
  cashEnabled,
  cardEnabled,
  paypalEnabled,
  paypalClientId,
  paypalMerchantId,
  paypalSandbox,
  localTransfer,
  demoRegion,
}: {
  standSlug: string;
  currency: string;
  products: ProductRow[];
  cashEnabled: boolean;
  cardEnabled: boolean;
  paypalEnabled: boolean;
  paypalClientId: string | null;
  paypalMerchantId: string | null;
  paypalSandbox: boolean;
  localTransfer: LocalTransferInfo | null;
  demoRegion?: DemoRegion | null;
}) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [step, setStep] = useState<"cart" | "pay" | "cash-confirm" | "lt-confirm">(
    "cart",
  );
  const [paidVia, setPaidVia] = useState<"cash" | "local_transfer" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardTabHint, setCardTabHint] = useState(false);
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

  function finishOk(via: "cash" | "local_transfer") {
    setQty({});
    const sale = { standSlug, via, totalCents: total, currency };
    if (demoRegion) {
      storePendingDemoSale(sale);
      if (isEmbeddedCheckout()) {
        notifyDemoSale(sale);
        return;
      }
      window.location.href = `/demo/owner?region=${demoRegion}`;
      return;
    }
    setPaidVia(via);
    setDone(true);
    notifyDemoSale(sale);
  }

  function payCash() {
    setError(null);
    startTransition(async () => {
      const result = await confirmCashCheckout({ standSlug, items: payload });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("orderNumber" in result) finishOk("cash");
    });
  }

  function payLocalTransfer() {
    setError(null);
    startTransition(async () => {
      const result = await confirmLocalTransferCheckout({
        standSlug,
        items: payload,
      });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("orderNumber" in result) finishOk("local_transfer");
    });
  }

  function payCard() {
    setError(null);
    setCardTabHint(false);
    startTransition(async () => {
      const result = await startCardCheckout({ standSlug, items: payload });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("url" in result && result.url) {
        if (isEmbeddedCheckout()) {
          const opened = window.open(result.url, "_blank", "noopener,noreferrer");
          if (!opened) {
            setError(
              "Allow pop-ups to open Stripe Checkout, or use Open full screen.",
            );
            return;
          }
          setCardTabHint(true);
          return;
        }
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
            {paidVia === "local_transfer"
              ? "Marked as paid. The owner will see this in their account shortly."
              : "Cash payment confirmed. You're all set."}
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
            className={`flex flex-col gap-3 py-5 ${product.soldOut ? "opacity-45" : ""}`}
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
            <div className="flex w-full items-center justify-center gap-1 rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--panel)] p-1.5">
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
      {cardTabHint ? (
        <p className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--ink)]">
          Stripe Checkout opened in a new tab. Pay with{" "}
          <span className="font-receipt">4242 4242 4242 4242</span> — when done,
          you&apos;ll see the alert on the stall owner&apos;s phone.
        </p>
      ) : null}

      {step === "cart" && demoRegion && cardEnabled ? <DemoCardHint /> : null}

      {step === "pay" ? (
        <CheckoutPayStep
          cashEnabled={cashEnabled}
          cardEnabled={cardEnabled}
          paypalEnabled={paypalEnabled}
          paypalClientId={paypalClientId}
          paypalMerchantId={paypalMerchantId}
          paypalSandbox={paypalSandbox}
          currency={currency}
          standSlug={standSlug}
          items={payload}
          localTransferLabel={localTransfer?.buttonLabel ?? null}
          pending={pending}
          showDemoCardHint={Boolean(demoRegion)}
          onCash={() => setStep("cash-confirm")}
          onLocalTransfer={() => setStep("lt-confirm")}
          onCard={payCard}
          onPayPalError={setError}
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

      {step === "lt-confirm" && localTransfer ? (
        <CheckoutLocalTransferConfirm
          amountLabel={money(total, currency)}
          aliasLabel={localTransfer.aliasLabel}
          alias={localTransfer.alias}
          buttonLabel={localTransfer.buttonLabel}
          pending={pending}
          onConfirm={payLocalTransfer}
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
