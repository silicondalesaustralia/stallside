"use server";

import { ensureStorefront } from "@/lib/catalogue/storefront";
import { requireTagsPixelsOwner } from "./require-tags-owner";
import { extractStorefrontTracking, hasAnyTracking } from "@/lib/website/tracking/config";
import { checkTrackingInstall } from "@/lib/website/tracking/server/install-check";
import { liveSiteOrigin } from "@/lib/website/tracking/server/live-origin";
import type { InstallCheckState } from "./tags-state";

export async function checkTagInstallation(): Promise<InstallCheckState> {
  const { owner } = await requireTagsPixelsOwner();
  try {
    const storefront = await ensureStorefront(owner.id, owner.businessName);
    if (!storefront.isPublished || !storefront.publishedConfig) {
      return { status: "error", message: "Publish your website first, then make your tags live.", lines: [] };
    }
    const live = extractStorefrontTracking(storefront.publishedConfig);
    if (!hasAnyTracking(live)) {
      return { status: "error", message: "No tags are live yet. Save, then press Make tags live.", lines: [] };
    }
    const url = `${await liveSiteOrigin(storefront)}/`;
    const result = await checkTrackingInstall(url, live);
    if (!result.ok) return { status: "error", message: result.error, url: result.url, lines: [] };
    const missing = result.lines.filter((l) => !l.ok).length;
    return {
      status: "done",
      url: result.url,
      message: missing === 0 ? "Everything live is installed." : `${missing} tag(s) not found yet.`,
      lines: result.lines,
    };
  } catch (error) {
    console.error("Tag installation check failed", error);
    return { status: "error", message: "The check failed. Please try again.", lines: [] };
  }
}
