"use server";

import { revalidatePath } from "next/cache";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { prisma } from "@/lib/prisma";
import { storefrontPublicPath, unpublishStorefront } from "@/lib/catalogue/storefront";

/** Takes the site offline from inside the editor; the draft is kept, so publishing again restores it. */
export async function unpublishFromEditor(): Promise<{ ok: true } | { ok: false; error: string }> {
  const { owner } = await requireWebsiteOwner();
  try {
    const sf = await prisma.storefront.findUnique({ where: { ownerId: owner.id }, select: { slug: true } });
    if (!sf) return { ok: false, error: "No website found." };
    await unpublishStorefront(owner.id);
    revalidatePath("/dashboard/website/web-studio");
    revalidatePath("/dashboard/website/details");
    revalidatePath("/dashboard/website/studio");
    revalidatePath(storefrontPublicPath(sf.slug), "layout");
    return { ok: true };
  } catch (err) {
    console.error("[editor unpublish]", err);
    return { ok: false, error: "Couldn't unpublish. Try again." };
  }
}
