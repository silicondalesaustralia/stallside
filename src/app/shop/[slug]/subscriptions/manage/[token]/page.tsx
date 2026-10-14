import type { Metadata } from "next";
import ShopperSubscriptionManagePage from "@/app/s/[standSlug]/sub/manage/[token]/page";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";

type Props = { params: Promise<{ slug: string; token: string }> };

export const metadata: Metadata = {
  title: "Manage subscription",
  robots: { index: false, follow: false },
};

/** Subscriber self-service on the website (`/subscriptions/manage/{token}`), used in new emails. */
export default async function StorefrontSubscriptionManagePage({ params }: Props) {
  const { slug, token } = await params;
  const ctx = await loadStorefrontPage(slug, false);
  return (
    <ShopperSubscriptionManagePage params={Promise.resolve({ standSlug: ctx.stand.slug, token })} />
  );
}
