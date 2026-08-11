import type { Metadata } from "next";
import ProductLpPage from "@/components/product-lp/ProductLpPage";
import { PRE_ORDERS_HUB } from "@/lib/product-lp";
import { asPreOrdersAdsLp } from "@/lib/product-lp/as-ads-lp";

export const dynamic = "force-static";
export const revalidate = false;

const content = asPreOrdersAdsLp(PRE_ORDERS_HUB);

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
  robots: { index: false, follow: true },
};

export default function PreOrdersAdsLpPage() {
  return <ProductLpPage content={content} bare />;
}
