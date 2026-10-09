"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import type { Prisma } from "@/generated/prisma/client";
import {
  ensureStorefront,
  loadStorefrontContext,
  storefrontPublicPath,
} from "@/lib/catalogue/storefront";
import {
  DRAFT_CONFLICT_MESSAGE,
  writeStorefrontDraft,
} from "@/lib/website/persistence/draft-store";
import { publishErrorCode, tryPublishStorefront } from "@/lib/website/persistence/publish";
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
import { applySelectedPagesToDraft } from "@/lib/website-ai/apply-selected-pages";
import type { BrandLookCombo } from "@/lib/website/brand-looks";
import { getPalette } from "@/lib/website/brand-looks";
import {
  recommendWebsiteBlueprint,
  resolveBlueprintChoice,
  getWebsiteBlueprint,
} from "@/lib/website/blueprints";
import { resolveDemoKit } from "@/lib/website/demo-kits";
import { webStudioPath } from "@/lib/website/web-studio-nav";

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
  recommendedBlueprintId?: string;
  recommendationReason?: string;
  businessName?: string;
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
  const { owner } = await requireWebsiteOwner();
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

    const recommendation = recommendWebsiteBlueprint(
      prepared.businessContext,
      prepared.intent.selectedPages ?? [],
      prepared.intent,
    );

    const refreshed = await ensureStorefront(owner.id, owner.businessName);
    const draft = mergeWebsiteAiScaffoldIntoRaw(refreshed.draftConfig, {
      version: WEBSITE_AI_SCAFFOLD_VERSION,
      plan: generated.plan,
      intent: prepared.intent,
      looks: generated.looks,
      createdAt: new Date().toISOString(),
    });
    const saved = await writeStorefrontDraft({
      ownerId: owner.id,
      expectedRevision: refreshed.draftRevision,
      draftConfig: draft,
    });
    if (!saved.ok) return { ok: false, error: DRAFT_CONFLICT_MESSAGE };

    revalidatePath("/dashboard/website/ai");
    return {
      ok: true,
      phase: "scaffold",
      summary: "Pick a starting style and colour palette, then build your site.",
      provider: `${generated.provider}/${generated.model}`,
      missing: generated.missing,
      looks: generated.looks,
      recommendedBlueprintId: recommendation.recommendedBlueprintId,
      recommendationReason: recommendation.userFacingReason,
      businessName: prepared.businessContext.businessName,
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
  const { owner } = await requireWebsiteOwner();
  if (!canUseAiWebsiteBuilder(owner.id)) {
    return { ok: false, error: "AI website builder is not enabled for this account." };
  }

  const lookId = String(formData.get("lookId") ?? "").trim();
  if (!lookId) return { ok: false, error: "Choose a look first." };
  const blueprintChoice = String(formData.get("blueprintId") ?? "vendl-choose").trim();
  const fontPairId = String(formData.get("fontPairId") ?? "").trim() || null;
  const demoKitRaw = String(formData.get("demoKitId") ?? "").trim();
  const demoKitId = resolveDemoKit(demoKitRaw)?.id ?? null;

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

    const recommendation = recommendWebsiteBlueprint(
      businessContext,
      scaffold.intent.selectedPages ?? [],
      scaffold.intent,
    );
    const { blueprintId } = resolveBlueprintChoice(blueprintChoice, recommendation);
    const blueprint = getWebsiteBlueprint(blueprintId);
    const intent = {
      ...scaffold.intent,
      blueprintId,
      layoutRecipe: scaffold.intent.layoutRecipe ?? blueprint.layoutRecipe,
    };

    const replanned = await scaffoldWebsiteDraft({
      businessContext,
      intent,
    });
    if (!replanned.ok) {
      return { ok: false, error: replanned.error, details: replanned.details };
    }

    const generated = await finalizeWebsiteDraft({
      businessContext,
      intent,
      plan: replanned.plan,
      lookId,
      looks: scaffold.looks,
      fontPairId,
      demoKitId,
      provider: replanned.provider,
      model: replanned.model,
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
    const withPages = applySelectedPagesToDraft(
      baseRaw,
      scaffold.intent.selectedPages ?? [],
      scaffold.intent.selectedCapabilities ?? [],
    );
    const studioMerged = mergeWebsiteStudioIntoRaw(
      withPages,
      generated.studio.templateId,
      generated.studio.nodes,
      generated.studio.pageNodes,
    );
    const studioObj =
      studioMerged && typeof studioMerged === "object"
        ? (studioMerged as Record<string, unknown>)
        : {};
    const palette = getPalette(generated.themeOverrides?.paletteId);
    const accent = generated.themeOverrides?.accentColor ?? palette?.accent;
    const secondary = generated.themeOverrides?.secondaryColor ?? palette?.secondary;
    const nextDraft: Record<string, unknown> = {
      ...withPages,
      ...studioObj,
      themeOverrides: {
        ...baseConfig.themeOverrides,
        ...generated.themeOverrides,
        ...(accent && secondary ? { accentColor: accent, secondaryColor: secondary } : {}),
      },
      identity: {
        ...baseConfig.identity,
        ...(scaffold.intent.sellerAbout && scaffold.intent.sellerAbout.length > 40
          ? { about: scaffold.intent.sellerAbout.slice(0, 2000) }
          : {}),
        ...(generated.decorativeHeroUrl ? { heroImageUrl: generated.decorativeHeroUrl } : {}),
      },
      initialBlueprintId: blueprintId,
    };
    delete nextDraft.websiteAiScaffold;

    const saved = await writeStorefrontDraft({
      ownerId: owner.id,
      expectedRevision: storefront.draftRevision,
      draftConfig: nextDraft as Prisma.InputJsonValue,
    });
    if (!saved.ok) return { ok: false, error: DRAFT_CONFLICT_MESSAGE };

    const previewPath = `${storefrontPublicPath(storefront.slug)}/studio-preview?draft=1`;
    revalidatePath("/dashboard/website/web-studio");
    revalidatePath("/dashboard/website/ai");
    revalidatePath("/dashboard/website/studio");
    revalidatePath("/dashboard/website/details");
    revalidatePath("/dashboard/website/branding");
    revalidatePath("/dashboard/website/pages");
    revalidatePath("/dashboard/website/navigation");
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
  const { owner, user } = await requireWebsiteOwner();
  if (!canUseAiWebsiteBuilder(owner.id)) {
    redirect(webStudioPath("studio"));
  }
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const published = await tryPublishStorefront(owner.id, user.id);
  if (!published.ok) redirect(webStudioPath("ai", { error: publishErrorCode(published) }));
  revalidatePath("/dashboard/website/web-studio");
  revalidatePath("/dashboard/website/ai");
  revalidatePath("/dashboard/website/studio");
  revalidatePath(storefrontPublicPath(storefront.slug));
  redirect(webStudioPath("ai", { published: "1" }));
}
