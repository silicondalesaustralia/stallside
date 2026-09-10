"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  ensureStorefront,
  loadStorefrontContext,
  publishStorefront,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import { mergeWebsiteStudioIntoRaw } from "@/lib/studio/storage";
import { uploadStorefrontHero } from "@/lib/storefront/hero-upload";
import { canUseAiWebsiteBuilder } from "@/lib/website-ai/config";
import { buildWebsiteBusinessContext } from "@/lib/website-ai/business-context";
import { intentFromForm } from "@/lib/website-ai/assess-context";
import { generateWebsiteDraft } from "@/lib/website-ai/provider";

export type AiGenerateState = {
  ok: boolean;
  error?: string;
  details?: string[];
  summary?: string;
  designSystem?: string;
  provider?: string;
  missing?: { code: string; message: string }[];
  previewPath?: string;
};

function fileFromForm(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  if (value instanceof File && value.size > 0) return value;
  return null;
}

export async function generateAiWebsiteDraft(
  _prev: AiGenerateState,
  formData: FormData,
): Promise<AiGenerateState> {
  const { owner } = await requireOwnerWrite();
  if (!canUseAiWebsiteBuilder(owner.id)) {
    return { ok: false, error: "AI website builder is not enabled for this account." };
  }

  const storefront = await ensureStorefront(owner.id, owner.businessName);

  try {
    const about = String(formData.get("about") ?? "").trim().slice(0, 2000);
    const heroFile = fileFromForm(formData, "heroImage");
    const storyFile = fileFromForm(formData, "storyImage");

    let heroImageUrl = storefront.heroImageUrl;
    if (heroFile) {
      heroImageUrl = await uploadStorefrontHero(owner.id, heroFile);
    }

    let storyImageUrl: string | undefined;
    if (storyFile) {
      storyImageUrl = await uploadStorefrontHero(owner.id, storyFile);
    }

    if (about || heroFile) {
      await prisma.storefront.update({
        where: { ownerId: owner.id },
        data: {
          ...(about ? { about } : {}),
          ...(heroFile ? { heroImageUrl } : {}),
        },
      });
    }

    const refreshed = await ensureStorefront(owner.id, owner.businessName);
    const ctx = await loadStorefrontContext(refreshed.slug, {
      draft: true,
      ownerId: owner.id,
    });
    if (!ctx) {
      return { ok: false, error: "Storefront context unavailable." };
    }

    const intent = intentFromForm({
      focus: String(formData.get("focus") ?? ""),
      style: String(formData.get("style") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      about: about || undefined,
      storyImageUrl,
    });

    const businessContext = await buildWebsiteBusinessContext(ctx);
    if (about) businessContext.about = about;
    if (heroImageUrl) businessContext.heroImageUrl = heroImageUrl;

    const generated = await generateWebsiteDraft({ businessContext, intent });
    if (!generated.ok) {
      return {
        ok: false,
        error: generated.error,
        details: generated.details,
      };
    }

    const merged = mergeWebsiteStudioIntoRaw(
      refreshed.draftConfig,
      generated.studio.templateId,
      generated.studio.nodes,
    );
    await prisma.storefront.update({
      where: { ownerId: owner.id },
      data: { draftConfig: merged },
    });

    const previewPath = `${storefrontPublicPath(refreshed.slug)}/studio-preview?draft=1`;
    revalidatePath("/dashboard/website/ai");
    revalidatePath("/dashboard/website/studio");
    revalidatePath("/dashboard/website/details");
    revalidatePath(previewPath);

    return {
      ok: true,
      summary: generated.plan.changeSummary ?? "Draft website created.",
      designSystem: generated.studio.templateId,
      provider: `${generated.provider}/${generated.model}`,
      missing: generated.plan.missingInformation?.map((m) => ({
        code: m.code,
        message: m.message,
      })),
      previewPath,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return { ok: false, error: message };
  }
}

export async function publishAiWebsiteDraft() {
  const { owner } = await requireOwnerWrite();
  if (!canUseAiWebsiteBuilder(owner.id)) {
    redirect("/dashboard/website/studio");
  }
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  await publishStorefront(owner.id);
  revalidatePath("/dashboard/website/ai");
  revalidatePath("/dashboard/website/studio");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect("/dashboard/website/ai?published=1");
}
