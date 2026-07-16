import Link from "next/link";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import PaymentIconRow from "@/components/PaymentIconRow";
import type { LocalTransferMethod } from "@/lib/local-transfer";

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
  acceptPayPal,
  cardReady,
  paypalReady,
  paypalConnectAvailable,
  cardTier,
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
          disabled={!cardTier || !cardReady}
          className="mt-1 size-4 disabled:opacity-50"
        />
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2 font-medium">
            <PaymentIconRow brands={["card", "apple", "google"]} />
            Card / Tap &amp; Go
          </span>
          <span className="mt-0.5 block text-[var(--muted)]">
            {!cardTier
                ? "Card plan feature — subscribe under Settings → Billing."
              : cardReady
                ? "Card, Apple Pay, Google Pay. Money to your Stripe."
                : "Finish Stripe setup in Settings before enabling."}
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="acceptPayPal"
          defaultChecked={acceptPayPal}
          disabled={!cardTier || !paypalReady || !paypalConnectAvailable}
          className="mt-1 size-4 disabled:opacity-50"
        />
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2 font-medium">
            <PaymentBrandIcon brand="paypal" />
            PayPal
            {!paypalConnectAvailable && cardTier ? (
              <span className="text-xs font-medium text-[var(--muted)]">
                · Coming soon
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-[var(--muted)]">
            {!cardTier
              ? "Card plan feature."
              : !paypalConnectAvailable
                ? "PayPal checkout is coming soon."
                : paypalReady
                  ? "All currencies, including USD."
                  : "Connect PayPal in Settings and turn it on first."}
          </span>
        </span>
      </label>

      {cardTier ? (
        <p className="text-sm">
          <Link
            href="/dashboard/settings"
            className="font-medium text-[var(--leaf-dark)] underline"
          >
            Manage Stripe &amp; PayPal Connect
          </Link>
        </p>
      ) : null}
    </>
  );
}
