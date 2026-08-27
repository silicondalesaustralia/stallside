import TapAndGoSetupCard from "@/components/TapAndGoSetupCard";
import { CASH_AND_LOCAL_PAYMENTS_LABEL } from "@/lib/stripe-connect-copy";
import StandPaymentOptions from "./StandPaymentOptions";

export default function BusinessPaymentsTab({
  standId,
  currency,
  localTransferAlias,
  localTransferMethodId,
  acceptCash,
  acceptLocalTransfer,
  acceptCard,
  acceptPayPal,
  cardReady,
  paypalReady,
  paypalConnectAvailable,
  cardTier,
  stripeConnected,
  stripeStarted,
  productCount,
}: {
  standId: string;
  currency: string;
  localTransferAlias: string | null;
  localTransferMethodId: string | null;
  acceptCash: boolean;
  acceptLocalTransfer: boolean;
  acceptCard: boolean;
  acceptPayPal: boolean;
  cardReady: boolean;
  paypalReady: boolean;
  paypalConnectAvailable: boolean;
  cardTier: boolean;
  stripeConnected: boolean;
  stripeStarted: boolean;
  productCount: number;
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-sm text-[var(--muted)]">
        Choose how customers can pay at checkout. {CASH_AND_LOCAL_PAYMENTS_LABEL}{" "}
        work without Stripe. Card, pre-orders, and subscriptions need Stripe.
      </p>
      {productCount > 0 ? (
        <TapAndGoSetupCard
          cardTier={cardTier}
          stripeConnected={stripeConnected}
          stripeStarted={stripeStarted}
          urgent={stripeStarted && !stripeConnected}
        />
      ) : null}
      <StandPaymentOptions
        standId={standId}
        currency={currency}
        localTransferAlias={localTransferAlias}
        localTransferMethodId={localTransferMethodId}
        acceptCash={acceptCash}
        acceptLocalTransfer={acceptLocalTransfer}
        acceptCard={acceptCard}
        acceptPayPal={acceptPayPal}
        cardReady={cardReady}
        paypalReady={paypalReady}
        paypalConnectAvailable={paypalConnectAvailable}
        cardTier={cardTier}
      />
    </div>
  );
}
