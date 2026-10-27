import { prisma } from "@/lib/prisma";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";
import {
  isSquareConnectEnabled,
  isSquareIntegrationEnabled,
  isSquareSubscriptionsEnabled,
} from "@/lib/square/config";
import { isPayPalConnectAvailable } from "@/lib/paypal";
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
  paypalMerchantId: string | null;
  paypalOnboardingComplete: boolean;
};

/** Account-wide payment connections, plus the Stripe vs Square choice in Square regions. */
export default async function PaymentsOverview({ owner }: { owner: OverviewOwner }) {
  const squareRegion =
    isSquareIntegrationEnabled() && squareEligibleBillingCurrency(owner.billingCurrency);
  const conn = squareRegion && isSquareConnectEnabled() ? await getSquareConnection(owner.id) : null;
  const squareActive = conn?.status === "ACTIVE";
  const squareSubscriptionsOn = Boolean(
    isSquareSubscriptionsEnabled() &&
      conn?.paymentsEnabled &&
      conn.subscriptionsEnabled &&
      owner.onlinePaymentProvider === "SQUARE",
  );
  const activeOfferCount = squareActive && !squareSubscriptionsOn
    ? await prisma.subscriptionOffer.count({
        where: { ownerId: owner.id, isActive: true },
      })
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {squareRegion ? <PaymentProviderGuide weeklyPayouts={isV2026Owner(owner)} /> : null}
      <PaymentConnectionLinks
        stripeStatus={
          owner.stripeChargesEnabled
            ? "Connected"
            : owner.stripeAccountId
              ? "Finish setup"
              : "Not connected"
        }
        squareStatus={
          !squareRegion
            ? null
            : squareActive
              ? conn?.paymentsEnabled
                ? "Connected"
                : "Finish setup"
              : "Not connected"
        }
        paypalStatus={
          isPayPalConnectAvailable()
            ? owner.paypalMerchantId && owner.paypalOnboardingComplete
              ? "Connected"
              : "Not connected"
            : null
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
