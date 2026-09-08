"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isSquareConnectEnabled } from "@/lib/square/config";
import {
  buildSquareAuthorizeUrl,
  createOAuthState,
} from "@/lib/square/oauth";
import {
  disconnectSquare,
  getSquareConnection,
  getValidSquareAccessToken,
} from "@/lib/square/connection";
import { listSquareCatalogItems, suggestCatalogMatches } from "@/lib/square/catalog";
import { OnlinePaymentProvider } from "@/generated/prisma/client";
import {
  assertOnlineProviderAllowed,
  squareEligibleBillingCurrency,
} from "@/lib/commerce/payment-rail";

export async function startSquareConnect(): Promise<void> {
  if (!isSquareConnectEnabled()) {
    throw new Error("Square is not enabled.");
  }
  const { owner } = await requireOwner();
  if (!squareEligibleBillingCurrency(owner.billingCurrency)) {
    throw new Error("Square is only available for Australian (AUD) accounts.");
  }
  const state = createOAuthState();
  const jar = await cookies();
  jar.set("square_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  const url = buildSquareAuthorizeUrl(state);
  if (!url) throw new Error("Square app credentials missing.");
  redirect(url);
}

export async function disconnectSquareAction() {
  const { owner } = await requireOwner();
  await disconnectSquare(owner.id);
  revalidatePath("/dashboard/settings/square");
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings/square?disconnected=1");
}

export async function updateSquareCapabilities(input: {
  paymentsEnabled: boolean;
  inventorySyncEnabled: boolean;
  catalogSyncEnabled: boolean;
}) {
  const { owner } = await requireOwner();
  const conn = await getSquareConnection(owner.id);
  if (!conn || conn.status !== "ACTIVE") {
    return { error: "Connect Square first." };
  }
  await prisma.externalCommerceConnection.update({
    where: { id: conn.id },
    data: {
      paymentsEnabled: input.paymentsEnabled,
      inventorySyncEnabled: input.inventorySyncEnabled,
      catalogSyncEnabled: input.catalogSyncEnabled,
    },
  });
  revalidatePath("/dashboard/settings/square");
  return { ok: true as const };
}

export async function setOnlinePaymentProvider(
  provider: "STRIPE" | "SQUARE",
) {
  const { owner } = await requireOwner();
  try {
    assertOnlineProviderAllowed(owner.billingCurrency, provider);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Square is only available for Australian accounts.",
    };
  }
  if (provider === "SQUARE") {
    const conn = await getSquareConnection(owner.id);
    if (!conn?.paymentsEnabled || conn.status !== "ACTIVE") {
      return { error: "Enable Square payments on a healthy connection first." };
    }
  }
  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      onlinePaymentProvider:
        provider === "SQUARE"
          ? OnlinePaymentProvider.SQUARE
          : OnlinePaymentProvider.STRIPE,
    },
  });
  revalidatePath("/dashboard/settings/square");
  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}

export async function setPrimarySquareLocation(locationId: string) {
  const { owner } = await requireOwner();
  const conn = await getSquareConnection(owner.id);
  if (!conn) return { error: "Not connected." };
  const loc = conn.locations.find((l) => l.providerLocationId === locationId);
  if (!loc) return { error: "Unknown location." };

  await prisma.$transaction([
    prisma.externalCommerceConnection.update({
      where: { id: conn.id },
      data: { primaryLocationId: locationId },
    }),
    prisma.externalLocationMapping.updateMany({
      where: { connectionId: conn.id },
      data: { isPrimary: false },
    }),
    prisma.externalLocationMapping.update({
      where: { id: loc.id },
      data: { isPrimary: true },
    }),
  ]);
  revalidatePath("/dashboard/settings/square");
  return { ok: true as const };
}

export async function mapSquareLocationToStand(input: {
  providerLocationId: string;
  standId: string | null;
}) {
  const { owner } = await requireOwner();
  const conn = await getSquareConnection(owner.id);
  if (!conn) return { error: "Not connected." };
  if (input.standId) {
    const stand = await prisma.stand.findFirst({
      where: { id: input.standId, ownerId: owner.id },
    });
    if (!stand) return { error: "Stand not found." };
  }
  await prisma.externalLocationMapping.updateMany({
    where: {
      connectionId: conn.id,
      providerLocationId: input.providerLocationId,
    },
    data: { standId: input.standId },
  });
  revalidatePath("/dashboard/settings/square");
  return { ok: true as const };
}

export async function loadSquareMatchSuggestions() {
  const { owner } = await requireOwner();
  const conn = await getSquareConnection(owner.id);
  if (!conn?.catalogSyncEnabled) {
    return { error: "Enable catalogue sync first." as const };
  }
  const token = await getValidSquareAccessToken(conn.id);
  if (!token) return { error: "Reconnect Square." as const };

  const [items, products] = await Promise.all([
    listSquareCatalogItems(token),
    prisma.product.findMany({
      where: { ownerId: owner.id, isArchived: false },
      select: { id: true, name: true, sku: true, upc: true },
    }),
  ]);
  return {
    suggestions: suggestCatalogMatches(products, items),
    squareItemCount: items.length,
  };
}

export async function confirmSquareProductMapping(input: {
  productId: string;
  providerProductId: string;
  providerVariationId: string;
  providerSku?: string | null;
}) {
  const { owner } = await requireOwner();
  const conn = await getSquareConnection(owner.id);
  if (!conn) return { error: "Not connected." };
  const product = await prisma.product.findFirst({
    where: { id: input.productId, ownerId: owner.id },
  });
  if (!product) return { error: "Product not found." };

  const now = new Date();
  await prisma.$transaction([
    prisma.externalProductMapping.upsert({
      where: {
        connectionId_productId: {
          connectionId: conn.id,
          productId: product.id,
        },
      },
      create: {
        connectionId: conn.id,
        productId: product.id,
        providerProductId: input.providerProductId,
        confirmedAt: now,
      },
      update: {
        providerProductId: input.providerProductId,
        confirmedAt: now,
      },
    }),
    prisma.externalVariantMapping.upsert({
      where: {
        connectionId_productId: {
          connectionId: conn.id,
          productId: product.id,
        },
      },
      create: {
        connectionId: conn.id,
        productId: product.id,
        providerVariationId: input.providerVariationId,
        providerSku: input.providerSku ?? null,
        confirmedAt: now,
      },
      update: {
        providerVariationId: input.providerVariationId,
        providerSku: input.providerSku ?? null,
        confirmedAt: now,
      },
    }),
  ]);
  revalidatePath("/dashboard/settings/square");
  return { ok: true as const };
}
