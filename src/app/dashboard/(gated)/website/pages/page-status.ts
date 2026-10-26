import type { PillSpec } from "@/components/dashboard/ui/StatusPill";
import { ensureCustomPages, type StorefrontCustomPage } from "@/lib/studio/custom-pages";

/** live: on the published site. pending: switched on but the site hasn't been updated since. off: unpublished. */
export type PageStatus = "live" | "pending" | "off";

export const PAGE_STATUS_PILL: Record<PageStatus, PillSpec & { title: string }> = {
  live: { label: "Published", tone: "success", title: "Visible on your live website." },
  pending: {
    label: "Not live yet",
    tone: "attention",
    title: "Switched on, but your website hasn't been updated since. Use Update published in the site editor.",
  },
  off: { label: "Unpublished", tone: "neutral", title: "Hidden from your website." },
};

export function liveCustomPageIds(isPublished: boolean, publishedConfig: unknown): Set<string> {
  if (!isPublished || publishedConfig == null) return new Set();
  return new Set(ensureCustomPages(publishedConfig).filter((p) => p.enabled).map((p) => p.id));
}

export function customPageStatus(page: StorefrontCustomPage, liveIds: Set<string>): PageStatus {
  if (!page.enabled) return "off";
  return liveIds.has(page.id) ? "live" : "pending";
}
