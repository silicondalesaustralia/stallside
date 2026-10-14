import { applyStorefrontRedirects } from "@/lib/studio/apply-redirects";
import { applyPreferredOriginRedirect } from "@/lib/domains/preferred-redirect";
import { redirectStorefrontSlugAlias } from "@/lib/storefront/slug-alias-redirect";

export default async function ShopSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await redirectStorefrontSlugAlias(slug);
  await applyPreferredOriginRedirect(slug);
  await applyStorefrontRedirects(slug);
  return <div className="storefront-cq">{children}</div>;
}
