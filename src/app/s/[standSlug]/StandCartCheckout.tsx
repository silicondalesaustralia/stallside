"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import DemoCardHint from "@/components/DemoCardHint";
import CheckoutCashConfirm from "./CheckoutCashConfirm";
import CheckoutLocalTransferConfirm from "./CheckoutLocalTransferConfirm";
import CheckoutPayStep from "./CheckoutPayStep";
import StandCartLineList from "./StandCartLineList";
import CartDoneView, { type CartPaidVia } from "./CartDoneView";
import CartEmptyView from "./CartEmptyView";
import CartTotalBar from "./CartTotalBar";
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
  ruleUpsellUnitCents,
  type CartUpsellOffer as CartUpsellConfig,
  type PagePreOrderUpsell,
} from "@/lib/cart-upsell";
import type { UpsellRule } from "@/lib/upsells/rules";

const NO_UPSELL_RULES: UpsellRule[] = [];
import type { DiscountChannel } from "@/lib/discounts/resolve-code";
import { useCartDiscount } from "./useCartDiscount";
import DiscountCodeField from "./DiscountCodeField";
import { resolveAddonPricing } from "@/lib/preorder-upsell-pricing";
import type { PublicProductCard } from "@/lib/public-product";
import { formatMoney } from "@/lib/public-product";
import { stallsidePassOnFeeCents } from "@/lib/money";
import { splitDepositBalance } from "@/lib/deposit-split";
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
  type PreOrderPaymentTiming,
} from "@/lib/pre-order";
import { cartLineKey, unitPriceWithOptions } from "@/lib/product-options";
import {
  formatTierSaving,
  lineTotalWithTiers,
} from "@/lib/price-tiers";
import { useShopHref } from "@/components/storefront/use-cart-href";
import PreOrderDetails from "./PreOrderDetails";
import CartUpsellOffer from "./CartUpsellOffer";
import { startCardCheckout } from "./digital-checkout-actions";
import { placePayAtPickupOrder } from "./pay-at-pickup-actions";
import StripeEmbeddedCheckout from "@/components/checkout/StripeEmbeddedCheckout";
import type { EmbeddedCheckoutInfo } from "@/lib/stripe-embedded-checkout";
import {
  CART_MIX_HANDOVER,
  cartHandoverNote,
  cartHandoverOptions,
  STALL_HANDOVER_NOTE,
  type HandoverValue,
} from "@/lib/fulfilment/handover-choice";
import { useAtStall } from "@/components/storefront/useAtStall";
import { shopButtonColour } from "@/lib/storefront/shop-button-colour";
import { shippingCostCents, type ShippingSettings } from "@/lib/shipping/shipping-cost";
import { cartAddedTaxCents, cartShippingTaxCents, type CartAddedTax } from "@/lib/tax/cart-tax";
import { formatTaxRate } from "@/lib/tax/config";

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
  squareEnabled = false,
  paypalEnabled,
  paypalClientId,
  paypalMerchantId,
  paypalSandbox,
  localTransfer,
  demoProduct,
  restockStandId,
  passFeeToCustomer = false,
  stallsideFeeApplies = false,
  shipping = null,
  addedTax = null,
  upsell = null,
  preOrderUpsell = null,
  pagePreOrderUpsells = [],
  upsellRules = NO_UPSELL_RULES,
  discountChannel = null,
  firstOrder = null,
  shopHref,
}: {
  standSlug: string;
  currency: string;
  products: PublicProductCard[];
  cashEnabled: boolean;
  cardEnabled: boolean;
  squareEnabled?: boolean;
  paypalEnabled: boolean;
  paypalClientId: string | null;
  paypalMerchantId: string | null;
  paypalSandbox: boolean;
  localTransfer: LocalTransferInfo | null;
  demoProduct?: DemoProduct | null;
  restockStandId?: string | null;
  passFeeToCustomer?: boolean;
  stallsideFeeApplies?: boolean;
  /** Shipping charged on shipped (non pre-order) carts. */
  shipping?: ShippingSettings | null;
  /** Sales tax added on top at checkout (US/CA owners). */
  addedTax?: CartAddedTax | null;
  /** Stand-level default; product-level upsells on PublicProductCard win when set. */
  upsell?: CartUpsellConfig | null;
  preOrderUpsell?: CartUpsellConfig | null;
  pagePreOrderUpsells?: PagePreOrderUpsell[];
  upsellRules?: UpsellRule[];
  /** Set when the business has live discount codes for this channel. */
  discountChannel?: DiscountChannel | null;
  firstOrder?: FirstOrderOffer | null;
  /** Continue-shopping link; defaults to the website products page or the stand. */
  shopHref?: string;
}) {
  const defaultShopHref = useShopHref(standSlug);
  const backHref = shopHref ?? defaultShopHref;
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<"cart" | "pay" | "cash-confirm" | "lt-confirm">(
    "cart",
  );
  const [paidVia, setPaidVia] = useState<CartPaidVia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardTabHint, setCardTabHint] = useState(false);
  const [cardCheckout, setCardCheckout] = useState<{ info: EmbeddedCheckoutInfo; lines: CartLine[] } | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddressLine1, setDeliveryAddressLine1] = useState("");
  const [deliverySuburb, setDeliverySuburb] = useState("");
  const [deliveryPostcode, setDeliveryPostcode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [handoverPick, setHandoverPick] = useState<HandoverValue>("COLLECT");
  const [payPick, setPayPick] = useState<PreOrderPaymentTiming | null>(null);
  const atStall = useAtStall();
  const rootRef = useRef<HTMLDivElement>(null);

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
        const variant = line.variantId
          ? product.variants.find((v) => v.id === line.variantId)
          : undefined;
        if (product.variants.length > 0 && !variant) return null;
        const labels = [
          ...(variant
            ? product.variantOptionNames.map((n, i) => `${n}: ${variant.values[i] ?? ""}`)
            : []),
          ...product.optionGroups.map((g, i) => {
            const choice = g.choices.find((c) => c.id === line.choiceIds[i]);
            return choice ? `${g.name}: ${choice.name}` : null;
          }),
        ]
          .filter(Boolean)
          .join(" · ");
        const baseUnit = unitPriceWithOptions(variant?.priceCents ?? product.priceCents, deltas);
        const asUpsell = Boolean(line.asUpsell);
        let unitCents = baseUnit;
        let lineTotalCents = baseUnit * line.quantity;
        let usedTier = false;
        let saveCents = 0;
        if (asUpsell) {
          const ruleCents = ruleUpsellUnitCents({
            cartLines,
            products,
            rules: upsellRules,
            standUpsell: upsell,
            offerProductId: product.id,
          });
          let priced = ruleCents != null;
          if (ruleCents != null) unitCents = ruleCents;
          for (const cl of cartLines) {
            if (priced) break;
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
          key: `${cartLineKey(line.productId, line.choiceIds, line.variantId)}${asUpsell ? "|u" : ""}`,
          product,
          variantId: variant?.id,
          maxStock: variant?.stockQuantity ?? product.stockQuantity,
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
  }, [products, cartLines, upsell, preOrderUpsell, pagePreOrderUpsells, upsellRules]);

  const preOrderOnly =
    lines.length > 0 && lines.every((l) => l.product.isPreOrder);
  const payOptions = preOrderOnly ? (lines[0]?.product.paymentOptions ?? []) : [];
  const payTiming = payPick && payOptions.includes(payPick) ? payPick : (payOptions[0] ?? null);
  const payAtPickup = payTiming === "PAY_AT_PICKUP";
  const cardPayTiming =
    payTiming === "PAY_UPFRONT" || payTiming === "DEPOSIT_THEN_BALANCE" ? payTiming : undefined;
  const handoverOptions = cartHandoverOptions(
    lines.filter((l) => !l.asUpsell).map((l) => l.product.fulfilment),
  );
  const handoverConflict = !handoverOptions.pickup && !handoverOptions.delivery;
  const stallPickup = atStall && handoverOptions.pickup && !preOrderOnly;
  const canChooseHandover = handoverOptions.pickup && handoverOptions.delivery && !stallPickup;
  const handoverNote = stallPickup ? STALL_HANDOVER_NOTE : cartHandoverNote(handoverOptions);
  const handover: HandoverValue = canChooseHandover
    ? handoverPick
    : handoverOptions.pickup
      ? "COLLECT"
      : "DELIVER";
  const deliver = handover === "DELIVER";
  const needsContact = preOrderOnly || deliver;

  const payload = lines.map((l) => ({
    productId: l.product.id,
    variantId: l.variantId,
    quantity: l.quantity,
    choiceIds: l.choiceIds,
    asUpsell: l.asUpsell || undefined,
  }));
  const discount = useCartDiscount({
    standSlug,
    items: payload,
    email: customerEmail,
    channel: discountChannel,
  });
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const codeOff = Math.min(discount.applied?.discountCents ?? 0, subtotal);
  const shippingCents =
    deliver && !preOrderOnly && shipping && !discount.applied?.freeShipping
      ? shippingCostCents(
          shipping,
          lines.map((l) => ({ shippingCents: l.product.shippingCents, quantity: l.quantity })),
          subtotal - codeOff,
        )
      : 0;
  const taxAddedCents = cartAddedTaxCents(
    addedTax,
    lines.map((l) => ({ productId: l.product.id, lineTotalCents: l.lineTotalCents })),
    codeOff,
  ) + cartShippingTaxCents(addedTax, shippingCents);
  const total = subtotal - codeOff + taxAddedCents + shippingCents;
  const passOnApplies = stallsideFeeApplies && passFeeToCustomer && total > 0;
  const cardFeeCents = passOnApplies ? stallsidePassOnFeeCents(total) : 0;
  const cardTotalCents = total + cardFeeCents;
  const squareTotalCents =
    total + (passOnApplies ? stallsidePassOnFeeCents(total) : 0);
  const depositPercent =
    payTiming === "DEPOSIT_THEN_BALANCE" ? (lines[0]?.product.depositPercent ?? 30) : null;
  const squareDeposit = (() => {
    if (depositPercent == null || total <= 0) return null;
    const split = splitDepositBalance(total, depositPercent);
    if (split.balanceCents <= 0) return null;
    const fee = passOnApplies ? stallsidePassOnFeeCents(split.depositCents) : 0;
    return { amountCents: split.depositCents + fee, balanceCents: split.balanceCents };
  })();
  const activeUpsell = useMemo(
    () =>
      resolveCartUpsell({
        cartLines,
        products,
        standUpsell: upsell,
        pagePreOrderUpsells,
        standPreOrderUpsell: preOrderUpsell,
        rules: upsellRules,
      }),
    [cartLines, products, upsell, preOrderUpsell, pagePreOrderUpsells, upsellRules],
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
        line.maxStock,
        line.variantId,
      ),
    );
  }

  function finishOk(via: CartPaidVia) {
    persist([]);
    const sale = {
      standSlug,
      via: via === "square" || via === "pickup" ? "cash" : via,
      totalCents: total,
      currency,
    };
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
        claimFirstOrder: Boolean(firstOrder?.enabled && email),
        couponCode: discount.couponCode,
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
        claimFirstOrder: Boolean(firstOrder?.enabled && email),
        couponCode: discount.couponCode,
      });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("orderNumber" in result) finishOk("local_transfer");
    });
  }

  function placePickupOrder() {
    setError(null);
    startTransition(async () => {
      const result = await placePayAtPickupOrder({
        standSlug,
        items: payload,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        couponCode: discount.couponCode,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      finishOk("pickup");
    });
  }

  function payCard() {
    setError(null);
    setCardTabHint(false);
    if (needsContact && !customerName.trim()) {
      setError(
        deliver
          ? "Enter your name for delivery."
          : "Enter your name for collection.",
      );
      return;
    }
    if (needsContact && !customerEmail.trim()) {
      setError("Enter your email for order details.");
      return;
    }
    if (
      deliver &&
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
        customerName: needsContact ? customerName.trim() : undefined,
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: needsContact ? customerPhone.trim() : undefined,
        deliveryAddressLine1: deliver
          ? deliveryAddressLine1.trim()
          : undefined,
        deliverySuburb: deliver ? deliverySuburb.trim() : undefined,
        deliveryPostcode: deliver ? deliveryPostcode.trim() : undefined,
        deliveryNotes: deliver ? deliveryNotes.trim() : undefined,
        handoverMode: handover,
        buttonColour: shopButtonColour(rootRef.current),
        embedded: !isEmbeddedCheckout(),
        couponCode: discount.couponCode,
        payTiming: cardPayTiming,
      });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("embedded" in result) {
        setCardCheckout({ info: result.embedded, lines: cartLines });
        persist([]);
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

  if (cardCheckout) {
    return (
      <div className="mt-6">
        <StripeEmbeddedCheckout
          checkout={cardCheckout.info}
          onBack={() => {
            persist(cardCheckout.lines);
            setCardCheckout(null);
          }}
        />
      </div>
    );
  }

  if (done) {
    return (
      <CartDoneView
        paidVia={paidVia ?? "cash"}
        standSlug={standSlug}
        shopHref={backHref}
        restockStandId={restockStandId}
        showTapAndGo={!cardEnabled && !squareEnabled && !paypalEnabled}
      />
    );
  }

  if (lines.length === 0) return <CartEmptyView shopHref={backHref} />;

  return (
    <div ref={rootRef} className="mt-6 flex flex-col gap-4 pb-40">
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

      {handoverNote && !preOrderOnly && !hasMixedCart && (step === "cart" || (step === "pay" && !canChooseHandover)) ? (
        <p className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-base font-medium">
          {handoverNote}
        </p>
      ) : null}
      {hasMixedCart ? (
        <p className="text-lg text-[var(--gone)]">{CART_MIX_TAKE_NOW_PREORDER}</p>
      ) : handoverConflict ? (
        <p className="text-lg text-[var(--gone)]">{CART_MIX_HANDOVER}</p>
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
          squareEnabled={squareEnabled}
          paypalEnabled={paypalEnabled}
          paypalClientId={paypalClientId}
          paypalMerchantId={paypalMerchantId}
          paypalSandbox={paypalSandbox}
          currency={currency}
          standSlug={standSlug}
          items={payload}
          subtotalCents={total}
          shippingCents={shippingCents}
          cardFeeCents={cardFeeCents}
          cardTotalCents={cardTotalCents}
          squareTotalCents={squareTotalCents}
          squareDeposit={squareDeposit}
          localTransferLabel={localTransfer?.buttonLabel ?? null}
          pending={pending}
          showDemoCardHint={Boolean(demoProduct)}
          preOrderOnly={preOrderOnly}
          payAtPickup={payAtPickup}
          onPayAtPickup={placePickupOrder}
          payChoice={
            payTiming && payOptions.length > 1
              ? {
                  options: payOptions,
                  value: payTiming,
                  depositPercent: lines[0]?.product.depositPercent ?? null,
                  onChange: setPayPick,
                }
              : null
          }
          cardPayTiming={cardPayTiming}
          deliver={deliver}
          handoverChoice={
            canChooseHandover ? { value: handover, onChange: setHandoverPick } : null
          }
          firstOrderHint={firstOrderHint}
          couponCode={discount.couponCode}
          customerName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
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
          onSquareSuccess={() => {
            finishOk("square");
          }}
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

      {step === "cart" && discountChannel ? (
        <DiscountCodeField
          currency={currency}
          applied={discount.applied}
          check={discount.check}
          onApplied={discount.onApplied}
          showFirstOrderNote={Boolean(firstOrder?.enabled)}
        />
      ) : null}
      {step === "cart" ? (
        <CartTotalBar
          totalLabel={formatMoney(total, currency)}
          taxNote={
            addedTax && taxAddedCents > 0
              ? `Includes ${addedTax.name.toLowerCase()} ${formatMoney(taxAddedCents, currency)} (${formatTaxRate(addedTax.rateBps)})`
              : null
          }
          disabled={pending || total <= 0}
          onContinue={() => {
            if (hasMixedCart) {
              setError(CART_MIX_TAKE_NOW_PREORDER);
              return;
            }
            if (handoverConflict) {
              setError(CART_MIX_HANDOVER);
              return;
            }
            setError(null);
            setStep("pay");
          }}
        />
      ) : null}
    </div>
  );
}
