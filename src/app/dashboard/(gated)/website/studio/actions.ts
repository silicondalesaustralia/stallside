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
  extractWebsiteStudio,
  mergeWebsiteStudioIntoRaw,
} from "@/lib/studio/storage";
import { validateStudioNodes } from "@/lib/studio/validate-state";
import type { StudioTemplateId } from "@/lib/studio/types";

function parseTemplateId(raw: string): StudioTemplateId {
  if (raw === "artisan" || raw === "farmhouse" || raw === "market") return raw;
  redirect("/dashboard/website/studio?error=invalid");
}

function parseNodesJson(nodesJson: string): SerializedNodes {
  try {
    const parsed = JSON.parse(nodesJson) as SerializedNodes;
    const validation = validateStudioNodes(parsed);
    if (!validation.ok) {
      redirect("/dashboard/website/studio?error=invalid");
    }
    return parsed;
  } catch {
    redirect("/dashboard/website/studio?error=invalid");
  }
}

async function persistWebsiteStudioDraft(
  ownerId: string,
  businessName: string,
  templateId: StudioTemplateId,
  nodes: SerializedNodes,
) {
  const storefront = await ensureStorefront(ownerId, businessName);
  const merged = mergeWebsiteStudioIntoRaw(storefront.draftConfig, templateId, nodes);
  await prisma.storefront.update({
    where: { ownerId },
    data: { draftConfig: merged },
  });
  return storefront.slug;
}

export async function saveWebsiteStudioDraft(nodesJson: string, templateIdRaw: string) {
  const { owner } = await requireOwnerWrite();
  const templateId = parseTemplateId(templateIdRaw);
  const nodes = parseNodesJson(nodesJson);
  const slug = await persistWebsiteStudioDraft(owner.id, owner.businessName, templateId, nodes);

  revalidatePath("/dashboard/website/studio");
  revalidatePath(`${storefrontPublicPath(slug)}/studio-preview`);
  redirect("/dashboard/website/studio?saved=1");
}

export async function publishWebsiteStudioDraft(nodesJson: string, templateIdRaw: string) {
  const { owner } = await requireOwnerWrite();
  const templateId = parseTemplateId(templateIdRaw);
  const nodes = parseNodesJson(nodesJson);
  const slug = await persistWebsiteStudioDraft(owner.id, owner.businessName, templateId, nodes);
  await publishStorefront(owner.id);

  revalidatePath("/dashboard/website/studio");
  revalidatePath(`${storefrontPublicPath(slug)}/studio-preview`);
  redirect("/dashboard/website/studio?published=1");
}

export async function applyWebsiteStudioTemplate(templateIdRaw: string) {
  const { owner } = await requireOwnerWrite();
  const templateId = parseTemplateId(templateIdRaw);
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const existing = extractWebsiteStudio(storefront.draftConfig);

  if (existing?.nodes) {
    const merged = mergeWebsiteStudioIntoRaw(
      storefront.draftConfig,
      templateId,
      existing.nodes,
    );
    await prisma.storefront.update({
      where: { ownerId: owner.id },
      data: { draftConfig: merged },
    });
    revalidatePath("/dashboard/website/studio");
    redirect("/dashboard/website/studio?template=applied");
  }

  redirect(`/dashboard/website/studio?template=${templateId}`);
}
