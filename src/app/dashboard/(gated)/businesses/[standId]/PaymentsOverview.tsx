import { prisma } from "@/lib/prisma";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";
import { isSquareConnectEnabled } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";
import { isV2026Owner } from "@/lib/fee-v2026";
import { shouldChargeVendlFee } from "@/lib/stallside-fee";
import PaymentConnectionLinks from "./PaymentConnectionLinks";
import PaymentProviderGuide from "./PaymentProviderGuide";
import CheckoutProviderSection from "./CheckoutProviderSection";

type OverviewOwner = Parameters<typeof shouldChargeVendlFee>[0] & {
  id: string;
  billingCurrency: string | null;
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
  onlinePaymentProvider: string;
};

/** Account-wide payment choices (Stripe vs Square) shown above per-business toggles. Square regions only. */
export default async function PaymentsOverview({ owner }: { owner: OverviewOwner }) {
  if (!squareEligibleBillingCurrency(owner.billingCurrency)) return null;

  const conn = isSquareConnectEnabled() ? await getSquareConnection(owner.id) : null;
  const squareActive = conn?.status === "ACTIVE";
  const activeOfferCount = squareActive
    ? await prisma.subscriptionOffer.count({
        where: { ownerId: owner.id, isActive: true },
      })
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <PaymentProviderGuide v2026={isV2026Owner(owner)} />
      <PaymentConnectionLinks
        stripeStatus={
          owner.stripeChargesEnabled
            ? "Connected"
            : owner.stripeAccountId
              ? "Finish setup"
              : "Not connected"
        }
        squareStatus={
          squareActive
            ? conn?.paymentsEnabled
              ? "Connected"
              : "Finish setup"
            : "Not connected"
        }
      />
      {squareActive && conn ? (
        <CheckoutProviderSection
          current={owner.onlinePaymentProvider}
          squarePaymentsReady={conn.paymentsEnabled}
          stripeReady={owner.stripeChargesEnabled}
          feeApplies={shouldChargeVendlFee(owner)}
          activeOfferCount={activeOfferCount}
        />
      ) : null}
    </div>
  );
}
