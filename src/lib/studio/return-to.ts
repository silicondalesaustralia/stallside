import { storefrontPublicPath } from "@/lib/catalogue/storefront";

/** Allow only this shop's studio-preview URLs as post-save redirects. */
export function safeStudioPreviewReturnTo(
  slug: string,
  candidate: string | undefined,
): string | null {
  if (!candidate) return null;
  const base = `${storefrontPublicPath(slug)}/studio-preview`;
  if (!candidate.startsWith(base)) return null;
  if (candidate.includes("//") || candidate.includes("\\")) return null;
  try {
    const url = new URL(candidate, "https://vendl.local");
    if (url.pathname !== base && !url.pathname.startsWith(`${base}/`)) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export function studioPreviewEditPath(slug: string): string {
  return `${storefrontPublicPath(slug)}/studio-preview?draft=1&edit=1`;
}

export function studioPreviewViewPath(slug: string): string {
  return `${storefrontPublicPath(slug)}/studio-preview?draft=1`;
}
