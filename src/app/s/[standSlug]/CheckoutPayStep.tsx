"use client";

import PayPalCheckoutButton from "./PayPalCheckoutButton";

type CartItem = { productId: string; quantity: number };

type CheckoutPayStepProps = {
  cashEnabled: boolean;
  cardEnabled: boolean;
  paypalEnabled: boolean;
  paypalClientId: string | null;
  paypalMerchantId: string | null;
  currency: string;
  standSlug: string;
  items: CartItem[];
  localTransferLabel: string | null;
  pending: boolean;
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
  currency,
  standSlug,
  items,
  localTransferLabel,
  pending,
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
          className="rounded-[var(--radius)] bg-[var(--leaf)] px-5 py-5 text-left text-xl font-semibold text-white disabled:opacity-50"
        >
          Pay cash
        </button>
      ) : null}
      {localTransferLabel ? (
        <button
          type="button"
          disabled={pending}
          onClick={onLocalTransfer}
          className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-left text-xl font-semibold disabled:opacity-50"
        >
          {localTransferLabel}
        </button>
      ) : null}
      {cardEnabled ? (
        <button
          type="button"
          disabled={pending}
          onClick={onCard}
          className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-5 py-5 text-left text-xl font-semibold disabled:opacity-50"
        >
          {pending ? "Opening checkout…" : "Tap & Go - card, Apple Pay, Google Pay"}
        </button>
      ) : null}
      {showPayPal && paypalClientId && paypalMerchantId ? (
        <PayPalCheckoutButton
          clientId={paypalClientId}
          merchantId={paypalMerchantId}
          currency={currency}
          standSlug={standSlug}
          items={items}
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
