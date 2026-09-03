"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SerializedNodes } from "@craftjs/core";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  ensureStorefront,
  publishStorefront,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import {
  defaultTemplateId,
  extractWebsiteStudio,
  mergeWebsiteStudioPageIntoRaw,
} from "@/lib/studio/storage";
import { validateStudioNodes } from "@/lib/studio/validate-state";
import { normalizeBusinessMode } from "@/lib/business-mode";
import {
  commerceKeyForKind,
  commerceKindFromParam,
  type CommercePageKind,
} from "@/lib/studio/commerce-pages";

function parseNodesJson(nodesJson: string, kind: CommercePageKind): SerializedNodes {
  try {
    const parsed = JSON.parse(nodesJson) as SerializedNodes;
    const validation = validateStudioNodes(parsed);
    if (!validation.ok) {
      redirect(`/dashboard/website/commerce/${kind}?error=invalid`);
    }
    return parsed;
  } catch {
    redirect(`/dashboard/website/commerce/${kind}?error=invalid`);
  }
}

async function persistCommerceNodes(
  ownerId: string,
  businessName: string,
  businessMode: string | null | undefined,
  kind: CommercePageKind,
  nodes: SerializedNodes,
) {
  const storefront = await ensureStorefront(ownerId, businessName);
  const studio = extractWebsiteStudio(storefront.draftConfig);
  const templateId = defaultTemplateId(
    studio ?? null,
    normalizeBusinessMode(businessMode),
  );
  const pageKey = commerceKeyForKind(kind);
  const merged = mergeWebsiteStudioPageIntoRaw(
    storefront.draftConfig,
    templateId,
    pageKey,
    nodes,
  );
  await prisma.storefront.update({
    where: { ownerId },
    data: { draftConfig: merged },
  });
  return storefront.slug;
}

export async function saveCommerceLayoutDraft(kindParam: string, nodesJson: string) {
  const kind = commerceKindFromParam(kindParam);
  if (!kind) redirect("/dashboard/website/commerce?error=kind");
  const { owner } = await requireOwnerWrite();
  const nodes = parseNodesJson(nodesJson, kind);
  const slug = await persistCommerceNodes(
    owner.id,
    owner.businessName,
    owner.businessMode,
    kind,
    nodes,
  );
  revalidatePath(`/dashboard/website/commerce/${kind}`);
  revalidatePath(storefrontPublicPath(slug));
  redirect(`/dashboard/website/commerce/${kind}?saved=1`);
}

export async function publishCommerceLayoutDraft(
  kindParam: string,
  nodesJson: string,
) {
  const kind = commerceKindFromParam(kindParam);
  if (!kind) redirect("/dashboard/website/commerce?error=kind");
  const { owner } = await requireOwnerWrite();
  const nodes = parseNodesJson(nodesJson, kind);
  await persistCommerceNodes(
    owner.id,
    owner.businessName,
    owner.businessMode,
    kind,
    nodes,
  );
  await publishStorefront(owner.id);
  revalidatePath(`/dashboard/website/commerce/${kind}`);
  redirect(`/dashboard/website/commerce/${kind}?published=1`);
}
