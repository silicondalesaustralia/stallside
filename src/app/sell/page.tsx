import type { Metadata } from "next";
import SellHub from "@/components/sell/SellHub";
import { SITE_URL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Sell What You Make Online — Tools for Makers | Vendl",
  description:
    "Make products from ingredients, materials or parts? Explore Vendl for 120 maker businesses, with tools for selling, costing, orders and marketing.",
  alternates: { canonical: `${SITE_URL}/sell` },
  openGraph: {
    title: "Sell What You Make Online — Tools for Makers | Vendl",
    description:
      "Find the Vendl tools for your kind of maker business — shop, costs, orders and marketing.",
    url: `${SITE_URL}/sell`,
  },
};

export default function SellHubPage() {
  return <SellHub />;
}
