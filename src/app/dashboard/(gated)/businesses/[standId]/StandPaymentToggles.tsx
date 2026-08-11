import Link from "next/link";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import PaymentIconRow from "@/components/PaymentIconRow";
import type { LocalTransferMethod } from "@/lib/local-transfer";
import { STRIPE_CHECKOUT_BRANDS } from "@/lib/payment-brand-assets";

type StandPaymentTogglesProps = {
  method: LocalTransferMethod | null;
  initialAlias: string;
  acceptCash: boolean;
  acceptLocalTransfer: boolean;
  acceptCard: boolean;
  acceptPayPal: boolean;
  cardReady: boolean;
  paypalReady: boolean;
  paypalConnectAvailable: boolean;
  cardTier: boolean;
};

export default function StandPaymentToggles({
  method,
  initialAlias,
  acceptCash,
  acceptLocalTransfer,
  acceptCard,
  acceptPayPal: _acceptPayPal,
  cardReady,
  paypalReady: _paypalReady,
  paypalConnectAvailable: _paypalConnectAvailable,
  cardTier: _cardTier,
}: StandPaymentTogglesProps) {
  return (
    <>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="acceptCash"
          defaultChecked={acceptCash}
          className="mt-1 size-4"
        />
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2 font-medium">
            <PaymentBrandIcon brand="cash" />
            Cash
          </span>
          <span className="mt-0.5 block text-[var(--muted)]">
            Customer confirms they paid cash at the stand.
          </span>
        </span>
      </label>

      {method ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--wash)] p-4">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="acceptLocalTransfer"
              defaultChecked={acceptLocalTransfer}
              className="mt-1 size-4"
            />
            <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 font-medium">
                  <PaymentBrandIcon brand="payid" className="size-6" />
                  <span className="sr-only">PayID</span>
                </span>
              <span className="mt-0.5 block text-[var(--muted)]">
                AUD only. Customer pays your PayID, then confirms.
              </span>
            </span>
          </label>
          <input type="hidden" name="localTransferMethodId" value={method.id} />
          <label className="mt-3 flex flex-col gap-2 text-sm">
            <span className="font-medium">{method.aliasLabel}</span>
            <input
              name="localTransferAlias"
              defaultValue={initialAlias}
              placeholder={method.aliasPlaceholder}
              maxLength={120}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
            />
            <span className="text-[var(--muted)]">{method.aliasHint}</span>
          </label>
        </div>
      ) : null}

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="acceptCard"
          defaultChecked={acceptCard}
          disabled={!cardReady}
          className="mt-1 size-4 disabled:opacity-50"
        />
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2 font-medium">
            <PaymentIconRow brands={STRIPE_CHECKOUT_BRANDS} />
            Card / Tap &amp; Go
          </span>
          <span className="mt-0.5 block text-[var(--muted)]">
            {cardReady
              ? "Card, Apple Pay, Google Pay, and Buy Now Pay Later on larger orders. Money to your Stripe."
              : "Finish Stripe setup in Settings before enabling."}
          </span>
        </span>
      </label>

      <p className="text-sm">
        <Link
          href="/dashboard/settings/stripe"
          className="font-medium text-[var(--leaf-dark)] underline"
        >
          Manage Stripe Connect
        </Link>
      </p>
    </>
  );
}
