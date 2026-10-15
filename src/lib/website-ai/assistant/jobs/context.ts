import { prisma } from "@/lib/prisma";
import { loadStorefrontContext, type StorefrontContext } from "@/lib/catalogue/storefront";
import { buildAssistantContext } from "../context/build";
import type { AssistantContext } from "../context/types";

export type JobContext = {
  storefront: NonNullable<StorefrontContext>;
  assistant: AssistantContext;
};

/** Owner-scoped draft context for a job; null when the storefront no longer belongs to the owner. */
export async function loadJobContext(ownerId: string, storefrontId: string): Promise<JobContext | null> {
  const row = await prisma.storefront.findFirst({
    where: { id: storefrontId, ownerId },
    select: { slug: true },
  });
  if (!row) return null;
  const storefront = await loadStorefrontContext(row.slug, { draft: true, ownerId });
  if (!storefront) return null;
  return { storefront, assistant: await buildAssistantContext(storefront) };
}
