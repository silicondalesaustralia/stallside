import { CommerceProvider } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const ownerSelect = {
  id: true,
  businessName: true,
  contactEmail: true,
  billingCurrency: true,
  subscriptionPlan: true,
  onlinePaymentProvider: true,
  user: { select: { email: true } },
} as const;

export async function listSquareConnections() {
  return prisma.externalCommerceConnection.findMany({
    where: { provider: CommerceProvider.SQUARE },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      merchantName: true,
      providerMerchantId: true,
      primaryLocationId: true,
      paymentsEnabled: true,
      catalogSyncEnabled: true,
      inventorySyncEnabled: true,
      lastSyncAt: true,
      lastError: true,
      disconnectedAt: true,
      createdAt: true,
      owner: { select: ownerSelect },
      _count: { select: { variantMappings: true } },
    },
  });
}

export async function listStripeConnections() {
  return prisma.owner.findMany({
    where: { stripeAccountId: { not: null }, deletedAt: null },
    orderBy: [{ stripeChargesEnabled: "desc" }, { stripeConnectStartedAt: "desc" }],
    select: {
      ...ownerSelect,
      stripeAccountId: true,
      stripeOnboardingComplete: true,
      stripeChargesEnabled: true,
      stripePayoutsEnabled: true,
      stripeConnectStartedAt: true,
    },
  });
}

export function formatAdminDate(d: Date | null): string {
  return d
    ? d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
    : "-";
}

export type SquareConnectionRow = Awaited<ReturnType<typeof listSquareConnections>>[number];
export type StripeConnectionRow = Awaited<ReturnType<typeof listStripeConnections>>[number];
