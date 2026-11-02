import { applyStorefrontRedirects } from "@/lib/studio/apply-redirects";
import { applyPreferredOriginRedirect } from "@/lib/domains/preferred-redirect";
import { redirectStorefrontSlugAlias } from "@/lib/storefront/slug-alias-redirect";
import StallVisitMarker from "@/components/storefront/StallVisitMarker";
import StorefrontTags from "@/components/storefront/tracking/StorefrontTags";
import { storefrontTrackingMetadata } from "@/lib/website/tracking/metadata";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

/** The seller's favicon on every store page (cart, checkout and the rest), instead of Vendl's. */
async function faviconMetadata(slug: string): Promise<Metadata> {
  try {
    const storefront = await prisma.storefront.findFirst({
      where: { slug: decodeURIComponent(slug).trim().toLowerCase(), isPublished: true },
      select: { faviconUrl: true },
    });
    const url = storefront?.faviconUrl;
    return url ? { icons: { icon: [{ url }], apple: url } } : {};
  } catch (err) {
    console.error("[shop layout] favicon", err);
    return {};
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [favicon, tracking] = await Promise.all([faviconMetadata(slug), storefrontTrackingMetadata(slug)]);
  return { ...tracking, ...favicon };
}

export default async function ShopSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const checks = await Promise.allSettled([
    redirectStorefrontSlugAlias(slug),
    applyPreferredOriginRedirect(slug),
    applyStorefrontRedirects(slug),
  ]);
  for (const check of checks) {
    if (check.status === "rejected") throw check.reason;
  }
  return (
    <div className="storefront-cq">
      <StallVisitMarker />
      <StorefrontTags slug={slug} />
      {children}
    </div>
  );
}
