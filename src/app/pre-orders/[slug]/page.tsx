import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductLpPage from "@/components/product-lp/ProductLpPage";
import { PRE_ORDER_DOORWAYS } from "@/lib/product-lp";
import {
  PRE_ORDER_VERTICAL_SLUGS,
  type PreOrderVerticalSlug,
} from "@/lib/verticals";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRE_ORDER_VERTICAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = PRE_ORDER_DOORWAYS[slug];
  if (!d) return { title: "Pre-orders" };
  return {
    title: d.metaTitle,
    description: d.metaDescription,
    alternates: { canonical: d.canonical },
  };
}

export default async function PreOrderDoorwayPage({ params }: Props) {
  const { slug } = await params;
  if (!PRE_ORDER_VERTICAL_SLUGS.includes(slug as PreOrderVerticalSlug)) {
    notFound();
  }
  const d = PRE_ORDER_DOORWAYS[slug];
  if (!d) notFound();
  return <ProductLpPage content={d} />;
}
