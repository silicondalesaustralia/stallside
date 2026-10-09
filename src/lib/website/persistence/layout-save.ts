import type { SerializedNodes } from "@craftjs/core";
import { normalizeBusinessMode } from "@/lib/business-mode";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { commerceKeyForKind, type CommercePageKind } from "@/lib/studio/commerce-pages";
import { ensureCustomPages, findCustomPageById } from "@/lib/studio/custom-pages";
import {
  defaultTemplateId,
  extractWebsiteStudio,
  mergeWebsiteStudioIntoRaw,
  mergeWebsiteStudioPageIntoRaw,
} from "@/lib/studio/storage";
import type { StudioTemplateId } from "@/lib/studio/types";
import { craftPageSaveErrors } from "@/lib/website/adapter/validate-craft-page";
import type { PageKind } from "@/lib/website/sections/fields";
import { writeStorefrontDraft } from "./draft-store";
import { DRAFT_CONFLICT_MESSAGE } from "./messages";

export type LayoutTarget =
  | { kind: "home"; templateId: StudioTemplateId }
  | { kind: "page"; pageId: string }
  | { kind: "commerce"; commerceKind: CommercePageKind };

export type LayoutSaveResult =
  | { ok: true; revision: number; slug: string }
  | { ok: false; error: "conflict" | "invalid" | "missing"; message: string };

type LayoutOwner = { id: string; businessName: string; businessMode: string | null | undefined };

function pageKindFor(target: LayoutTarget): PageKind {
  if (target.kind === "home") return "home";
  if (target.kind === "page") return "content";
  return target.commerceKind;
}

/** Validates and writes one page layout to the draft, revision-guarded. Never redirects. */
export async function saveLayoutToDraft(
  owner: LayoutOwner,
  target: LayoutTarget,
  nodes: SerializedNodes,
  expectedRevision: number,
): Promise<LayoutSaveResult> {
  const invalid = craftPageSaveErrors(nodes, pageKindFor(target));
  if (invalid.length > 0) return { ok: false, error: "invalid", message: `Can't save: ${invalid.join(" ")}` };

  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const draft = storefront.draftConfig;
  const templateId = defaultTemplateId(
    extractWebsiteStudio(draft) ?? null,
    normalizeBusinessMode(owner.businessMode),
  );
  let merged;
  if (target.kind === "home") {
    merged = mergeWebsiteStudioIntoRaw(draft, target.templateId, nodes);
  } else if (target.kind === "page") {
    if (!findCustomPageById(ensureCustomPages(draft), target.pageId)) {
      return { ok: false, error: "missing", message: "This page no longer exists." };
    }
    merged = mergeWebsiteStudioPageIntoRaw(draft, templateId, target.pageId, nodes);
  } else {
    merged = mergeWebsiteStudioPageIntoRaw(draft, templateId, commerceKeyForKind(target.commerceKind), nodes);
  }

  const saved = await writeStorefrontDraft({ ownerId: owner.id, expectedRevision, draftConfig: merged });
  if (!saved.ok) return { ok: false, error: "conflict", message: DRAFT_CONFLICT_MESSAGE };
  return { ok: true, revision: saved.revision, slug: storefront.slug };
}
