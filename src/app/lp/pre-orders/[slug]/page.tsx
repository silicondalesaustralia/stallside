import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductLpPage from "@/components/product-lp/ProductLpPage";
import { PRE_ORDER_DOORWAYS } from "@/lib/product-lp";
import { asPreOrdersAdsLp } from "@/lib/product-lp/as-ads-lp";
import {
  PRE_ORDER_VERTICAL_SLUGS,
  type PreOrderVerticalSlug,
} from "@/lib/verticals";

export const dynamic = "force-static";
export const revalidate = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRE_ORDER_VERTICAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const base = PRE_ORDER_DOORWAYS[slug];
  if (!base) return { title: "Pre-orders", robots: { index: false } };
  const content = asPreOrdersAdsLp(base);
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    robots: { index: false, follow: true },
  };
}

export default async function PreOrderAdsLpDoorwayPage({ params }: Props) {
  const { slug } = await params;
  if (!PRE_ORDER_VERTICAL_SLUGS.includes(slug as PreOrderVerticalSlug)) {
    notFound();
  }
  const base = PRE_ORDER_DOORWAYS[slug];
  if (!base) notFound();
  return <ProductLpPage content={asPreOrdersAdsLp(base)} bare />;
}
