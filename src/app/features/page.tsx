import type { Metadata } from "next";
import FeatureHub from "@/components/features/FeatureHub";

export const metadata: Metadata = {
  title: "Product Features",
  description:
    "Explore Vendl product features — online shop, pre-orders, stall checkout, costing, email, social and more.",
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return <FeatureHub />;
}
