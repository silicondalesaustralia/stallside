"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SerializedNodes } from "@craftjs/core";
import { randomUUID } from "crypto";
import { requireWebsiteOwner } from "@/lib/website/require-website-owner";
import type { Prisma } from "@/generated/prisma/client";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import {
  extractWebsiteStudio,
  mergeWebsiteStudioPageIntoRaw,
  withoutStudioPage,
  defaultTemplateId,
} from "@/lib/studio/storage";
import {
  DRAFT_CONFLICT_MESSAGE,
  writeStorefrontDraft,
} from "@/lib/website/persistence/draft-store";
import { writeDraftOrRedirect } from "@/lib/website/persistence/draft-redirect";
import { tryPublishStorefront } from "@/lib/website/persistence/publish";
import { craftPageSaveErrors } from "@/lib/website/adapter/validate-craft-page";
import {
  conflictResult,
  invalidResult,
  publishFailureResult,
  type EditorSaveResult,
} from "@/lib/website/persistence/editor-result";
import { validateStudioNodes } from "@/lib/studio/validate-state";
import type { StudioTemplateId } from "@/lib/studio/types";
import {
  CUSTOM_PAGE_TEMPLATES,
  extractCustomPages,
  mergeCustomPagesIntoRaw,
  findCustomPageById,
  isValidPageSlug,
  slugifyPageSlug,
  ensureCustomPages,
  customPagesNeedSync,
  type CustomPageTemplateId,
  type StorefrontCustomPage,
} from "@/lib/studio/custom-pages";
import { normalizeBusinessMode } from "@/lib/business-mode";

function parseTemplateId(raw: string): CustomPageTemplateId {
  const hit = CUSTOM_PAGE_TEMPLATES.find((t) => t.id === raw);
  if (!hit) redirect("/dashboard/website/pages/new?error=template");
  return hit.id;
}

function parseNodesJson(nodesJson: string): SerializedNodes {
  try {
    const parsed = JSON.parse(nodesJson) as SerializedNodes;
    const validation = validateStudioNodes(parsed);
    if (!validation.ok) redirect("/dashboard/website/pages?error=invalid");
    return parsed;
  } catch {
    redirect("/dashboard/website/pages?error=invalid");
  }
}

async function loadDraftConfig(ownerId: string, businessName: string) {
  const storefront = await ensureStorefront(ownerId, businessName);
  return storefront;
}

/** Persist merged builtin pages (about, contact, policy) when missing from draft config. */
export async function syncBuiltinCustomPages() {
  const { owner } = await requireWebsiteOwner();
  const storefront = await loadDraftConfig(owner.id, owner.businessName);
  if (!customPagesNeedSync(storefront.draftConfig)) return;

  const pages = ensureCustomPages(storefront.draftConfig);
  const saved = await writeStorefrontDraft({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    draftConfig: mergeCustomPagesIntoRaw(storefront.draftConfig, pages) as Prisma.InputJsonValue,
  });
  // Another write got in first; the next page load retries the sync.
  if (!saved.ok) return;
  revalidatePath("/dashboard/website/pages");
}

export async function createCustomPage(formData: FormData) {
  const { owner } = await requireWebsiteOwner();
  const template = parseTemplateId(String(formData.get("template") ?? ""));
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  const slugInput = slugifyPageSlug(String(formData.get("slug") ?? title));
  if (!title || !isValidPageSlug(slugInput)) {
    redirect("/dashboard/website/pages/new?error=slug");
  }

  const storefront = await loadDraftConfig(owner.id, owner.businessName);
  const pages = ensureCustomPages(storefront.draftConfig);
  if (pages.some((p) => p.slug === slugInput)) {
    redirect("/dashboard/website/pages/new?error=duplicate");
  }

  const page: StorefrontCustomPage = {
    id: randomUUID(),
    slug: slugInput,
    title,
    navLabel: title,
    template,
    enabled: true,
    showInNav: true,
    showInFooter: false,
    sortOrder: pages.length * 10 + 30,
    routeKind: "custom",
  };

  const merged = mergeCustomPagesIntoRaw(storefront.draftConfig, [...pages, page]);
  await writeDraftOrRedirect({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    draftConfig: merged as Prisma.InputJsonValue,
    conflictPath: "/dashboard/website/pages/new",
  });

  revalidatePath("/dashboard/website/pages");
  redirect(`/dashboard/website/pages/${page.id}?created=1`);
}

export async function updateCustomPageMeta(pageId: string, formData: FormData) {
  const { owner } = await requireWebsiteOwner();
  const storefront = await loadDraftConfig(owner.id, owner.businessName);
  const pages = ensureCustomPages(storefront.draftConfig);
  const page = findCustomPageById(pages, pageId);
  if (!page) redirect("/dashboard/website/pages?error=missing");

  const title = String(formData.get("title") ?? page.title).trim().slice(0, 80);
  const navLabel = String(formData.get("navLabel") ?? page.navLabel).trim().slice(0, 40);
  const slugInput =
    page.routeKind === "builtin"
      ? page.slug
      : slugifyPageSlug(String(formData.get("slug") ?? page.slug));
  const enabled = formData.get("enabled") === "on";
  const showInNav = formData.get("showInNav") === "on";
  const showInFooter = formData.get("showInFooter") === "on";

  if (page.routeKind === "custom" && !isValidPageSlug(slugInput)) {
    redirect(`/dashboard/website/pages/${pageId}?error=slug`);
  }
  if (pages.some((p) => p.id !== pageId && p.slug === slugInput)) {
    redirect(`/dashboard/website/pages/${pageId}?error=duplicate`);
  }

  const next = pages.map((p) =>
    p.id === pageId
      ? { ...p, title, navLabel: navLabel || title, slug: slugInput, enabled, showInNav, showInFooter }
      : p,
  );

  await writeDraftOrRedirect({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    draftConfig: mergeCustomPagesIntoRaw(storefront.draftConfig, next) as Prisma.InputJsonValue,
    conflictPath: `/dashboard/website/pages/${pageId}`,
  });

  revalidatePath("/dashboard/website/pages");
  revalidatePath(`/dashboard/website/pages/${pageId}`);
  redirect(`/dashboard/website/pages/${pageId}?saved=1`);
}

export async function deleteCustomPage(pageId: string) {
  const { owner } = await requireWebsiteOwner();
  const storefront = await loadDraftConfig(owner.id, owner.businessName);
  const pages = ensureCustomPages(storefront.draftConfig);
  const page = findCustomPageById(pages, pageId);
  if (!page || page.routeKind === "builtin") {
    redirect("/dashboard/website/pages?error=delete");
  }

  const nextPages = pages.filter((p) => p.id !== pageId);
  let merged = mergeCustomPagesIntoRaw(storefront.draftConfig, nextPages) as Prisma.InputJsonValue;
  const studio = extractWebsiteStudio(merged);
  if (studio?.pageNodes?.[pageId]) {
    const { [pageId]: _removed, ...rest } = studio.pageNodes;
    merged = withoutStudioPage(merged, studio.templateId, studio.nodes, rest);
  }

  await writeDraftOrRedirect({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    draftConfig: merged,
    conflictPath: "/dashboard/website/pages",
  });

  revalidatePath("/dashboard/website/pages");
  redirect("/dashboard/website/pages?deleted=1");
}

async function persistPageNodes(
  ownerId: string,
  businessName: string,
  businessMode: import("@/lib/business-mode").BusinessMode,
  pageId: string,
  nodes: SerializedNodes,
  expectedRevision: number,
) {
  const storefront = await loadDraftConfig(ownerId, businessName);
  const pages = ensureCustomPages(storefront.draftConfig);
  if (!findCustomPageById(pages, pageId)) {
    redirect("/dashboard/website/pages?error=missing");
  }
  const studio = extractWebsiteStudio(storefront.draftConfig);
  const templateId = defaultTemplateId(studio ?? null, normalizeBusinessMode(businessMode));
  const merged = mergeWebsiteStudioPageIntoRaw(
    storefront.draftConfig,
    templateId,
    pageId,
    nodes,
  );
  const saved = await writeStorefrontDraft({ ownerId, expectedRevision, draftConfig: merged });
  return saved.ok ? storefront.slug : null;
}

export async function saveCustomPageDraft(
  pageId: string,
  nodesJson: string,
  expectedRevision: number,
): Promise<EditorSaveResult> {
  const { owner } = await requireWebsiteOwner();
  const nodes = parseNodesJson(nodesJson);
  const invalid = craftPageSaveErrors(nodes, "content");
  if (invalid.length > 0) return invalidResult(invalid);
  const slug = await persistPageNodes(
    owner.id,
    owner.businessName,
    normalizeBusinessMode(owner.businessMode),
    pageId,
    nodes,
    expectedRevision,
  );
  if (!slug) return conflictResult(DRAFT_CONFLICT_MESSAGE);

  revalidatePath(`/dashboard/website/pages/${pageId}`);
  revalidatePath(`${storefrontPublicPath(slug)}`);
  redirect(`/dashboard/website/pages/${pageId}?saved=1`);
}

export async function publishCustomPageDraft(
  pageId: string,
  nodesJson: string,
  expectedRevision: number,
): Promise<EditorSaveResult> {
  const { owner, user } = await requireWebsiteOwner();
  const nodes = parseNodesJson(nodesJson);
  const invalid = craftPageSaveErrors(nodes, "content");
  if (invalid.length > 0) return invalidResult(invalid);
  const slug = await persistPageNodes(
    owner.id,
    owner.businessName,
    normalizeBusinessMode(owner.businessMode),
    pageId,
    nodes,
    expectedRevision,
  );
  if (!slug) return conflictResult(DRAFT_CONFLICT_MESSAGE);
  const published = await tryPublishStorefront(owner.id, user.id);
  if (!published.ok) return publishFailureResult(published);

  revalidatePath(`/dashboard/website/pages/${pageId}`);
  redirect(`/dashboard/website/pages/${pageId}?published=1`);
}

export async function reorderCustomPages(formData: FormData) {
  const { owner } = await requireWebsiteOwner();
  const orderRaw = String(formData.get("order") ?? "");
  const ids = orderRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const storefront = await loadDraftConfig(owner.id, owner.businessName);
  const pages = ensureCustomPages(storefront.draftConfig);
  const byId = new Map(pages.map((p) => [p.id, p]));
  const reordered: StorefrontCustomPage[] = [];
  ids.forEach((id, index) => {
    const p = byId.get(id);
    if (p) reordered.push({ ...p, sortOrder: (index + 1) * 10 });
  });
  for (const p of pages) {
    if (!ids.includes(p.id)) reordered.push(p);
  }

  await writeDraftOrRedirect({
    ownerId: owner.id,
    expectedRevision: storefront.draftRevision,
    draftConfig: mergeCustomPagesIntoRaw(storefront.draftConfig, reordered) as Prisma.InputJsonValue,
    conflictPath: "/dashboard/website/pages",
  });

  revalidatePath("/dashboard/website/pages");
  redirect("/dashboard/website/pages?reordered=1");
}
