"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SerializedNodes } from "@craftjs/core";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { writeDraftOrRedirect } from "@/lib/website/persistence/draft-redirect";
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
  await writeDraftOrRedirect({
    ownerId,
    expectedRevision: storefront.draftRevision,
    draftConfig: merged,
    conflictPath: "/dashboard/website/craft-spike",
  });
  return storefront.slug;
}

export async function saveCraftSpikeDraft(nodesJson: string) {
  const { owner } = await requireWebsiteOwner();
  const nodes = parseNodesJson(nodesJson);
  const slug = await persistCraftSpikeDraft(owner.id, owner.businessName, nodes);

  revalidatePath("/dashboard/website/craft-spike");
  revalidatePath(`${storefrontPublicPath(slug)}/craft-preview`);
  redirect("/dashboard/website/craft-spike?saved=1");
}

/** The spike is an experiment: it can save a draft but never publish the live site. */
export async function publishCraftSpikeDraft(nodesJson: string) {
  await saveCraftSpikeDraft(nodesJson);
}
