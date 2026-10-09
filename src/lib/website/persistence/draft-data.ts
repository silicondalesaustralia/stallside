import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { StorefrontConfig, StorefrontIdentity } from "@/lib/storefront/types";
import { parseStorefrontIdentity } from "@/lib/storefront/identity";
import { writeStorefrontDraft, type DraftWriteResult } from "./draft-store";

function rawObject(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? { ...(raw as Record<string, unknown>) }
    : {};
}

/**
 * Saves website details into the draft. Identity (headline, hero, logo…) only
 * goes live on publish; the slug is routing, so it changes immediately.
 */
export async function saveStorefrontDraftData(input: {
  ownerId: string;
  expectedRevision: number;
  slug: string;
  themePreset: string;
  identity: StorefrontIdentity;
  draftConfig: StorefrontConfig;
  existingDraftConfigRaw: unknown;
}): Promise<DraftWriteResult> {
  const preserved = rawObject(input.existingDraftConfigRaw);
  const merged = {
    ...preserved,
    ...input.draftConfig,
    identity: {
      ...parseStorefrontIdentity(preserved.identity),
      ...input.identity,
    },
  };

  const result = await writeStorefrontDraft({
    ownerId: input.ownerId,
    expectedRevision: input.expectedRevision,
    draftConfig: merged as unknown as Prisma.InputJsonValue,
    data: { slug: input.slug, themePreset: input.themePreset },
  });
  if (result.ok) await syncVendlSubdomainRow(input.ownerId);
  return result;
}

/** Keep the included Vendl subdomain row in sync when the slug changes. */
async function syncVendlSubdomainRow(ownerId: string) {
  const { APP_DOMAIN } = await import("@/lib/constants");
  const sf = await prisma.storefront.findUniqueOrThrow({
    where: { ownerId },
    select: { id: true, slug: true },
  });
  const vendlHost = `${sf.slug}.${APP_DOMAIN}`;
  const subdomainRow = await prisma.storefrontDomain.findFirst({
    where: { storefrontId: sf.id, type: "VENDL_SUBDOMAIN" },
    select: { id: true, hostname: true },
  });
  if (!subdomainRow || subdomainRow.hostname === vendlHost) return;
  const clash = await prisma.storefrontDomain.findUnique({
    where: { hostname: vendlHost },
    select: { id: true },
  });
  if (clash) return;
  await prisma.storefrontDomain.update({
    where: { id: subdomainRow.id },
    data: { hostname: vendlHost },
  });
}
