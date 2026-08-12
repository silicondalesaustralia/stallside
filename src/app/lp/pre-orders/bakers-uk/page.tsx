import type { Metadata } from "next";
import ProductLpPage from "@/components/product-lp/ProductLpPage";
import { BAKERS_UK_LP } from "@/lib/product-lp/bakers-uk";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: BAKERS_UK_LP.metaTitle,
  description: BAKERS_UK_LP.metaDescription,
  robots: { index: false, follow: true },
};

export default function BakersUkAdsLpPage() {
  return <ProductLpPage content={BAKERS_UK_LP} bare />;
}
