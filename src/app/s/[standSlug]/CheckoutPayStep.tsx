"use client";

import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import PaymentIconRow from "@/components/PaymentIconRow";
import DemoCardHint from "@/components/DemoCardHint";
import { stripeCheckoutBrandsForCurrency } from "@/lib/payment-brand-assets";
import { formatMoney } from "@/lib/public-product";
import CardInterestButton from "./CardInterestButton";
import PayPalCheckoutButton from "./PayPalCheckoutButton";
import PreOrderContactFields from "./PreOrderContactFields";

type CartItem = {
  productId: string;
  quantity: number;
  choiceIds?: string[];
  asUpsell?: boolean;
};

type CheckoutPayStepProps = {
  cashEnabled: boolean;
  cardEnabled: boolean;
  paypalEnabled: boolean;
  paypalClientId: string | null;
  paypalMerchantId: string | null;
  paypalSandbox: boolean;
  paypalMarketplace?: boolean;
  currency: string;
  standSlug: string;
  items?: CartItem[];
  customerChoiceAmountCents?: number;
  /** Cart total for card-demand logging. */
  subtotalCents?: number;
  /** Pass-on Vendl fee (0 when absorb or Pro). */
  cardFeeCents?: number;
  cardTotalCents?: number;
  localTransferLabel: string | null;
  pending: boolean;
  showDemoCardHint?: boolean;
  /** Pre-order carts: card only + name/email/phone. */
  preOrderOnly?: boolean;
  deliverOnly?: boolean;
  /** Offer first-order discount when email provided. */
  firstOrderHint?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  couponCode?: string;
  onCouponCode?: (v: string) => void;
  deliveryAddressLine1?: string;
  deliverySuburb?: string;
  deliveryPostcode?: string;
  deliveryNotes?: string;
  onCustomerName: (v: string) => void;
  onCustomerEmail: (v: string) => void;
  onCustomerPhone: (v: string) => void;
  onDeliveryAddressLine1?: (v: string) => void;
  onDeliverySuburb?: (v: string) => void;
  onDeliveryPostcode?: (v: string) => void;
  onDeliveryNotes?: (v: string) => void;
  onCash: () => void;
  onLocalTransfer: () => void;
  onCard: () => void;
  onPayPalError: (message: string) => void;
  onBack: () => void;
  backLabel?: string;
};

export default function CheckoutPayStep({
  cashEnabled,
  cardEnabled,
  paypalEnabled,
  paypalClientId,
  paypalMerchantId,
  paypalSandbox,
  paypalMarketplace = false,
  currency,
  standSlug,
  items = [],
  customerChoiceAmountCents,
  subtotalCents = 0,
  cardFeeCents = 0,
  cardTotalCents = 0,
  localTransferLabel,
  pending,
  showDemoCardHint = false,
  preOrderOnly = false,
  deliverOnly = false,
  firstOrderHint = null,
  customerName,
  customerEmail,
  customerPhone,
  couponCode = "",
  onCouponCode,
  deliveryAddressLine1 = "",
  deliverySuburb = "",
  deliveryPostcode = "",
  deliveryNotes = "",
  onCustomerName,
  onCustomerEmail,
  onCustomerPhone,
  onDeliveryAddressLine1,
  onDeliverySuburb,
  onDeliveryPostcode,
  onDeliveryNotes,
  onCash,
  onLocalTransfer,
  onCard,
  onPayPalError,
  onBack,
  backLabel = "Back to cart",
}: CheckoutPayStepProps) {
  const showCash = cashEnabled && !preOrderOnly;
  const showLt = Boolean(localTransferLabel) && !preOrderOnly;
  const showPayPal =
    !preOrderOnly &&
    paypalEnabled &&
    Boolean(paypalClientId && paypalMerchantId);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xl font-semibold">
        {preOrderOnly ? "Pay to reserve your order" : "How would you like to pay?"}
      </p>
      {preOrderOnly ? (
        <PreOrderContactFields
          customerName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
          onCustomerName={onCustomerName}
          onCustomerEmail={onCustomerEmail}
          onCustomerPhone={onCustomerPhone}
          deliver={deliverOnly}
          deliveryAddressLine1={deliveryAddressLine1}
          deliverySuburb={deliverySuburb}
          deliveryPostcode={deliveryPostcode}
          deliveryNotes={deliveryNotes}
          onDeliveryAddressLine1={onDeliveryAddressLine1}
          onDeliverySuburb={onDeliverySuburb}
          onDeliveryPostcode={onDeliveryPostcode}
          onDeliveryNotes={onDeliveryNotes}
        />
      ) : firstOrderHint ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{firstOrderHint}</span>
          <input
            type="email"
            autoComplete="email"
            value={customerEmail}
            onChange={(e) => onCustomerEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base"
          />
        </label>
      ) : null}
      {onCouponCode ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Promo code (optional)</span>
          <input
            value={couponCode}
            onChange={(e) => onCouponCode(e.target.value.toUpperCase())}
            placeholder="WELCOME10"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base uppercase tracking-wide"
            autoCapitalize="characters"
          />
        </label>
      ) : null}
      {showCash ? (
        <button
          type="button"
          disabled={pending}
          onClick={onCash}
          className="flex items-center gap-4 rounded-[var(--radius)] bg-[var(--leaf)] px-5 py-5 text-left text-xl font-semibold text-white disabled:opacity-50"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
            <PaymentBrandIcon brand="cash" className="size-7" />
          </span>
          <span>Pay cash</span>
        </button>
      ) : null}
      {showLt ? (
        <button
          type="button"
          disabled={pending}
          onClick={onLocalTransfer}
          className="flex items-center gap-4 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-left text-xl font-semibold disabled:opacity-50"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--wash)]">
            <PaymentBrandIcon brand="payid" className="size-7" />
          </span>
          <span>{localTransferLabel}</span>
        </button>
      ) : null}
      {cardEnabled ? (
        <>
          {cardFeeCents > 0 ? (
            <p className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--muted)]">
              Subtotal {formatMoney(subtotalCents, currency)} · Card fee{" "}
              {formatMoney(cardFeeCents, currency)} · Total{" "}
              {formatMoney(cardTotalCents || subtotalCents + cardFeeCents, currency)}
            </p>
          ) : null}
          <button
            type="button"
            disabled={
              pending ||
              (preOrderOnly &&
                (!customerName.trim() ||
                  !customerEmail.trim() ||
                  (deliverOnly &&
                    (!deliveryAddressLine1.trim() ||
                      !deliverySuburb.trim() ||
                      !deliveryPostcode.trim()))))
            }
            onClick={onCard}
            className="flex flex-col gap-3 rounded-[var(--radius)] border-2 border-[var(--field)] bg-[var(--panel)] px-5 py-4 text-left disabled:opacity-50"
          >
            <span className="min-w-0">
              <span className="block text-xl font-semibold text-[var(--ink)]">
                {pending
                  ? "Opening checkout…"
                  : "Checkout via credit card or these options:"}
              </span>
              {!pending ? (
                <span className="mt-0.5 block text-base font-normal text-[var(--muted)]">
                  Card, Apple Pay, Google Pay
                  {currency.toUpperCase() === "AUD" ? ", PayTo" : ""} - and pay
                  later on larger orders
                </span>
              ) : null}
            </span>
            {!pending ? (
              <span className="flex w-full justify-center rounded-[var(--radius)] bg-[var(--wash)] px-3 py-3 text-[var(--ink)]">
                <PaymentIconRow
                  brands={stripeCheckoutBrandsForCurrency(currency)}
                  className="w-full justify-center gap-2.5"
                  size="lg"
                />
              </span>
            ) : null}
          </button>
          {showDemoCardHint ? <DemoCardHint /> : null}
        </>
      ) : null}
      {showPayPal && paypalClientId && paypalMerchantId ? (
        <PayPalCheckoutButton
          clientId={paypalClientId}
          merchantId={paypalMerchantId}
          currency={currency}
          standSlug={standSlug}
          items={customerChoiceAmountCents != null ? undefined : items}
          customerChoiceAmountCents={customerChoiceAmountCents}
          sandbox={paypalSandbox}
          marketplace={paypalMarketplace}
          disabled={pending}
          onError={onPayPalError}
        />
      ) : null}
      {!showCash && !showLt && !cardEnabled && !showPayPal ? (
        <p className="rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-lg text-[var(--muted)]">
          No payment methods are available at this stand right now.
        </p>
      ) : null}
      {!cardEnabled && !preOrderOnly ? (
        <CardInterestButton
          standSlug={standSlug}
          subtotalCents={subtotalCents}
          currency={currency}
        />
      ) : null}
      <button
        type="button"
        onClick={onBack}
        className="mt-1 w-full rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-lg font-semibold text-[var(--ink)]"
      >
        {backLabel}
      </button>
    </div>
  );
}
