import Link from "next/link";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { productFeedUrls } from "@/lib/product-feeds/feed-urls";
import { requireOwner } from "@/lib/session";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import ProductFeedLinks from "@/components/website/search-profile/ProductFeedLinks";

export default async function ProductFeedsPage() {
  const { owner } = await requireOwner();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const host = await loadPrimaryCustomHostname(storefront.id);
  const urls = productFeedUrls(storefront.slug, host);

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="Product Feeds"
        subtitle="Hosted catalogue feeds for Google Merchant Center and ChatGPT Business Hub. Paste the URL into each platform — it updates when you change products."
      />
      <ProductFeedLinks urls={urls} isPublished={storefront.isPublished} standalone />
      <p className="text-sm text-[var(--muted)]">
        Return policy and country for shopping listings come from your{" "}
        <Link
          href="/dashboard/website/web-studio?tab=details#search-profile"
          className="font-semibold text-[var(--field)] underline"
        >
          Google &amp; search profile
        </Link>
        . Products need a photo to appear in the feed.
      </p>
    </main>
  );
}
