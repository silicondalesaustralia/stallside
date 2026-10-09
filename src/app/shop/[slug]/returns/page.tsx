import type { Metadata } from "next";
import {
  BuiltinReturnsPage,
  generateReturnsMetadata,
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
  return generateReturnsMetadata(slug, sp.draft === "1");
}

export default async function StorefrontReturnsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  return BuiltinReturnsPage({ slug, draft: sp.draft === "1" });
}
