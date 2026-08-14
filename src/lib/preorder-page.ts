import { SITE_URL } from "@/lib/legal";
import { formatCollectionLabel } from "@/lib/pre-order";

export function preOrderPagesPath(standSlug: string) {
  return `/s/${standSlug}/pre`;
}

export function preOrderPagePath(standSlug: string, pageSlug: string) {
  return `/s/${standSlug}/pre/${pageSlug}`;
}

export function preOrderPageUrl(standSlug: string, pageSlug: string) {
  return `${SITE_URL}${preOrderPagePath(standSlug, pageSlug)}`;
}

export function defaultPreOrderPageTitle(collectionAt: Date) {
  return `Pre-order ${formatCollectionLabel(collectionAt)}`;
}
