import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SellMarketPage from "@/components/sell/SellMarketPage";
import { getAllMarkets, getMarket } from "@/lib/sell";
import { SITE_URL } from "@/lib/legal";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllMarkets().map((market) => ({ slug: market.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const market = getMarket(slug);
  if (!market) return { title: "Sell" };
  const url = `${SITE_URL}/sell/${market.slug}`;
  return {
    title: market.seo.title,
    description: market.seo.description,
    alternates: { canonical: url },
    openGraph: {
      title: market.seo.title,
      description: market.seo.description,
      url,
    },
  };
}

export default async function SellMarketRoute({ params }: Props) {
  const { slug } = await params;
  const market = getMarket(slug);
  if (!market || market.status !== "published") notFound();
  return <SellMarketPage market={market} />;
}
