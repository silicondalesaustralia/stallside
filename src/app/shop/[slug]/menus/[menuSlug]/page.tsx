import type { Metadata } from "next";
import MenuView from "@/lib/storefront/views/MenuView";
import { menuViewMetadata } from "@/lib/storefront/views/menu-view-metadata";

type Props = {
  params: Promise<{ slug: string; menuSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, menuSlug } = await params;
  return menuViewMetadata({ slug, menuSlug, draft: (await searchParams).draft === "1" });
}

export default async function StorefrontMenuPage({ params, searchParams }: Props) {
  const { slug, menuSlug } = await params;
  const draft = (await searchParams).draft === "1";
  return <MenuView slug={slug} menuSlug={menuSlug} draft={draft} preOrderRoute={false} />;
}
