import type { Metadata } from "next";
import ProductLpPage from "@/components/product-lp/ProductLpPage";
import { STALL_HUB } from "@/lib/product-lp";

export const metadata: Metadata = {
  title: STALL_HUB.metaTitle,
  description: STALL_HUB.metaDescription,
  alternates: { canonical: STALL_HUB.canonical },
};

export default function StallProductPage() {
  return <ProductLpPage content={STALL_HUB} />;
}
