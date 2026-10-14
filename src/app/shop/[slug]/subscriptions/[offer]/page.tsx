import type { Metadata } from "next";
import PublicSubscriptionOfferPage, {
  generateMetadata as offerMetadata,
} from "@/app/s/[standSlug]/sub/[offerSlug]/page";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { getCanonicalStorefrontUrl } from "@/lib/domains/preferred-origin";

type Props = {
  params: Promise<{ slug: string; offer: string }>;
  searchParams: Promise<{ draft?: string; cancelled?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, offer } = await params;
  const ctx = await loadStorefrontPage(slug, (await searchParams).draft === "1");
  const base = await offerMetadata({ params: Promise.resolve({ standSlug: ctx.stand.slug, offerSlug: offer }) });
  const canonical = getCanonicalStorefrontUrl(
    { slug: ctx.storefront.slug, primaryCustomHostname: await loadPrimaryCustomHostname(ctx.storefront.id) },
    `/subscriptions/${encodeURIComponent(offer)}`,
  );
  return { ...base, alternates: { ...base.alternates, canonical } };
}

/** A subscription offer on the website (`/subscriptions/{offer}`); sign-up and payment work as on the stand page. */
export default async function StorefrontSubscriptionOfferPage({ params, searchParams }: Props) {
  const { slug, offer } = await params;
  const ctx = await loadStorefrontPage(slug, (await searchParams).draft === "1");
  return (
    <PublicSubscriptionOfferPage
      params={Promise.resolve({ standSlug: ctx.stand.slug, offerSlug: offer })}
      searchParams={searchParams}
    />
  );
}
