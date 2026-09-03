import { headers } from "next/headers";
import { permanentRedirect, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  extractStorefrontRedirects,
  findStorefrontRedirect,
  storefrontRelativePath,
} from "@/lib/studio/redirects";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";

/** Apply published storefront URL redirects for the current request. */
export async function applyStorefrontRedirects(storefrontSlug: string) {
  const headersList = await headers();
  const search = headersList.get("x-stallside-search") ?? "";
  if (search.includes("draft=1")) return;

  const pathname = headersList.get("x-stallside-pathname") ?? "";
  if (!pathname) return;

  const storefront = await prisma.storefront.findFirst({
    where: { slug: storefrontSlug.trim().toLowerCase(), isPublished: true },
    select: {
      id: true,
      publishedConfig: true,
      draftConfig: true,
      isPublished: true,
    },
  });
  if (!storefront?.isPublished) return;

  const config = storefront.publishedConfig ?? storefront.draftConfig;
  const redirects = extractStorefrontRedirects(config);
  if (redirects.length === 0) return;

  const relative = storefrontRelativePath(pathname, storefrontSlug);
  const hit = findStorefrontRedirect(redirects, relative);
  if (!hit) return;

  if (/^https?:\/\//i.test(hit.toPath)) {
    if (hit.code === 301) permanentRedirect(hit.toPath);
    redirect(hit.toPath);
  }

  const primaryCustomHostname = await loadPrimaryCustomHostname(storefront.id);
  const dest = storefrontPublicUrl(storefrontSlug, {
    path: hit.toPath,
    primaryCustomHostname,
  });
  if (hit.code === 301) permanentRedirect(dest);
  redirect(dest);
}
