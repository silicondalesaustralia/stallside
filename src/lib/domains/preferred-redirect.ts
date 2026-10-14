import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { resolveHostname } from "@/lib/tenancy/hostname";
import { publicHostnameFromHeaders } from "@/lib/tenancy/request-hostname";
import { customDomainsRoutingEnabled } from "@/lib/domains/config";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { prisma } from "@/lib/prisma";
import { storefrontRelativePath } from "@/lib/studio/redirects";
import {
  storefrontSubdomainOrigin,
  storefrontSubdomainPrimaryEnabled,
} from "@/lib/tenancy/public-url";

/**
 * Sends a published site to its preferred origin, keeping the deep path + query:
 * - primary custom domain set → subdomain, `/shop/{slug}` and other custom hosts (www/apex) go there;
 * - otherwise `vendl.app/shop/{slug}` goes to `{slug}.vendl.app`.
 * Temporary (307) because the preferred origin changes when a domain is added, made
 * primary or removed, and browsers cache permanent redirects.
 */
export async function applyPreferredOriginRedirect(storefrontSlug: string) {
  const headersList = await headers();
  const search = headersList.get("x-stallside-search") ?? "";
  if (search.includes("draft=1")) return;

  const storefront = await prisma.storefront.findFirst({
    where: { slug: storefrontSlug.trim().toLowerCase(), isPublished: true },
    select: { id: true, slug: true },
  });
  if (!storefront) return;

  const host = publicHostnameFromHeaders(headersList);
  const resolution = resolveHostname(host);
  const pathname = headersList.get("x-stallside-pathname") ?? "";
  const shopPrefix = `/shop/${storefront.slug}`;
  const onApexPath =
    resolution.type === "APP" && (pathname === shopPrefix || pathname.startsWith(`${shopPrefix}/`));
  const relative = storefrontRelativePath(pathname, storefront.slug) || "/";
  const destPath = relative === "/" ? "" : relative;

  const primary = customDomainsRoutingEnabled() ? await loadPrimaryCustomHostname(storefront.id) : null;
  if (primary) {
    if (resolution.type === "CUSTOM_DOMAIN" && resolution.hostname === primary) return;
    const onOwnSubdomain =
      (resolution.type === "VENDL_SUBDOMAIN" || resolution.type === "STAGING_SUBDOMAIN") &&
      resolution.slug === storefront.slug;
    const onOtherCustomHost = resolution.type === "CUSTOM_DOMAIN";
    if (onOwnSubdomain || onApexPath || onOtherCustomHost) {
      redirect(`https://${primary}${destPath}${search}`);
    }
    return;
  }

  if (onApexPath && storefrontSubdomainPrimaryEnabled()) {
    redirect(`${storefrontSubdomainOrigin(storefront.slug)}${destPath}${search}`);
  }
}
