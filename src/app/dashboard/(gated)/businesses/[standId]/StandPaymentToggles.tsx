import Link from "next/link";
import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import PaymentIconRow from "@/components/PaymentIconRow";
import type { LocalTransferMethod } from "@/lib/local-transfer";
import { STRIPE_CHECKOUT_BRANDS } from "@/lib/payment-brand-assets";
import { STRIPE_CHECKOUT_METHODS_PHRASE } from "@/lib/stripe-connect-copy";
import CheckoutPaymentRow from "./CheckoutPaymentRow";
import StandPayPalToggle from "./StandPayPalToggle";
import StandSquareToggle from "./StandSquareToggle";

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
  square: { accept: boolean; ready: boolean; isProvider: boolean } | null;
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
  square,
}: StandPaymentTogglesProps) {
  return (
    <div className="flex flex-col divide-y divide-[var(--line)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          At pickup
        </p>
        <CheckoutPaymentRow
          name="acceptCash"
          checked={acceptCash}
          label={
            <>
              <PaymentBrandIcon brand="cash" />
              Cash
            </>
          }
          hint="Customer confirms they paid cash at the stand."
        />
        {method?.id === "payid" ? (
          <CheckoutPaymentRow
            name="acceptLocalTransfer"
            checked={acceptLocalTransfer}
            label={
              <>
                <PaymentBrandIcon brand="payid" className="size-6" />
                PayID
              </>
            }
            hint="Customer pays your PayID, then confirms."
          >
            <input type="hidden" name="localTransferMethodId" value={method.id} />
            <label className="ml-7 flex flex-col gap-2 text-sm">
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
          </CheckoutPaymentRow>
        ) : null}
      </div>

      <div className="pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Card &amp; wallets
        </p>
        <CheckoutPaymentRow
          name="acceptCard"
          checked={acceptCard}
          disabled={!cardReady}
          label={
            <>
              <PaymentIconRow brands={STRIPE_CHECKOUT_BRANDS} />
              Card / Tap &amp; Go
            </>
          }
          hint={
            cardReady
              ? `${STRIPE_CHECKOUT_METHODS_PHRASE}. Money to your Stripe.`
              : "Connect Stripe above first."
          }
        />
        {square ? (
          <StandSquareToggle
            acceptSquare={square.accept}
            squareReady={square.ready}
            squareIsProvider={square.isProvider}
          />
        ) : null}
        {paypalConnectAvailable ? (
          <StandPayPalToggle
            acceptPayPal={acceptPayPal}
            paypalReady={paypalReady}
            proAccess={cardTier}
          />
        ) : null}
        {!cardTier && paypalConnectAvailable ? (
          <p className="pb-1 pt-1 text-sm">
            <Link
              href="/dashboard/settings/billing"
              className="font-medium text-[var(--leaf-dark)] underline"
            >
              Upgrade to Pro for PayPal
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
