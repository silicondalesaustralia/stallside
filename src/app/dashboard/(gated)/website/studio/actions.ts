"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SerializedNodes } from "@craftjs/core";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import type { Prisma } from "@/generated/prisma/client";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import {
  DRAFT_CONFLICT_MESSAGE,
  writeStorefrontDraft,
} from "@/lib/website/persistence/draft-store";
import { tryPublishStorefront } from "@/lib/website/persistence/publish";
import {
  conflictResult,
  publishFailureResult,
  type EditorSaveResult,
} from "@/lib/website/persistence/editor-result";
import {
  extractWebsiteStudio,
  mergeWebsiteStudioIntoRaw,
} from "@/lib/studio/storage";
import { validateStudioNodes } from "@/lib/studio/validate-state";
import type { StudioTemplateId } from "@/lib/studio/types";
import { webStudioPath } from "@/lib/website/web-studio-nav";
import { safeStudioPreviewReturnTo } from "@/lib/studio/return-to";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import {
  isBrandMarkMode,
  isHeaderLayout,
  type BrandMarkMode,
  type HeaderLayout,
} from "@/lib/storefront/header-style";

function parseTemplateId(raw: string): StudioTemplateId {
  if (raw === "artisan" || raw === "farmhouse" || raw === "market") return raw;
  redirect(webStudioPath("studio", { error: "invalid" }));
}

function parseNodesJson(nodesJson: string): SerializedNodes {
  try {
    const parsed = JSON.parse(nodesJson) as SerializedNodes;
    const validation = validateStudioNodes(parsed);
    if (!validation.ok) {
      redirect(webStudioPath("studio", { error: "invalid" }));
    }
    return parsed;
  } catch {
    redirect(webStudioPath("studio", { error: "invalid" }));
  }
}

function redirectAfterSave(
  slug: string,
  returnTo: string | undefined,
  query: Record<string, string>,
): never {
  const safe = safeStudioPreviewReturnTo(slug, returnTo);
  if (safe) {
    const url = new URL(safe, "https://vendl.local");
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    url.searchParams.set("draft", "1");
    url.searchParams.set("edit", "1");
    redirect(`${url.pathname}?${url.searchParams.toString()}`);
  }
  redirect(webStudioPath("studio", query));
}

async function persistWebsiteStudioDraft(
  ownerId: string,
  businessName: string,
  templateId: StudioTemplateId,
  nodes: SerializedNodes,
  expectedRevision: number,
) {
  const storefront = await ensureStorefront(ownerId, businessName);
  const merged = mergeWebsiteStudioIntoRaw(storefront.draftConfig, templateId, nodes);
  const saved = await writeStorefrontDraft({ ownerId, expectedRevision, draftConfig: merged });
  return saved.ok ? storefront.slug : null;
}

export async function saveWebsiteStudioDraft(
  nodesJson: string,
  templateIdRaw: string,
  expectedRevision: number,
  returnTo?: string,
): Promise<EditorSaveResult> {
  const { owner } = await requireWebsiteOwner();
  const templateId = parseTemplateId(templateIdRaw);
  const nodes = parseNodesJson(nodesJson);
  const slug = await persistWebsiteStudioDraft(
    owner.id,
    owner.businessName,
    templateId,
    nodes,
    expectedRevision,
  );
  if (!slug) return conflictResult(DRAFT_CONFLICT_MESSAGE);

  revalidatePath("/dashboard/website/web-studio");
  revalidatePath("/dashboard/website/studio");
  revalidatePath(`${storefrontPublicPath(slug)}/studio-preview`);
  redirectAfterSave(slug, returnTo, { saved: "1" });
}

export async function publishWebsiteStudioDraft(
  nodesJson: string,
  templateIdRaw: string,
  expectedRevision: number,
  returnTo?: string,
): Promise<EditorSaveResult> {
  const { owner, user } = await requireWebsiteOwner();
  const templateId = parseTemplateId(templateIdRaw);
  const nodes = parseNodesJson(nodesJson);
  const slug = await persistWebsiteStudioDraft(
    owner.id,
    owner.businessName,
    templateId,
    nodes,
    expectedRevision,
  );
  if (!slug) return conflictResult(DRAFT_CONFLICT_MESSAGE);
  const published = await tryPublishStorefront(owner.id, user.id);
  if (!published.ok) return publishFailureResult(published);

  revalidatePath("/dashboard/website/web-studio");
  revalidatePath("/dashboard/website/studio");
  revalidatePath(`${storefrontPublicPath(slug)}/studio-preview`);
  redirectAfterSave(slug, returnTo, { published: "1" });
}

export async function applyWebsiteStudioTemplate(templateIdRaw: string) {
  const { owner } = await requireWebsiteOwner();
  const templateId = parseTemplateId(templateIdRaw);
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const existing = extractWebsiteStudio(storefront.draftConfig);

  if (existing?.nodes) {
    const merged = mergeWebsiteStudioIntoRaw(
      storefront.draftConfig,
      templateId,
      existing.nodes,
    );
    const saved = await writeStorefrontDraft({
      ownerId: owner.id,
      expectedRevision: storefront.draftRevision,
      draftConfig: merged,
    });
    if (!saved.ok) redirect(webStudioPath("studio", { error: "conflict" }));
    revalidatePath("/dashboard/website/web-studio");
    revalidatePath("/dashboard/website/studio");
    redirect(webStudioPath("studio", { template: "applied" }));
  }

  redirect(webStudioPath("studio", { template: templateId }));
}

export async function saveStorefrontHeaderStyle(input: {
  headerLayout?: string;
  brandMark?: string;
  expectedRevision: number;
}): Promise<{ ok: true; revision: number } | { ok: false; error: string }> {
  const { owner } = await requireWebsiteOwner();
  try {
    const storefront = await ensureStorefront(owner.id, owner.businessName);
    const base = parseStorefrontConfig(storefront.draftConfig);
    const patch: { headerLayout?: HeaderLayout; brandMark?: BrandMarkMode } = {};
    if (isHeaderLayout(input.headerLayout)) patch.headerLayout = input.headerLayout;
    if (isBrandMarkMode(input.brandMark)) patch.brandMark = input.brandMark;
    if (!patch.headerLayout && !patch.brandMark) {
      return { ok: false, error: "Invalid header style." };
    }
    const nextDraft = {
      ...(storefront.draftConfig &&
      typeof storefront.draftConfig === "object" &&
      !Array.isArray(storefront.draftConfig)
        ? (storefront.draftConfig as Record<string, unknown>)
        : {}),
      themeOverrides: {
        ...base.themeOverrides,
        ...patch,
      },
    };
    const saved = await writeStorefrontDraft({
      ownerId: owner.id,
      expectedRevision: input.expectedRevision,
      draftConfig: nextDraft as Prisma.InputJsonValue,
    });
    if (!saved.ok) return { ok: false, error: DRAFT_CONFLICT_MESSAGE };
    revalidatePath("/dashboard/website/web-studio");
    revalidatePath("/dashboard/website/studio");
    revalidatePath(`${storefrontPublicPath(storefront.slug)}/studio-preview`);
    return { ok: true, revision: saved.revision };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save header style.",
    };
  }
}
