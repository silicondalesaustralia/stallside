import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { DRAFT_CONFLICT_MESSAGE, writeStorefrontDraft } from "./draft-store";

export type DraftKeyResult = { ok: true; revision: number } | { ok: false; error: string };

/** Sets one top-level draftConfig key (or removes it, with null) behind the revision check. */
export async function writeDraftConfigKey(input: {
  owner: { id: string; businessName: string };
  key: string;
  value: unknown;
  expectedRevision: number;
}): Promise<DraftKeyResult> {
  const storefront = await ensureStorefront(input.owner.id, input.owner.businessName);
  const raw: Record<string, unknown> =
    storefront.draftConfig && typeof storefront.draftConfig === "object" && !Array.isArray(storefront.draftConfig)
      ? { ...(storefront.draftConfig as Record<string, unknown>) }
      : {};
  if (input.value === null) delete raw[input.key];
  else raw[input.key] = input.value;
  const saved = await writeStorefrontDraft({
    ownerId: input.owner.id,
    expectedRevision: input.expectedRevision,
    draftConfig: raw as Prisma.InputJsonValue,
  });
  if (!saved.ok) return { ok: false, error: DRAFT_CONFLICT_MESSAGE };
  revalidatePath(`${storefrontPublicPath(storefront.slug)}/studio-preview`);
  return { ok: true, revision: saved.revision };
}
