import { MenuKind } from "@/generated/prisma/client";
import { appBaseUrl } from "@/lib/app-url";
import { formatCollectionLabel } from "@/lib/pre-order";
import {
  standMenuDetailPath,
  standMenusPath,
} from "@/lib/stand-seo";
import { shopHomePath } from "@/lib/storefront/paths";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";

export { standMenusPath, standMenuDetailPath as standMenuPath };

export function shopMenusPath(
  storefrontSlug: string,
  draft = false,
  basePath?: string,
) {
  const root =
    basePath !== undefined
      ? basePath
      : `/shop/${encodeURIComponent(storefrontSlug)}`;
  const base = root ? `${root}/menu` : "/menu";
  return draft ? `${base}?draft=1` : base;
}

export function shopMenuPath(
  storefrontSlug: string,
  menuSlug: string,
  draft = false,
  basePath?: string,
) {
  const root =
    basePath !== undefined
      ? basePath
      : `/shop/${encodeURIComponent(storefrontSlug)}`;
  const base = root
    ? `${root}/menu/${encodeURIComponent(menuSlug)}`
    : `/menu/${encodeURIComponent(menuSlug)}`;
  return draft ? `${base}?draft=1` : base;
}

export function menuPublicUrl(input: {
  storefrontSlug?: string | null;
  standSlug: string;
  menuSlug: string;
  showOnShop: boolean;
}) {
  if (input.showOnShop && input.storefrontSlug) {
    return storefrontPublicUrl(input.storefrontSlug, {
      path: `/menu/${encodeURIComponent(input.menuSlug)}`,
    });
  }
  return `${appBaseUrl()}${standMenuDetailPath(input.standSlug, input.menuSlug)}`;
}

export function menuKindLabel(kind: MenuKind): string {
  return kind === MenuKind.PREORDER_DROP ? "Pre-order drop" : "Always available";
}

export function menuScheduleLabel(input: {
  kind: MenuKind;
  collectionAt: Date | null;
  timeZone?: string;
}): string | null {
  if (input.kind !== MenuKind.PREORDER_DROP || !input.collectionAt) return null;
  return formatCollectionLabel(input.collectionAt, input.timeZone);
}

export function isMenuDropOpen(input: {
  kind: MenuKind;
  orderByAt: Date | null;
}): boolean {
  if (input.kind !== MenuKind.PREORDER_DROP) return true;
  if (!input.orderByAt) return false;
  return input.orderByAt.getTime() > Date.now();
}

export { shopHomePath };
