"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import DemoCardHint from "@/components/DemoCardHint";
import RestockOptIn from "@/components/RestockOptIn";
import CheckoutCashConfirm from "./CheckoutCashConfirm";
import CheckoutLocalTransferConfirm from "./CheckoutLocalTransferConfirm";
import CheckoutPayStep from "./CheckoutPayStep";
import StandCartLineList from "./StandCartLineList";
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
import type { DemoProduct } from "@/lib/demo";
import {
  resolveCartUpsell,
  type CartUpsellOffer as CartUpsellConfig,
  type PagePreOrderUpsell,
} from "@/lib/cart-upsell";
import { resolveAddonPricing } from "@/lib/preorder-upsell-pricing";
import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import { stallsidePassOnFeeCents } from "@/lib/money";
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
import {
  formatTierSaving,
  lineTotalWithTiers,
} from "@/lib/price-tiers";
import { standCatalogPath } from "@/lib/stand-seo";
import PreOrderDetails from "./PreOrderDetails";
import CartUpsellOffer from "./CartUpsellOffer";
import { startCardCheckout } from "./digital-checkout-actions";

type LocalTransferInfo = {
  methodId: string;
  buttonLabel: string;
  aliasLabel: string;
  alias: string;
};

type FirstOrderOffer = {
  enabled: boolean;
  percent: number;
  amountCents: number | null;
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
  demoProduct,
  restockStandId,
  passFeeToCustomer = false,
  stallsideFeeApplies = false,
  upsell = null,
  preOrderUpsell = null,
  pagePreOrderUpsells = [],
  firstOrder = null,
  shopDeliveryRequired = false,
  shopDeliveryFeeCents = 0,
  shopFulfilmentLabel = null,
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
  demoProduct?: DemoProduct | null;
  restockStandId?: string | null;
  passFeeToCustomer?: boolean;
  stallsideFeeApplies?: boolean;
  /** Stand-level default; product-level upsells on PublicProductCard win when set. */
  upsell?: CartUpsellConfig | null;
  preOrderUpsell?: CartUpsellConfig | null;
  pagePreOrderUpsells?: PagePreOrderUpsell[];
  firstOrder?: FirstOrderOffer | null;
  shopDeliveryRequired?: boolean;
  shopDeliveryFeeCents?: number;
  shopFulfilmentLabel?: string | null;
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
  const [couponCode, setCouponCode] = useState("");
  const [deliveryAddressLine1, setDeliveryAddressLine1] = useState("");
  const [deliverySuburb, setDeliverySuburb] = useState("");
  const [deliveryPostcode, setDeliveryPostcode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

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
        const baseUnit = unitPriceWithOptions(product.priceCents, deltas);
        const asUpsell = Boolean(line.asUpsell);
        let unitCents = baseUnit;
        let lineTotalCents = baseUnit * line.quantity;
        let usedTier = false;
        let saveCents = 0;
        if (asUpsell) {
          let priced = false;
          for (const cl of cartLines) {
            if (cl.asUpsell) continue;
            const trigger = products.find((p) => p.id === cl.productId);
            if (trigger?.preOrderUpsellProductId === product.id) {
              const list =
                trigger.preOrderUpsellPriceCents ?? product.priceCents;
              unitCents = resolveAddonPricing(
                list,
                trigger.preOrderUpsellDiscountKind,
                trigger.preOrderUpsellDiscountValue,
              ).saleCents;
              priced = true;
              break;
            }
            if (trigger?.upsellProductId === product.id) {
              unitCents = trigger.upsellPriceCents ?? product.priceCents;
              priced = true;
              break;
            }
          }
          if (!priced) {
            const pageOffer = pagePreOrderUpsells.find(
              (o) => o.productId === product.id,
            );
            if (pageOffer) {
              unitCents = pageOffer.priceCents;
              priced = true;
            }
          }
          if (!priced && preOrderUpsell?.productId === product.id) {
            unitCents = preOrderUpsell.priceCents;
          } else if (!priced && upsell?.productId === product.id) {
            unitCents = upsell.priceCents;
          }
          lineTotalCents = unitCents * line.quantity;
        } else {
          const priced = lineTotalWithTiers(
            baseUnit,
            line.quantity,
            product.priceTiers,
          );
          unitCents = priced.unitPriceCents;
          lineTotalCents = priced.lineTotalCents;
          usedTier = priced.usedTier;
          if (usedTier) {
            saveCents = formatTierSaving(
              baseUnit,
              line.quantity,
              lineTotalCents,
            );
          }
        }
        return {
          key: `${cartLineKey(line.productId, line.choiceIds)}${asUpsell ? "|u" : ""}`,
          product,
          quantity: line.quantity,
          choiceIds: line.choiceIds,
          asUpsell,
          optionsLabel: labels || null,
          unitCents,
          lineTotalCents,
          usedTier,
          saveCents,
        };
      })
      .filter((l): l is NonNullable<typeof l> => Boolean(l));
  }, [products, cartLines, upsell, preOrderUpsell, pagePreOrderUpsells]);

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const preOrderOnly =
    lines.length > 0 && lines.every((l) => l.product.isPreOrder);
  const shopDelivery = !preOrderOnly && shopDeliveryRequired;
  const deliverOnly =
    shopDelivery ||
    (preOrderOnly && lines.every((l) => l.product.handoverMode === "DELIVER"));
  const total = subtotal + (shopDelivery ? shopDeliveryFeeCents : 0);
  const cardFeeCents =
    stallsideFeeApplies && passFeeToCustomer && total > 0
      ? stallsidePassOnFeeCents(total)
      : 0;
  const cardTotalCents = total + cardFeeCents;
  const payload = lines.map((l) => ({
    productId: l.product.id,
    quantity: l.quantity,
    choiceIds: l.choiceIds,
    asUpsell: l.asUpsell || undefined,
  }));
  const activeUpsell = useMemo(
    () =>
      resolveCartUpsell({
        cartLines,
        products,
        standUpsell: upsell,
        pagePreOrderUpsells,
        standPreOrderUpsell: preOrderUpsell,
      }),
    [cartLines, products, upsell, preOrderUpsell, pagePreOrderUpsells],
  );
  const showUpsell = Boolean(activeUpsell) && step === "cart";
  const firstOrderHint = firstOrder?.enabled
    ? firstOrder.amountCents != null && firstOrder.amountCents > 0
      ? `First visit? Enter email for ${formatMoney(firstOrder.amountCents, currency)} off`
      : `First visit? Enter email for ${firstOrder.percent}% off`
    : null;
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
    if (demoProduct) {
      storePendingDemoSale(sale);
      if (isEmbeddedCheckout()) {
        notifyDemoSale(sale);
        return;
      }
      window.location.href = `/demo/owner?product=${demoProduct}`;
      return;
    }
    setPaidVia(via);
    setDone(true);
    notifyDemoSale(sale);
  }

  function payCash() {
    setError(null);
    startTransition(async () => {
      const email = customerEmail.trim();
      const result = await confirmCashCheckout({
        standSlug,
        items: payload,
        receiptEmail: email || null,
        claimFirstOrder: Boolean(firstOrder?.enabled && email && !couponCode.trim()),
        couponCode: couponCode.trim() || null,
      });
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
      const email = customerEmail.trim();
      const result = await confirmLocalTransferCheckout({
        standSlug,
        items: payload,
        receiptEmail: email || null,
        claimFirstOrder: Boolean(firstOrder?.enabled && email && !couponCode.trim()),
        couponCode: couponCode.trim() || null,
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
      setError(
        deliverOnly
          ? "Enter your name for delivery."
          : "Enter your name for collection.",
      );
      return;
    }
    if (preOrderOnly && !customerEmail.trim()) {
      setError("Enter your email for order details.");
      return;
    }
    if (
      deliverOnly &&
      (!deliveryAddressLine1.trim() ||
        !deliverySuburb.trim() ||
        !deliveryPostcode.trim())
    ) {
      setError("Enter a delivery address.");
      return;
    }
    startTransition(async () => {
      const result = await startCardCheckout({
        standSlug,
        items: payload,
        customerName: preOrderOnly ? customerName.trim() : undefined,
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: preOrderOnly ? customerPhone.trim() : undefined,
        deliveryAddressLine1: deliverOnly
          ? deliveryAddressLine1.trim()
          : undefined,
        deliverySuburb: deliverOnly ? deliverySuburb.trim() : undefined,
        deliveryPostcode: deliverOnly ? deliveryPostcode.trim() : undefined,
        deliveryNotes: deliverOnly ? deliveryNotes.trim() : undefined,
        couponCode: couponCode.trim() || null,
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
      <StandCartLineList
        lines={lines}
        currency={currency}
        step={step}
        cartLines={cartLines}
        onBump={bump}
      />

      {showUpsell && activeUpsell ? (
        <CartUpsellOffer
          name={activeUpsell.name}
          priceCents={activeUpsell.priceCents}
          compareAtCents={activeUpsell.compareAtCents}
          currency={currency}
          onAdd={() => {
            persist([
              ...cartLines,
              {
                productId: activeUpsell.productId,
                quantity: 1,
                choiceIds: [],
                asUpsell: true,
              },
            ]);
          }}
        />
      ) : null}

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
      {step === "cart" && demoProduct && cardEnabled ? <DemoCardHint /> : null}

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
          subtotalCents={total}
          cardFeeCents={cardFeeCents}
          cardTotalCents={cardTotalCents}
          localTransferLabel={localTransfer?.buttonLabel ?? null}
          pending={pending}
          showDemoCardHint={Boolean(demoProduct)}
          preOrderOnly={preOrderOnly}
          deliverOnly={deliverOnly}
          firstOrderHint={firstOrderHint}
          customerName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
          couponCode={couponCode}
          onCouponCode={setCouponCode}
          deliveryAddressLine1={deliveryAddressLine1}
          deliverySuburb={deliverySuburb}
          deliveryPostcode={deliveryPostcode}
          deliveryNotes={deliveryNotes}
          onCustomerName={setCustomerName}
          onCustomerEmail={setCustomerEmail}
          onCustomerPhone={setCustomerPhone}
          onDeliveryAddressLine1={setDeliveryAddressLine1}
          onDeliverySuburb={setDeliverySuburb}
          onDeliveryPostcode={setDeliveryPostcode}
          onDeliveryNotes={setDeliveryNotes}
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
            {shopFulfilmentLabel ? (
              <p className="text-sm text-[var(--muted)]">
                {shopFulfilmentLabel}
                {shopDelivery && shopDeliveryFeeCents > 0
                  ? ` · includes ${formatMoney(shopDeliveryFeeCents, currency)} delivery`
                  : null}
              </p>
            ) : null}
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
