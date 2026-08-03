"use client";

import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import PaymentIconRow from "@/components/PaymentIconRow";
import DemoCardHint from "@/components/DemoCardHint";
import { STRIPE_CHECKOUT_BRANDS } from "@/lib/payment-brand-assets";
import { formatMoney } from "@/lib/public-product";
import CardInterestButton from "./CardInterestButton";
import PayPalCheckoutButton from "./PayPalCheckoutButton";
import PreOrderContactFields from "./PreOrderContactFields";

type CartItem = {
  productId: string;
  quantity: number;
  choiceIds?: string[];
};

type CheckoutPayStepProps = {
  cashEnabled: boolean;
  cardEnabled: boolean;
  paypalEnabled: boolean;
  paypalClientId: string | null;
  paypalMerchantId: string | null;
  paypalSandbox: boolean;
  currency: string;
  standSlug: string;
  items: CartItem[];
  /** Cart total for card-demand logging. */
  subtotalCents?: number;
  /** Pass-on Stallside fee (0 when absorb or Pro). */
  cardFeeCents?: number;
  cardTotalCents?: number;
  localTransferLabel: string | null;
  pending: boolean;
  showDemoCardHint?: boolean;
  /** Pre-order carts: card only + name/email/phone. */
  preOrderOnly?: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onCustomerName: (v: string) => void;
  onCustomerEmail: (v: string) => void;
  onCustomerPhone: (v: string) => void;
  onCash: () => void;
  onLocalTransfer: () => void;
  onCard: () => void;
  onPayPalError: (message: string) => void;
  onBack: () => void;
};

export default function CheckoutPayStep({
  cashEnabled,
  cardEnabled,
  paypalEnabled,
  paypalClientId,
  paypalMerchantId,
  paypalSandbox,
  currency,
  standSlug,
  items,
  subtotalCents = 0,
  cardFeeCents = 0,
  cardTotalCents = 0,
  localTransferLabel,
  pending,
  showDemoCardHint = false,
  preOrderOnly = false,
  customerName,
  customerEmail,
  customerPhone,
  onCustomerName,
  onCustomerEmail,
  onCustomerPhone,
  onCash,
  onLocalTransfer,
  onCard,
  onPayPalError,
  onBack,
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
        />
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
                (!customerName.trim() || !customerEmail.trim()))
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
                  Card, Apple Pay, Google Pay - and pay later on larger orders
                </span>
              ) : null}
            </span>
            {!pending ? (
              <span className="flex w-full justify-center rounded-[var(--radius)] bg-[var(--wash)] px-3 py-3 text-[var(--ink)]">
                <PaymentIconRow
                  brands={STRIPE_CHECKOUT_BRANDS}
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
          items={items}
          sandbox={paypalSandbox}
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
        Back to cart
      </button>
    </div>
  );
}
