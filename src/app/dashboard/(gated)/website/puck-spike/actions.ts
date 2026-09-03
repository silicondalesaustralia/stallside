"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Data } from "@puckeditor/core";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  ensureStorefront,
  publishStorefront,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import { mergePuckSpikeIntoRaw } from "@/lib/puck/spike-storage";
import { buildStarterHome } from "@/lib/puck/starter-home";
import type { BusinessMode } from "@/lib/business-mode";

function parseHomeJson(homeJson: string): Data {
  try {
    return JSON.parse(homeJson) as Data;
  } catch {
    redirect("/dashboard/website/puck-spike?error=invalid");
  }
}

async function persistPuckSpikeDraft(
  ownerId: string,
  businessName: string,
  home: Data,
) {
  const storefront = await ensureStorefront(ownerId, businessName);
  const merged = mergePuckSpikeIntoRaw(storefront.draftConfig, home);
  await prisma.storefront.update({
    where: { ownerId },
    data: { draftConfig: merged },
  });
  return storefront.slug;
}

export async function savePuckSpikeDraft(homeJson: string) {
  const { owner } = await requireOwnerWrite();
  const home = parseHomeJson(homeJson);
  const slug = await persistPuckSpikeDraft(owner.id, owner.businessName, home);

  revalidatePath("/dashboard/website/puck-spike");
  revalidatePath(`${storefrontPublicPath(slug)}/puck-preview`);
  redirect("/dashboard/website/puck-spike?saved=1");
}

export async function publishPuckSpikeDraft(homeJson: string) {
  const { owner } = await requireOwnerWrite();
  const home = parseHomeJson(homeJson);
  const slug = await persistPuckSpikeDraft(owner.id, owner.businessName, home);
  await publishStorefront(owner.id);

  revalidatePath("/dashboard/website/puck-spike");
  revalidatePath(`${storefrontPublicPath(slug)}/puck-preview`);
  redirect("/dashboard/website/puck-spike?published=1");
}

export async function resetPuckSpikeDraft() {
  if (process.env.NODE_ENV === "production") {
    redirect("/dashboard/website/puck-spike");
  }

  const { owner } = await requireOwnerWrite();
  await ensureStorefront(owner.id, owner.businessName);
  const ctx = await prisma.owner.findUnique({
    where: { id: owner.id },
    select: {
      businessMode: true,
      storefront: {
        select: {
          headline: true,
          subheadline: true,
          about: true,
        },
      },
    },
  });
  const sf = ctx?.storefront;
  const home = buildStarterHome({
    businessMode: (ctx?.businessMode ?? "FOOD_BUSINESS") as BusinessMode,
    headline: sf?.headline ?? owner.businessName,
    subheadline: sf?.subheadline ?? null,
    about: sf?.about ?? null,
  });
  await persistPuckSpikeDraft(owner.id, owner.businessName, home);

  revalidatePath("/dashboard/website/puck-spike");
  redirect("/dashboard/website/puck-spike?saved=1");
}
