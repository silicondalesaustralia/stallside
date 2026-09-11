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
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { canUseAiWebsiteBuilder } from "@/lib/website-ai/config";
import { buildWebsiteBusinessContext } from "@/lib/website-ai/business-context";
import { assessWebsiteContext, intentFromForm } from "@/lib/website-ai/assess-context";
import {
  finalizeWebsiteDraft,
  scaffoldWebsiteDraft,
} from "@/lib/website-ai/provider";
import {
  extractWebsiteAiScaffold,
  mergeWebsiteAiScaffoldIntoRaw,
  WEBSITE_AI_SCAFFOLD_VERSION,
} from "@/lib/website-ai/scaffold-storage";
import type { BrandLookCombo } from "@/lib/website/brand-looks";
import { getPalette } from "@/lib/website/brand-looks";

export type AiGenerateState = {
  ok: boolean;
  phase?: "scaffold" | "built";
  error?: string;
  details?: string[];
  summary?: string;
  designSystem?: string;
  provider?: string;
  missing?: { code: string; message: string }[];
  previewPath?: string;
  looks?: BrandLookCombo[];
};

async function prepareIntent(ownerId: string, businessName: string, formData: FormData) {
  const storefront = await ensureStorefront(ownerId, businessName);
  const ctx = await loadStorefrontContext(storefront.slug, {
    draft: true,
    ownerId,
  });
  if (!ctx) return { error: "Storefront context unavailable." as const };

  const businessContext = await buildWebsiteBusinessContext(ctx);
  const assessment = assessWebsiteContext(businessContext);
  const intent = intentFromForm(formData, assessment);

  if (intent.sellerAbout && intent.sellerAbout.length > 40) {
    await prisma.storefront.update({
      where: { ownerId },
      data: { about: intent.sellerAbout.slice(0, 2000) },
    });
    businessContext.about = intent.sellerAbout.slice(0, 2000);
  }

  const areaAnswer = intent.contextAnswers?.find((a) => a.questionId === "AREA");
  if (areaAnswer?.answer && !businessContext.regionLabel) {
    businessContext.regionLabel = areaAnswer.answer.slice(0, 120);
  }

  return { storefront, businessContext, intent };
}

/** Step 1 — plan pages/sections and propose 3 looks. */
export async function scaffoldAiWebsiteDraft(
  _prev: AiGenerateState,
  formData: FormData,
): Promise<AiGenerateState> {
  const { owner } = await requireOwnerWrite();
  if (!canUseAiWebsiteBuilder(owner.id)) {
    return { ok: false, error: "AI website builder is not enabled for this account." };
  }

  try {
    const prepared = await prepareIntent(owner.id, owner.businessName, formData);
    if ("error" in prepared) return { ok: false, error: prepared.error };

    const generated = await scaffoldWebsiteDraft({
      businessContext: prepared.businessContext,
      intent: prepared.intent,
    });
    if (!generated.ok) {
      return { ok: false, error: generated.error, details: generated.details };
    }

    const refreshed = await ensureStorefront(owner.id, owner.businessName);
    const draft = mergeWebsiteAiScaffoldIntoRaw(refreshed.draftConfig, {
      version: WEBSITE_AI_SCAFFOLD_VERSION,
      plan: generated.plan,
      intent: prepared.intent,
      looks: generated.looks,
      createdAt: new Date().toISOString(),
    });
    await prisma.storefront.update({
      where: { ownerId: owner.id },
      data: { draftConfig: draft },
    });

    revalidatePath("/dashboard/website/ai");
    return {
      ok: true,
      phase: "scaffold",
      summary: "Pick a colour palette, then build your site.",
      provider: `${generated.provider}/${generated.model}`,
      missing: generated.missing,
      looks: generated.looks,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scaffold failed";
    return { ok: false, error: message };
  }
}

/** Step 2 — apply chosen look and compile Craft draft. */
export async function buildAiWebsiteDraft(
  _prev: AiGenerateState,
  formData: FormData,
): Promise<AiGenerateState> {
  const { owner } = await requireOwnerWrite();
  if (!canUseAiWebsiteBuilder(owner.id)) {
    return { ok: false, error: "AI website builder is not enabled for this account." };
  }

  const lookId = String(formData.get("lookId") ?? "").trim();
  if (!lookId) return { ok: false, error: "Choose a look first." };

  try {
    const storefront = await ensureStorefront(owner.id, owner.businessName);
    const scaffold = extractWebsiteAiScaffold(storefront.draftConfig);
    if (!scaffold) {
      return { ok: false, error: "Build a scaffold first, then choose a look." };
    }

    const ctx = await loadStorefrontContext(storefront.slug, {
      draft: true,
      ownerId: owner.id,
    });
    if (!ctx) return { ok: false, error: "Storefront context unavailable." };
    const businessContext = await buildWebsiteBusinessContext(ctx);

    const generated = await finalizeWebsiteDraft({
      businessContext,
      intent: scaffold.intent,
      plan: scaffold.plan,
      lookId,
      looks: scaffold.looks,
    });
    if (!generated.ok) {
      return { ok: false, error: generated.error, details: generated.details };
    }

    const baseConfig = parseStorefrontConfig(storefront.draftConfig);
    const baseRaw =
      storefront.draftConfig &&
      typeof storefront.draftConfig === "object" &&
      !Array.isArray(storefront.draftConfig)
        ? { ...(storefront.draftConfig as Record<string, unknown>) }
        : {};
    const studioMerged = mergeWebsiteStudioIntoRaw(
      baseRaw,
      generated.studio.templateId,
      generated.studio.nodes,
    );
    const studioObj =
      studioMerged && typeof studioMerged === "object"
        ? (studioMerged as Record<string, unknown>)
        : {};
    const nextDraft: Record<string, unknown> = {
      ...studioObj,
      themeOverrides: {
        ...baseConfig.themeOverrides,
        ...generated.themeOverrides,
      },
    };
    delete nextDraft.websiteAiScaffold;

    const palette = getPalette(generated.themeOverrides?.paletteId);
    if (palette) {
      await prisma.owner.update({
        where: { id: owner.id },
        data: {
          brandAccentColor: palette.accent,
          brandSecondaryColor: palette.secondary,
        },
      });
      const stand = await prisma.stand.findFirst({
        where: { ownerId: owner.id },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      if (stand) {
        await prisma.stand.update({
          where: { id: stand.id },
          data: {
            accentColor: palette.accent,
            secondaryColor: palette.secondary,
          },
        });
      }
    }

    await prisma.storefront.update({
      where: { ownerId: owner.id },
      data: {
        draftConfig: nextDraft as object,
        ...(generated.decorativeHeroUrl
          ? { heroImageUrl: generated.decorativeHeroUrl }
          : {}),
      },
    });

    const previewPath = `${storefrontPublicPath(storefront.slug)}/studio-preview?draft=1`;
    revalidatePath("/dashboard/website/ai");
    revalidatePath("/dashboard/website/studio");
    revalidatePath("/dashboard/website/details");
    revalidatePath("/dashboard/website/branding");
    revalidatePath(previewPath);

    return {
      ok: true,
      phase: "built",
      summary: generated.plan.changeSummary ?? "Draft website created.",
      designSystem: generated.studio.templateId,
      provider: `${generated.provider}/${generated.model}`,
      missing: generated.missing,
      previewPath,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Build failed";
    return { ok: false, error: message };
  }
}

/** @deprecated Prefer scaffold + build; kept for any legacy callers. */
export async function generateAiWebsiteDraft(
  prev: AiGenerateState,
  formData: FormData,
): Promise<AiGenerateState> {
  return scaffoldAiWebsiteDraft(prev, formData);
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
