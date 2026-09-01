import { appBaseUrl } from "@/lib/app-url";

export function shopHomePath(storefrontSlug: string, draft = false): string {
  const base = `/shop/${encodeURIComponent(storefrontSlug)}`;
  return draft ? `${base}?draft=1` : base;
}

export function shopPagePath(
  storefrontSlug: string,
  page: "shop" | "about" | "contact",
  draft = false,
): string {
  const base = `/shop/${encodeURIComponent(storefrontSlug)}/${page}`;
  return draft ? `${base}?draft=1` : base;
}

export function shopProductPath(
  storefrontSlug: string,
  productSlug: string,
  draft = false,
): string {
  const base = `/shop/${encodeURIComponent(storefrontSlug)}/product/${encodeURIComponent(productSlug)}`;
  return draft ? `${base}?draft=1` : base;
}

export function shopFullUrl(storefrontSlug: string, path = ""): string {
  const slug = encodeURIComponent(storefrontSlug);
  return `${appBaseUrl()}/shop/${slug}${path}`;
}
