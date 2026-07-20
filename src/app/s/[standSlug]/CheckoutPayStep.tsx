"use client";

import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import PaymentIconRow from "@/components/PaymentIconRow";
import DemoCardHint from "@/components/DemoCardHint";
import PayPalCheckoutButton from "./PayPalCheckoutButton";

type CartItem = { productId: string; quantity: number };

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
  localTransferLabel: string | null;
  pending: boolean;
  showDemoCardHint?: boolean;
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
  localTransferLabel,
  pending,
  showDemoCardHint = false,
  onCash,
  onLocalTransfer,
  onCard,
  onPayPalError,
  onBack,
}: CheckoutPayStepProps) {
  const showPayPal =
    paypalEnabled && Boolean(paypalClientId && paypalMerchantId);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xl font-semibold">How would you like to pay?</p>
      {cashEnabled ? (
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
      {localTransferLabel ? (
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
          <button
            type="button"
            disabled={pending}
            onClick={onCard}
            className="flex items-center gap-4 rounded-[var(--radius)] border-2 border-[var(--field)] bg-[var(--panel)] px-5 py-4 text-left disabled:opacity-50"
          >
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--wash)] px-3 py-2.5 text-[var(--ink)]">
              <PaymentIconRow brands={["card", "apple", "google"]} className="gap-2" />
            </span>
            <span className="min-w-0">
              <span className="block text-xl font-semibold text-[var(--ink)]">
                {pending ? "Opening checkout…" : "Card / Tap & Go"}
              </span>
              {!pending ? (
                <span className="mt-0.5 block text-base font-normal text-[var(--muted)]">
                  Card, Apple Pay or Google Pay
                </span>
              ) : null}
            </span>
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
      {!cashEnabled && !localTransferLabel && !cardEnabled && !showPayPal ? (
        <p className="rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-lg text-[var(--muted)]">
          No payment methods are available at this stand right now.
        </p>
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
