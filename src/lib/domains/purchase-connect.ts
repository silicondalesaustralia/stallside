/** Connect a registered Vendl-bought domain: www + bare domain → Cloudflare, then Namecheap DNS. */

import { prisma } from "@/lib/prisma";
import { DomainPurchaseStatus, StorefrontDomainStatus } from "@/generated/prisma/client";
import { cloudflareSaasCnameTarget } from "@/lib/domains/config";
import { connectCustomDomain } from "@/lib/domains/lifecycle";
import {
  namecheapSetStorefrontHosts,
  type DnsTxtRecord,
} from "@/lib/domains/registrar/namecheap/dns";

type ConnectOwner = Parameters<typeof connectCustomDomain>[0]["owner"];

/** Reuse a hostname already created in Cloudflare so retries don't hit "duplicate hostname". */
async function ensureConnected(
  storefrontId: string,
  owner: ConnectOwner,
  hostname: string,
  allowApex: boolean,
) {
  const existing = await prisma.storefrontDomain.findFirst({
    where: {
      storefrontId,
      hostname,
      cloudflareCustomHostnameId: { not: null },
      status: { not: StorefrontDomainStatus.DISCONNECTED },
    },
  });
  if (existing) return existing;
  return connectCustomDomain({ storefrontId, owner, hostname, allowApex });
}

function ownershipTxt(row: {
  verificationMethod: string | null;
  verificationName: string | null;
  verificationValue: string | null;
}): DnsTxtRecord[] {
  if (row.verificationMethod?.toLowerCase() !== "txt") return [];
  if (!row.verificationName || !row.verificationValue) return [];
  return [{ name: row.verificationName, value: row.verificationValue }];
}

export async function connectPurchasedDomain(purchaseId: string) {
  const purchase = await prisma.domainPurchase.findUniqueOrThrow({
    where: { id: purchaseId },
    include: {
      owner: { include: { user: { select: { email: true, role: true } } } },
    },
  });

  await prisma.domainPurchase.update({
    where: { id: purchase.id },
    data: { status: DomainPurchaseStatus.CONNECTING },
  });

  let wwwRow;
  try {
    wwwRow = await ensureConnected(
      purchase.storefrontId,
      purchase.owner,
      `www.${purchase.hostname}`,
      false,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "failed";
    await prisma.domainPurchase.update({
      where: { id: purchase.id },
      data: {
        status: DomainPurchaseStatus.REGISTERED,
        lastError: `Connect: ${msg}`.slice(0, 500),
      },
    });
    return;
  }

  let apexRow = null;
  try {
    apexRow = await ensureConnected(purchase.storefrontId, purchase.owner, purchase.hostname, true);
  } catch (err) {
    console.error("[domain purchase] bare domain connect failed", {
      purchaseId: purchase.id,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  let dnsError: string | null = null;
  try {
    await namecheapSetStorefrontHosts(purchase.hostname, cloudflareSaasCnameTarget(), [
      ...ownershipTxt(wwwRow),
      ...(apexRow ? ownershipTxt(apexRow) : []),
    ]);
  } catch (err) {
    dnsError = `DNS: ${err instanceof Error ? err.message : "failed"}`.slice(0, 500);
  }

  await prisma.domainPurchase.update({
    where: { id: purchase.id },
    data: {
      status: DomainPurchaseStatus.ACTIVE,
      storefrontDomainId: wwwRow.id,
      lastError: dnsError,
    },
  });
}
