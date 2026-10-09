import { headers } from "next/headers";
import { permanentRedirect } from "next/navigation";
import { resolveHostname } from "@/lib/tenancy/hostname";
import { publicHostnameFromHeaders } from "@/lib/tenancy/request-hostname";
import { customDomainsRoutingEnabled } from "@/lib/domains/config";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { prisma } from "@/lib/prisma";
import { storefrontRelativePath } from "@/lib/studio/redirects";

/**
 * When a custom hostname is primary, redirect Vendl subdomain and
 * /shop/{slug} path hosts to the preferred origin (preserve deep path + query).
 */
export async function applyPreferredOriginRedirect(storefrontSlug: string) {
  if (!customDomainsRoutingEnabled()) return;

  const headersList = await headers();
  const search = headersList.get("x-stallside-search") ?? "";
  if (search.includes("draft=1")) return;

  const storefront = await prisma.storefront.findFirst({
    where: { slug: storefrontSlug.trim().toLowerCase(), isPublished: true },
    select: { id: true, slug: true },
  });
  if (!storefront) return;

  const primary = await loadPrimaryCustomHostname(storefront.id);
  if (!primary) return;

  // Use CF-preserved seller host when Host was rewritten to fallback.vendl.app
  const host = publicHostnameFromHeaders(headersList);
  const resolution = resolveHostname(host);
  const onPreferred =
    resolution.type === "CUSTOM_DOMAIN" && resolution.hostname === primary;
  if (onPreferred) return;

  const onVendlSub =
    resolution.type === "VENDL_SUBDOMAIN" &&
    resolution.slug === storefront.slug;
  const pathname = headersList.get("x-stallside-pathname") ?? "";
  const onPathShop =
    resolution.type === "APP" ||
    resolution.type === "LOCAL" ||
    resolution.type === "UNKNOWN";

  if (!onVendlSub && !onPathShop) return;
  if (onPathShop && !pathname.startsWith(`/shop/${storefront.slug}`)) return;

  const relative = storefrontRelativePath(pathname, storefront.slug) || "/";
  const destPath = relative === "/" ? "" : relative;
  permanentRedirect(`https://${primary}${destPath}${search}`);
}
