"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import { webStudioPath } from "@/lib/website/web-studio-nav";
import { profileFromForm } from "@/lib/seo/business-profile-form";

/** Saves the Google & search profile. It goes live straight away (it isn't part of the page draft). */
export async function saveBusinessProfile(formData: FormData) {
  const { owner } = await requireWebsiteOwner();
  const result = profileFromForm(formData);
  if (!result.ok) {
    redirect(`${webStudioPath("details", { profile_error: result.error.slice(0, 200) })}#search-profile`);
  }

  let saved = false;
  try {
    const storefront = await ensureStorefront(owner.id, owner.businessName);
    await prisma.storefront.update({
      where: { id: storefront.id },
      data: { businessProfile: result.profile as Prisma.InputJsonValue },
    });
    revalidatePath(storefrontPublicPath(storefront.slug), "layout");
    saved = true;
  } catch (err) {
    console.error("saveBusinessProfile failed", err);
  }
  redirect(
    `${webStudioPath("details", saved ? { profile_saved: "1" } : { profile_error: "Couldn't save. Please try again." })}#search-profile`,
  );
}
