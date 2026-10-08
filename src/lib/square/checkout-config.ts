import { prisma } from "@/lib/prisma";
import { OnlinePaymentProvider } from "@/generated/prisma/client";
import { isSquarePaymentsEnabled, squareApplicationId } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";
import {
  squareConnectionMatchesBilling,
  squareRegionForBilling,
} from "@/lib/commerce/payment-rail";

/** Validate seller Square rail; returns app + location for Web Payments SDK. */
export async function loadSquarePayConfig(standSlug: string) {
  if (!isSquarePaymentsEnabled()) {
    return { error: "Square payments are not enabled." };
  }

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
  const region = squareRegionForBilling(stand.owner.billingCurrency);
  if (!region) {
    return { error: "Square checkout isn't available in this seller's region." };
  }
  const applicationId = squareApplicationId(region);
  if (!applicationId) return { error: "Square is not configured." };
  if (stand.owner.onlinePaymentProvider !== OnlinePaymentProvider.SQUARE) {
    return { error: "Seller is not using Square for online payments." };
  }

  const conn = await getSquareConnection(stand.owner.id);
  if (
    !conn ||
    conn.status !== "ACTIVE" ||
    !conn.paymentsEnabled ||
    !conn.primaryLocationId ||
    !squareConnectionMatchesBilling(conn, stand.owner.billingCurrency)
  ) {
    return { error: "Seller Square connection is not ready." };
  }

  return {
    applicationId,
    locationId: conn.primaryLocationId,
    currency: stand.currency,
    countryCode: region,
  };
}
