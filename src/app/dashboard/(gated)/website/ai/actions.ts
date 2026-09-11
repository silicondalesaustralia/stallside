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
import { canUseAiWebsiteBuilder } from "@/lib/website-ai/config";
import { buildWebsiteBusinessContext } from "@/lib/website-ai/business-context";
import { assessWebsiteContext, intentFromForm } from "@/lib/website-ai/assess-context";
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
    const ctx = await loadStorefrontContext(storefront.slug, {
      draft: true,
      ownerId: owner.id,
    });
    if (!ctx) {
      return { ok: false, error: "Storefront context unavailable." };
    }

    const businessContext = await buildWebsiteBusinessContext(ctx);
    const assessment = assessWebsiteContext(businessContext);
    const intent = intentFromForm(formData, assessment);

    if (intent.sellerAbout && intent.sellerAbout.length > 40) {
      await prisma.storefront.update({
        where: { ownerId: owner.id },
        data: { about: intent.sellerAbout.slice(0, 2000) },
      });
      businessContext.about = intent.sellerAbout.slice(0, 2000);
    }

    const areaAnswer = intent.contextAnswers?.find((a) => a.questionId === "AREA");
    if (areaAnswer?.answer && !businessContext.regionLabel) {
      businessContext.regionLabel = areaAnswer.answer.slice(0, 120);
    }

    const generated = await generateWebsiteDraft({ businessContext, intent });
    if (!generated.ok) {
      return {
        ok: false,
        error: generated.error,
        details: generated.details,
      };
    }

    const refreshed = await ensureStorefront(owner.id, owner.businessName);
    const merged = mergeWebsiteStudioIntoRaw(
      refreshed.draftConfig,
      generated.studio.templateId,
      generated.studio.nodes,
    );
    await prisma.storefront.update({
      where: { ownerId: owner.id },
      data: {
        draftConfig: merged,
        ...(generated.decorativeHeroUrl
          ? { heroImageUrl: generated.decorativeHeroUrl }
          : {}),
      },
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
      missing: generated.missing,
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
