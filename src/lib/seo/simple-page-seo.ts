import type { StorefrontContext } from "@/lib/catalogue/storefront";
import type { PageSeo, WebPageType } from "./graph/page-graph";

/** A page one level below home: Home › {name}. */
export function simplePageSeo(
  ctx: NonNullable<StorefrontContext>,
  path: string,
  name: string,
  extra: Omit<PageSeo, "path" | "name" | "breadcrumb"> & { type?: WebPageType } = {},
): PageSeo {
  return {
    ...extra,
    path,
    name,
    breadcrumb: [{ label: ctx.branding.headline, path: "/" }, { label: name }],
  };
}
