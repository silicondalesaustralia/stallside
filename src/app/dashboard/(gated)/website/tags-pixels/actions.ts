"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { requireTagsPixelsOwner } from "./require-tags-owner";
import { patchLiveConfig } from "@/lib/website/persistence/live-patch";
import { writeStorefrontDraft, DRAFT_CONFLICT_MESSAGE } from "@/lib/website/persistence/draft-store";
import { tagItemBySlug } from "@/lib/website/tracking/catalog";
import { extractStorefrontTracking, mergeStorefrontTrackingIntoRaw } from "@/lib/website/tracking/config";
import { parseCustomHeadCode } from "@/lib/website/tracking/custom-code";
import { normalizeTrackingIds } from "@/lib/website/tracking/normalize";
import type { StorefrontTracking, TrackingIdKey } from "@/lib/website/tracking/types";
import { TAGS_PATH, type TagsSaveState } from "./tags-state";

type Applied = { next: StorefrontTracking } | { error: string; errors?: TagsSaveState["errors"] };

function applyItem(slug: string, formData: FormData, current: StorefrontTracking): Applied {
  const item = tagItemBySlug(slug);
  if (!item) return { error: "Unknown tag." };
  const remove = formData.get("intent") === "remove";
  if (item.kind === "consent") {
    const mode = String(formData.get("consentMode") ?? "");
    const consentMode = mode === "off" || mode === "all" ? mode : "eu";
    return { next: { ...current, consentMode, privacyNotice: Boolean(formData.get("privacyNotice")) } };
  }
  if (item.kind === "custom") {
    const customHead = remove ? "" : String(formData.get("customHead") ?? "").trim();
    if (customHead && customHead !== current.customHead && !formData.get("customAck")) {
      return { error: "Tick the box to confirm you trust the custom code before saving it." };
    }
    return { next: { ...current, customHead } };
  }
  const input: Partial<Record<TrackingIdKey, string>> = {};
  for (const key of item.keys) input[key] = remove ? "" : String(formData.get(key) ?? "");
  const { ids, errors } = normalizeTrackingIds(input);
  if (Object.keys(errors).length > 0) return { error: "Check the highlighted field. Nothing was saved.", errors };
  const kept = { ...current.ids };
  for (const key of item.keys) delete kept[key];
  return { next: { ...current, ids: { ...kept, ...ids } } };
}

export async function saveTagItem(_prev: TagsSaveState, formData: FormData): Promise<TagsSaveState> {
  const { owner } = await requireTagsPixelsOwner();
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") values[key] = value;
  const removing = formData.get("intent") === "remove";
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const applied = applyItem(String(formData.get("slug") ?? ""), formData, extractStorefrontTracking(storefront.draftConfig));
  if ("error" in applied) {
    return { status: "error", message: applied.error, errors: applied.errors ?? {}, values, warnings: [] };
  }
  const fail = (message: string): TagsSaveState => ({ status: "error", message, errors: {}, values, warnings: [] });

  try {
    const next = mergeStorefrontTrackingIntoRaw(storefront.draftConfig, {
      ...applied.next,
      updatedAt: new Date().toISOString(),
    });
    const saved = await writeStorefrontDraft({
      ownerId: owner.id,
      expectedRevision: storefront.draftRevision,
      draftConfig: next as Prisma.InputJsonValue,
    });
    if (!saved.ok) return fail(DRAFT_CONFLICT_MESSAGE);
  } catch (error) {
    console.error("Save tracking settings failed", error);
    return fail("Couldn't save. Please try again.");
  }

  revalidatePath(TAGS_PATH, "layout");
  const warnings = parseCustomHeadCode(applied.next.customHead).warnings;
  const message = removing ? "Removed. Make tags live to update your website." : "Saved. Make tags live to use it on your website.";
  return { status: "saved", message, errors: {}, values: {}, warnings: formData.has("customHead") ? warnings : [] };
}

/** Makes only the tags & pixels live; other draft edits wait for "Publish website". */
export async function publishTrackingLive(formData: FormData) {
  const { owner } = await requireTagsPixelsOwner();
  const item = tagItemBySlug(String(formData.get("slug") ?? ""));
  const back = item ? `${TAGS_PATH}/${item.slug}` : TAGS_PATH;
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const tracking = extractStorefrontTracking(storefront.draftConfig);
  const applied = await patchLiveConfig(
    owner.id,
    (publishedConfig) => mergeStorefrontTrackingIntoRaw(publishedConfig, tracking) as Prisma.InputJsonValue,
  );
  if (!applied) redirect(`${back}?error=not_published`);
  revalidatePath(TAGS_PATH, "layout");
  revalidatePath(storefrontPublicPath(storefront.slug), "layout");
  redirect(`${back}?published=1`);
}
