import type { Metadata } from "next";
import {
  BuiltinTermsPage,
  generateTermsMetadata,
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
  return generateTermsMetadata(slug, sp.draft === "1");
}

export default async function StorefrontTermsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  return BuiltinTermsPage({ slug, draft: sp.draft === "1" });
}
