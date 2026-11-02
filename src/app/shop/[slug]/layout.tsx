import { applyStorefrontRedirects } from "@/lib/studio/apply-redirects";
import { applyPreferredOriginRedirect } from "@/lib/domains/preferred-redirect";
import { redirectStorefrontSlugAlias } from "@/lib/storefront/slug-alias-redirect";
import StallVisitMarker from "@/components/storefront/StallVisitMarker";
import StorefrontTags from "@/components/storefront/tracking/StorefrontTags";
import { storefrontTrackingMetadata } from "@/lib/website/tracking/metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return storefrontTrackingMetadata(slug);
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
