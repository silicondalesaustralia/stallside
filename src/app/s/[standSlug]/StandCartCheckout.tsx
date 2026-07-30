"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import DemoCardHint from "@/components/DemoCardHint";
import RestockOptIn from "@/components/RestockOptIn";
import CheckoutCashConfirm from "./CheckoutCashConfirm";
import CheckoutLocalTransferConfirm from "./CheckoutLocalTransferConfirm";
import CheckoutPayStep from "./CheckoutPayStep";
import TapAndGoInterestCta from "./TapAndGoInterestCta";
import {
  confirmCashCheckout,
  confirmLocalTransferCheckout,
} from "./actions";
import {
  isEmbeddedCheckout,
  notifyDemoSale,
  storePendingDemoSale,
} from "@/lib/demo-sale-message";
import type { DemoRegion } from "@/lib/demo";
import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import {
  pruneStandCart,
  productQtyInCart,
  setCartLineQuantity,
  writeStandCartLines,
  type CartLine,
} from "@/lib/stand-cart-storage";
import {
  CART_MIX_COLLECTION_DAYS,
  CART_MIX_TAKE_NOW_PREORDER,
} from "@/lib/pre-order";
import { cartLineKey, unitPriceWithOptions } from "@/lib/product-options";
import { standCatalogPath } from "@/lib/stand-seo";
import PreOrderDetails from "./PreOrderDetails";
import { startCardCheckout } from "./digital-checkout-actions";

type LocalTransferInfo = {
  methodId: string;
  buttonLabel: string;
  aliasLabel: string;
  alias: string;
};

function stockTone(label: string) {
  if (label.startsWith("Sold out") || label.startsWith("Orders closed")) {
    return "text-[var(--gone)]";
  }
  if (label === "Low stock") return "text-[var(--warn)]";
  return "text-[var(--ok)]";
}

function cartConflictMessage(
  target: PublicProductCard,
  other: PublicProductCard,
): string | null {
  if (Boolean(other.isPreOrder) !== Boolean(target.isPreOrder)) {
    return CART_MIX_TAKE_NOW_PREORDER;
  }
  if (
    target.isPreOrder &&
    other.isPreOrder &&
    other.collectionAtMs !== target.collectionAtMs
  ) {
    return CART_MIX_COLLECTION_DAYS;
  }
  return null;
}

export default function StandCartCheckout({
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
  restockStandId,
}: {
  standSlug: string;
  currency: string;
  products: PublicProductCard[];
  cashEnabled: boolean;
  cardEnabled: boolean;
  paypalEnabled: boolean;
  paypalClientId: string | null;
  paypalMerchantId: string | null;
  paypalSandbox: boolean;
  localTransfer: LocalTransferInfo | null;
  demoRegion?: DemoRegion | null;
  restockStandId?: string | null;
}) {
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<"cart" | "pay" | "cash-confirm" | "lt-confirm">(
    "cart",
  );
  const [paidVia, setPaidVia] = useState<"cash" | "local_transfer" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardTabHint, setCardTabHint] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const productIds = products.map((p) => p.id).join(",");

  useEffect(() => {
    setCartLines(
      pruneStandCart(standSlug, productIds ? productIds.split(",") : []),
    );
    setHydrated(true);
  }, [standSlug, productIds]);

  function persist(next: CartLine[]) {
    setCartLines(next);
    writeStandCartLines(standSlug, next);
  }

  const lines = useMemo(() => {
    return cartLines
      .map((line) => {
        const product = products.find((p) => p.id === line.productId);
        if (!product) return null;
        const deltas = product.optionGroups.map((g, i) => {
          const choice = g.choices.find((c) => c.id === line.choiceIds[i]);
          return choice?.priceDeltaCents ?? 0;
        });
        const labels = product.optionGroups
          .map((g, i) => {
            const choice = g.choices.find((c) => c.id === line.choiceIds[i]);
            return choice ? `${g.name}: ${choice.name}` : null;
          })
          .filter(Boolean)
          .join(" · ");
        const unitCents = unitPriceWithOptions(product.priceCents, deltas);
        return {
          key: cartLineKey(line.productId, line.choiceIds),
          product,
          quantity: line.quantity,
          choiceIds: line.choiceIds,
          optionsLabel: labels || null,
          unitCents,
        };
      })
      .filter((l): l is NonNullable<typeof l> => Boolean(l));
  }, [products, cartLines]);

  const total = lines.reduce((sum, l) => sum + l.unitCents * l.quantity, 0);
  const payload = lines.map((l) => ({
    productId: l.product.id,
    quantity: l.quantity,
    choiceIds: l.choiceIds,
  }));
  const preOrderOnly =
    lines.length > 0 && lines.every((l) => l.product.isPreOrder);
  const hasMixedCart =
    lines.some((l) => l.product.isPreOrder) &&
    lines.some((l) => !l.product.isPreOrder);

  function bump(line: (typeof lines)[number], delta: number) {
    const nextQty = line.quantity + delta;
    if (nextQty > 0) {
      for (const o of products) {
        if (
          o.id === line.product.id ||
          productQtyInCart(cartLines, o.id) <= 0
        ) {
          continue;
        }
        const msg = cartConflictMessage(line.product, o);
        if (msg) {
          setError(msg);
          return;
        }
      }
    }
    setError(null);
    persist(
      setCartLineQuantity(
        standSlug,
        line.product.id,
        line.choiceIds,
        nextQty,
        line.product.stockQuantity,
      ),
    );
  }

  function finishOk(via: "cash" | "local_transfer") {
    persist([]);
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
    if (preOrderOnly && !customerName.trim()) {
      setError("Enter your name for collection.");
      return;
    }
    if (preOrderOnly && !customerEmail.trim()) {
      setError("Enter your email for order details.");
      return;
    }
    startTransition(async () => {
      const result = await startCardCheckout({
        standSlug,
        items: payload,
        customerName: preOrderOnly ? customerName.trim() : undefined,
        customerEmail: preOrderOnly ? customerEmail.trim() : undefined,
        customerPhone: preOrderOnly ? customerPhone.trim() : undefined,
      });
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
        persist([]);
        window.location.href = result.url;
      }
    });
  }

  if (!hydrated) {
    return <p className="mt-8 text-[var(--muted)]">Loading cart…</p>;
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
          {restockStandId ? (
            <RestockOptIn standId={restockStandId} inputId="restock-email-cash" />
          ) : null}
        </div>
        {!cardEnabled && !paypalEnabled ? (
          <TapAndGoInterestCta standSlug={standSlug} />
        ) : null}
        <Link
          href={standCatalogPath(standSlug)}
          className="text-center font-semibold text-[var(--leaf-dark)] underline"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mt-10 flex flex-col gap-4">
        <p className="text-xl text-[var(--muted)]">Your cart is empty.</p>
        <Link
          href={standCatalogPath(standSlug)}
          className="font-semibold text-[var(--leaf-dark)] underline"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4 pb-40">
      <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {lines.map((line) => (
          <li key={line.key} className="flex flex-col gap-3 py-5">
            <div className="flex gap-3">
              {line.product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={line.product.imageUrl}
                  alt=""
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
                <p className="mt-2 font-receipt text-lg">
                  {formatMoney(line.unitCents, currency)}
                </p>
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
                  onClick={() => bump(line, -1)}
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
                  onClick={() => bump(line, 1)}
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

      {hasMixedCart ? (
        <p className="text-lg text-[var(--gone)]">{CART_MIX_TAKE_NOW_PREORDER}</p>
      ) : error ? (
        <p className="text-lg text-[var(--gone)]">{error}</p>
      ) : null}
      {cardTabHint ? (
        <p className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm">
          Stripe Checkout opened in a new tab.
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
          preOrderOnly={preOrderOnly}
          customerName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
          onCustomerName={setCustomerName}
          onCustomerEmail={setCustomerEmail}
          onCustomerPhone={setCustomerPhone}
          onCash={() => setStep("cash-confirm")}
          onLocalTransfer={() => setStep("lt-confirm")}
          onCard={payCard}
          onPayPalError={setError}
          onBack={() => setStep("cart")}
        />
      ) : null}

      {step === "cash-confirm" ? (
        <CheckoutCashConfirm
          amountLabel={formatMoney(total, currency)}
          pending={pending}
          onConfirm={payCash}
          onBack={() => setStep("pay")}
        />
      ) : null}

      {step === "lt-confirm" && localTransfer ? (
        <CheckoutLocalTransferConfirm
          amountLabel={formatMoney(total, currency)}
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
                {formatMoney(total, currency)}
              </p>
            </div>
            <button
              type="button"
              disabled={pending || total <= 0}
              onClick={() => {
                if (hasMixedCart) {
                  setError(CART_MIX_TAKE_NOW_PREORDER);
                  return;
                }
                setError(null);
                setStep("pay");
              }}
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
