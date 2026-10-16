"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { storefrontPublicPath } from "@/lib/catalogue/storefront";
import { profileFromForm } from "@/lib/seo/business-profile-form";
import type { BusinessProfile } from "@/lib/seo/business-profile";
import { requireAssistantOwner } from "@/lib/website-ai/assistant/load-wizard";
import { searchProfileFacts, searchProfileSummary } from "@/lib/website-ai/assistant/context/search-profile";

export type InlineProfileResult =
  | { ok: true; profile: BusinessProfile; complete: boolean; summary: string[] }
  | { ok: false; error: string };

/** Saves the Google & search profile from inside the assistant, without leaving the wizard. */
export async function saveSearchProfileInline(formData: FormData): Promise<InlineProfileResult> {
  try {
    const { storefront } = await requireAssistantOwner();
    const result = profileFromForm(formData);
    if (!result.ok) return { ok: false, error: result.error };
    await prisma.storefront.update({
      where: { id: storefront.id },
      data: { businessProfile: result.profile as Prisma.InputJsonValue },
    });
    revalidatePath(storefrontPublicPath(storefront.slug), "layout");
    revalidatePath("/dashboard/website/web-studio");
    const facts = searchProfileFacts(result.profile);
    return { ok: true, profile: result.profile, complete: facts.complete, summary: searchProfileSummary(facts) };
  } catch (err) {
    console.error("saveSearchProfileInline failed", err);
    return { ok: false, error: "Couldn't save your search profile. Please try again." };
  }
}
