import type { Metadata } from "next";
import ProductLpPage from "@/components/product-lp/ProductLpPage";
import { PRE_ORDERS_HUB } from "@/lib/product-lp";

export const metadata: Metadata = {
  title: PRE_ORDERS_HUB.metaTitle,
  description: PRE_ORDERS_HUB.metaDescription,
  alternates: { canonical: PRE_ORDERS_HUB.canonical },
};

export default function PreOrdersProductPage() {
  return <ProductLpPage content={PRE_ORDERS_HUB} />;
}
