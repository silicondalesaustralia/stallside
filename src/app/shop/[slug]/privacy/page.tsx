import type { Metadata } from "next";
import {
  BuiltinPrivacyPage,
  generatePrivacyMetadata,
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
  return generatePrivacyMetadata(slug, sp.draft === "1");
}

export default async function StorefrontPrivacyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  return BuiltinPrivacyPage({ slug, draft: sp.draft === "1" });
}
