import { storefrontPublicUrl } from "@/lib/tenancy/public-url";

export type StorefrontBreadcrumbItem = {
  label: string;
  href?: string;
};

export function buildStorefrontBreadcrumbs(
  slug: string,
  segments: { label: string; path?: string }[],
  primaryCustomHostname?: string | null,
): StorefrontBreadcrumbItem[] {
  return segments.map((seg, index) => {
    const isLast = index === segments.length - 1;
    if (isLast) return { label: seg.label };
    const path = seg.path ?? (index === 0 ? "/" : undefined);
    return {
      label: seg.label,
      href:
        path !== undefined
          ? storefrontPublicUrl(slug, {
              path: path === "/" ? undefined : path,
              primaryCustomHostname,
            })
          : undefined,
    };
  });
}

export function breadcrumbListSchema(
  slug: string,
  segments: { label: string; path?: string }[],
  pageUrl: string,
  primaryCustomHostname?: string | null,
) {
  const items = buildStorefrontBreadcrumbs(
    slug,
    segments,
    primaryCustomHostname,
  );
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: item.href } : {}),
    })),
  };
}
