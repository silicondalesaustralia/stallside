import { prisma } from "@/lib/prisma";
import {
  CommerceProvider,
  ExternalConnectionStatus,
} from "@/generated/prisma/client";
import { decryptSecret, encryptSecret } from "@/lib/square/crypto";
import {
  exchangeSquareAuthCode,
  fetchSquareLocations,
  fetchSquareMerchant,
  refreshSquareAccessToken,
  revokeSquareToken,
} from "@/lib/square/oauth";
import { SQUARE_OAUTH_SCOPES } from "@/lib/square/scopes";

export async function getSquareConnection(ownerId: string) {
  return prisma.externalCommerceConnection.findUnique({
    where: {
      ownerId_provider: { ownerId, provider: CommerceProvider.SQUARE },
    },
    include: { locations: true },
  });
}

export async function getValidSquareAccessToken(
  connectionId: string,
): Promise<string | null> {
  const conn = await prisma.externalCommerceConnection.findUnique({
    where: { id: connectionId },
  });
  if (!conn?.accessTokenEnc) return null;
  if (
    conn.status === ExternalConnectionStatus.DISCONNECTED ||
    conn.status === ExternalConnectionStatus.ERROR
  ) {
    return null;
  }

  const expiresSoon =
    conn.tokenExpiresAt != null &&
    conn.tokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000;

  if (!expiresSoon) {
    return decryptSecret(conn.accessTokenEnc);
  }

  if (!conn.refreshTokenEnc) {
    await prisma.externalCommerceConnection.update({
      where: { id: connectionId },
      data: {
        status: ExternalConnectionStatus.NEEDS_REAUTH,
        lastError: "Access token expired",
      },
    });
    return null;
  }

  try {
    const refreshed = await refreshSquareAccessToken(
      decryptSecret(conn.refreshTokenEnc),
    );
    if (!refreshed.access_token) return null;
    await prisma.externalCommerceConnection.update({
      where: { id: connectionId },
      data: {
        accessTokenEnc: encryptSecret(refreshed.access_token),
        refreshTokenEnc: refreshed.refresh_token
          ? encryptSecret(refreshed.refresh_token)
          : conn.refreshTokenEnc,
        tokenExpiresAt: refreshed.expires_at
          ? new Date(refreshed.expires_at)
          : null,
        status: ExternalConnectionStatus.ACTIVE,
        lastError: null,
      },
    });
    return refreshed.access_token;
  } catch (error) {
    await prisma.externalCommerceConnection.update({
      where: { id: connectionId },
      data: {
        status: ExternalConnectionStatus.NEEDS_REAUTH,
        lastError:
          error instanceof Error ? error.message : "Token refresh failed",
      },
    });
    return null;
  }
}

export async function completeSquareOAuth(input: {
  ownerId: string;
  code: string;
}) {
  const tokens = await exchangeSquareAuthCode(input.code);
  if (!tokens.access_token || !tokens.merchant_id) {
    throw new Error("Square OAuth response missing token or merchant");
  }

  const merchant = await fetchSquareMerchant(tokens.access_token);
  const locations = await fetchSquareLocations(tokens.access_token);
  const businessName =
    merchant.merchant?.[0]?.business_name ?? null;
  const activeLocations = (locations.locations ?? []).filter(
    (l) => l.id && l.status !== "INACTIVE",
  );
  const primary = activeLocations[0];

  const existing = await prisma.externalCommerceConnection.findUnique({
    where: {
      ownerId_provider: {
        ownerId: input.ownerId,
        provider: CommerceProvider.SQUARE,
      },
    },
  });

  const data = {
    providerMerchantId: tokens.merchant_id,
    status: ExternalConnectionStatus.ACTIVE,
    accessTokenEnc: encryptSecret(tokens.access_token),
    refreshTokenEnc: tokens.refresh_token
      ? encryptSecret(tokens.refresh_token)
      : null,
    tokenExpiresAt: tokens.expires_at ? new Date(tokens.expires_at) : null,
    scopes: [...SQUARE_OAUTH_SCOPES],
    merchantName: businessName,
    primaryLocationId: primary?.id ?? null,
    disconnectedAt: null,
    lastError: null,
  };

  const connection = existing
    ? await prisma.externalCommerceConnection.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.externalCommerceConnection.create({
        data: {
          ownerId: input.ownerId,
          provider: CommerceProvider.SQUARE,
          ...data,
        },
      });

  for (const loc of activeLocations) {
    if (!loc.id) continue;
    await prisma.externalLocationMapping.upsert({
      where: {
        connectionId_providerLocationId: {
          connectionId: connection.id,
          providerLocationId: loc.id,
        },
      },
      create: {
        connectionId: connection.id,
        providerLocationId: loc.id,
        providerLocationName: loc.name ?? null,
        isPrimary: loc.id === primary?.id,
      },
      update: {
        providerLocationName: loc.name ?? null,
        isPrimary: loc.id === primary?.id,
      },
    });
  }

  return connection;
}

export async function disconnectSquare(ownerId: string) {
  const conn = await getSquareConnection(ownerId);
  if (!conn) return;
  if (conn.accessTokenEnc) {
    try {
      await revokeSquareToken(decryptSecret(conn.accessTokenEnc));
    } catch {
      // ignore
    }
  }
  await prisma.externalCommerceConnection.update({
    where: { id: conn.id },
    data: {
      status: ExternalConnectionStatus.DISCONNECTED,
      accessTokenEnc: null,
      refreshTokenEnc: null,
      tokenExpiresAt: null,
      paymentsEnabled: false,
      inventorySyncEnabled: false,
      catalogSyncEnabled: false,
      disconnectedAt: new Date(),
    },
  });
  await prisma.owner.update({
    where: { id: ownerId },
    data: { onlinePaymentProvider: "STRIPE" },
  });
}
