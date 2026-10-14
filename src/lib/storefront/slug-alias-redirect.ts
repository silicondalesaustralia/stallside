import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveHostname } from "@/lib/tenancy/hostname";
import { publicHostnameFromHeaders } from "@/lib/tenancy/request-hostname";
import { storefrontRelativePath } from "@/lib/studio/redirects";
import { storefrontSubdomainOrigin } from "@/lib/tenancy/public-url";

/**
 * After a storefront slug rename, the old subdomain / `/shop/{old}` path forwards to the
 * new one (same host style, same deep path). No-op when a storefront owns `slug`.
 */
export async function redirectStorefrontSlugAlias(slug: string): Promise<void> {
  const key = decodeURIComponent(slug).trim().toLowerCase();
  let destination: string | null = null;
  try {
    const owner = await prisma.storefront.findUnique({ where: { slug: key }, select: { id: true } });
    if (owner) return;
    const renamed = await prisma.storefront.findFirst({
      where: { draftConfig: { path: ["slugAliases"], array_contains: [key] } },
      select: { slug: true },
    });
    if (!renamed) return;

    const h = await headers();
    const search = h.get("x-stallside-search") ?? "";
    const relative = storefrontRelativePath(h.get("x-stallside-pathname") ?? "", key) || "/";
    const rest = relative === "/" ? "" : relative;
    const resolution = resolveHostname(publicHostnameFromHeaders(h));
    const onSubdomain = resolution.type === "VENDL_SUBDOMAIN" || resolution.type === "STAGING_SUBDOMAIN";
    destination = onSubdomain
      ? `${storefrontSubdomainOrigin(renamed.slug)}${rest}${search}`
      : `/shop/${encodeURIComponent(renamed.slug)}${rest}${search}`;
  } catch (err) {
    console.error("[slug-alias] lookup failed", key, err);
  }
  if (destination) redirect(destination);
}
