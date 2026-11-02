"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { ensureStorefront, storefrontPublicPath } from "@/lib/catalogue/storefront";
import { requireTagsPixelsOwner } from "./require-tags-owner";
import { patchLiveConfig } from "@/lib/website/persistence/live-patch";
import { writeStorefrontDraft, DRAFT_CONFLICT_MESSAGE } from "@/lib/website/persistence/draft-store";
import { extractStorefrontTracking, mergeStorefrontTrackingIntoRaw } from "@/lib/website/tracking/config";
import { parseCustomHeadCode } from "@/lib/website/tracking/custom-code";
import { normalizeTrackingIds } from "@/lib/website/tracking/normalize";
import { TRACKING_ID_KEYS, type TrackingConsentMode, type TrackingIdKey } from "@/lib/website/tracking/types";
import { TAGS_PATH, type TagsSaveState } from "./tags-state";

function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const key of [...TRACKING_ID_KEYS, "consentMode", "customHead"]) {
    values[key] = String(formData.get(key) ?? "");
  }
  values.privacyNotice = formData.get("privacyNotice") ? "1" : "";
  return values;
}

export async function saveTrackingSettings(_prev: TagsSaveState, formData: FormData): Promise<TagsSaveState> {
  const { owner } = await requireTagsPixelsOwner();
  const values = formValues(formData);
  const idInput: Partial<Record<TrackingIdKey, string>> = {};
  for (const key of TRACKING_ID_KEYS) idInput[key] = values[key];
  const { ids, errors } = normalizeTrackingIds(idInput);
  const fail = (message: string): TagsSaveState => ({ status: "error", message, errors, values, warnings: [] });
  if (Object.keys(errors).length > 0) return fail("Some IDs need fixing. Nothing was saved.");

  const customHead = values.customHead.trim();
  const parsed = parseCustomHeadCode(customHead);
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const current = extractStorefrontTracking(storefront.draftConfig);
  if (customHead && customHead !== current.customHead && !formData.get("customAck")) {
    return fail("Tick the box to confirm you trust the custom code before saving it.");
  }
  const consentMode: TrackingConsentMode =
    values.consentMode === "off" || values.consentMode === "all" ? values.consentMode : "eu";

  try {
    const next = mergeStorefrontTrackingIntoRaw(storefront.draftConfig, {
      ids,
      consentMode,
      privacyNotice: values.privacyNotice === "1",
      customHead,
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

  revalidatePath(TAGS_PATH);
  return { status: "saved", message: "Saved. Make tags live to use them on your website.", errors: {}, values: {}, warnings: parsed.warnings };
}

/** Makes only the tags & pixels live; other draft edits wait for "Publish website". */
export async function publishTrackingLive() {
  const { owner } = await requireTagsPixelsOwner();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const tracking = extractStorefrontTracking(storefront.draftConfig);
  const applied = await patchLiveConfig(
    owner.id,
    (publishedConfig) => mergeStorefrontTrackingIntoRaw(publishedConfig, tracking) as Prisma.InputJsonValue,
  );
  if (!applied) redirect(`${TAGS_PATH}?error=not_published`);
  revalidatePath(TAGS_PATH);
  revalidatePath(storefrontPublicPath(storefront.slug), "layout");
  redirect(`${TAGS_PATH}?published=1`);
}
