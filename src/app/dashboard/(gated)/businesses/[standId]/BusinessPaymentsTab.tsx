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
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-sm text-[var(--muted)]">
        Choose how customers can pay on this business&apos;s checkout.
      </p>
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
