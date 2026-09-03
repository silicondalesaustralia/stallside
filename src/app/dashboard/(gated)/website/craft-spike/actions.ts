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
import { mergeCraftSpikeIntoRaw } from "@/lib/craft/storage";
import { validateCraftNodes } from "@/lib/craft/validate-state";

function parseNodesJson(nodesJson: string): SerializedNodes {
  try {
    const parsed = JSON.parse(nodesJson) as SerializedNodes;
    const validation = validateCraftNodes(parsed);
    if (!validation.ok) {
      redirect("/dashboard/website/craft-spike?error=invalid");
    }
    return parsed;
  } catch {
    redirect("/dashboard/website/craft-spike?error=invalid");
  }
}

async function persistCraftSpikeDraft(
  ownerId: string,
  businessName: string,
  nodes: SerializedNodes,
) {
  const storefront = await ensureStorefront(ownerId, businessName);
  const merged = mergeCraftSpikeIntoRaw(storefront.draftConfig, nodes);
  await prisma.storefront.update({
    where: { ownerId },
    data: { draftConfig: merged },
  });
  return storefront.slug;
}

export async function saveCraftSpikeDraft(nodesJson: string) {
  const { owner } = await requireOwnerWrite();
  const nodes = parseNodesJson(nodesJson);
  const slug = await persistCraftSpikeDraft(owner.id, owner.businessName, nodes);

  revalidatePath("/dashboard/website/craft-spike");
  revalidatePath(`${storefrontPublicPath(slug)}/craft-preview`);
  redirect("/dashboard/website/craft-spike?saved=1");
}

export async function publishCraftSpikeDraft(nodesJson: string) {
  const { owner } = await requireOwnerWrite();
  const nodes = parseNodesJson(nodesJson);
  const slug = await persistCraftSpikeDraft(owner.id, owner.businessName, nodes);
  await publishStorefront(owner.id);

  revalidatePath("/dashboard/website/craft-spike");
  revalidatePath(`${storefrontPublicPath(slug)}/craft-preview`);
  redirect("/dashboard/website/craft-spike?published=1");
}
