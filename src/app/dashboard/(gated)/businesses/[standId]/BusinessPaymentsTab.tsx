import type { ReactNode } from "react";
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
  square,
  overview,
}: {
  square: { accept: boolean; ready: boolean; isProvider: boolean } | null;
  overview: ReactNode;
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
    <div className="flex w-full flex-col gap-6">
      {overview}
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
        square={square}
      />
    </div>
  );
}
