import { prisma } from "@/lib/prisma";
import { OnlinePaymentProvider } from "@/generated/prisma/client";
import { isSquarePaymentsEnabled, squareApplicationId } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";

/** Validate seller Square rail; returns app + location for Web Payments SDK. */
export async function loadSquarePayConfig(standSlug: string) {
  if (!isSquarePaymentsEnabled()) {
    return { error: "Square payments are not enabled." };
  }
  const applicationId = squareApplicationId();
  if (!applicationId) return { error: "Square is not configured." };

  const stand = await prisma.stand.findFirst({
    where: { slug: standSlug, isActive: true },
    select: {
      acceptSquare: true,
      currency: true,
      owner: {
        select: {
          id: true,
          billingCurrency: true,
          onlinePaymentProvider: true,
        },
      },
    },
  });
  if (!stand) return { error: "Stand not found." };
  if (!stand.acceptSquare) {
    return { error: "This stand is not accepting card payments." };
  }
  if (!squareEligibleBillingCurrency(stand.owner.billingCurrency)) {
    return { error: "Square checkout is only available for Australian sellers." };
  }
  if (stand.owner.onlinePaymentProvider !== OnlinePaymentProvider.SQUARE) {
    return { error: "Seller is not using Square for online payments." };
  }

  const conn = await getSquareConnection(stand.owner.id);
  if (
    !conn ||
    conn.status !== "ACTIVE" ||
    !conn.paymentsEnabled ||
    !conn.primaryLocationId
  ) {
    return { error: "Seller Square connection is not ready." };
  }

  return {
    applicationId,
    locationId: conn.primaryLocationId,
    currency: stand.currency,
    countryCode: "AU" as const,
  };
}
