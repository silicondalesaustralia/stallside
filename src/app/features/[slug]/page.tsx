import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FeaturePageView from "@/components/features/FeaturePageView";
import { featureStaticParams, getFeature } from "@/lib/features";
import { SITE_URL } from "@/lib/legal";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return featureStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) return { title: "Product Features" };
  const url = `${SITE_URL}/features/${feature.slug}`;
  return {
    title: feature.metaTitle,
    description: feature.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: feature.metaTitle,
      description: feature.metaDescription,
      url,
    },
  };
}

export default async function FeatureSlugPage({ params }: Props) {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) notFound();
  return <FeaturePageView feature={feature} />;
}
