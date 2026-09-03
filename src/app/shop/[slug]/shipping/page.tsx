import type { Metadata } from "next";
import {
  BuiltinShippingPage,
  generateShippingMetadata,
} from "@/lib/studio/builtin-pages";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  return generateShippingMetadata(slug, sp.draft === "1");
}

export default async function StorefrontShippingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  return BuiltinShippingPage({ slug, draft: sp.draft === "1" });
}
