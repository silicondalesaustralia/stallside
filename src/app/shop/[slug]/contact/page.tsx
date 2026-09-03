import type { Metadata } from "next";
import {
  BuiltinContactPage,
  generateContactMetadata,
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
  return generateContactMetadata(slug, sp.draft === "1");
}

export default async function StorefrontContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  return BuiltinContactPage({ slug, draft: sp.draft === "1" });
}
