"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { webStudioPath } from "@/lib/website/web-studio-nav";
import { withWebsiteStandId } from "@/lib/storefront/website-stand";
import { patchSiteConfig } from "@/lib/website/persistence/site-redirect-patch";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";

export async function setWebsiteStandAction(formData: FormData) {
  const { owner } = await requireWebsiteOwner();
  const standId = String(formData.get("standId") ?? "");
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
    select: { id: true },
  });
  if (!stand) redirect(webStudioPath("details", { error: "website_stand" }));

  try {
    await patchSiteConfig(owner.id, (raw) => withWebsiteStandId(raw, stand.id));
  } catch (err) {
    console.error("[website-stand] save failed", err);
    redirect(webStudioPath("details", { error: "website_stand" }));
  }
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  revalidatePath(storefrontPublicPath(storefront.slug), "layout");
  redirect(webStudioPath("details", { stand_saved: "1" }));
}
