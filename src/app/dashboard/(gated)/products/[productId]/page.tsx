import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/legal";
import { standProductPath } from "@/lib/stand-seo";
import { shopProductPath } from "@/lib/storefront/paths";
import { publishedWebsiteForStand, standWebsiteUrl } from "@/lib/storefront/stand-website";
import { productImageList } from "@/lib/product-images";
import { parseImageAlts } from "@/lib/product-image-alts";
import { parsePriceTiers } from "@/lib/price-tiers";
import EntitySeoCard from "@/components/website/seo/EntitySeoCard";
import { entitySeoKey } from "@/lib/studio/seo-settings";
import ProductEditForm from "./ProductEditForm";

/** Auth-gated; never serve a cached anonymous RSC payload for Edit links. */
export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ imageError?: string; seo?: string }>;
}) {
  const { productId: rawProductId } = await params;
  const productId =
    typeof rawProductId === "string" ? rawProductId.trim() : "";
  const { imageError, seo } = await searchParams;
  if (!productId) notFound();

  const { owner } = await requireOwner();

  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId: owner.id },
    include: {
      stand: { select: { id: true, name: true, slug: true } },
      optionGroups: {
        orderBy: { sortOrder: "asc" },
        include: { choices: { orderBy: { sortOrder: "asc" } } },
      },
      categoryLinks: { select: { categoryId: true } },
    },
  });
  if (!product) notFound();

  const categories = await prisma.category.findMany({
    where: { ownerId: owner.id, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: { id: true, title: true },
  });
  const productCategoryIds = new Set(product.categoryLinks.map((l) => l.categoryId));

  const siblingProducts = await prisma.product.findMany({
    where: {
      standId: product.stand.id,
      ownerId: owner.id,
      isArchived: false,
      isHidden: false,
      NOT: { id: productId },
    },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, priceCents: true },
  });

  const website = await publishedWebsiteForStand(product.stand.slug);
  const publicUrl = website
    ? standWebsiteUrl(website, shopProductPath(website.storefrontSlug, product.slug, false, ""))
    : `${SITE_URL}${standProductPath(product.stand.slug, product.slug)}`;
  const priceTiers = parsePriceTiers(product.priceTiers);

  return (
    <main className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/products" className="underline">
            Products
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          {product.name}
        </h1>
      </div>
      <ProductEditForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          photos: productImageList(product.imageUrl, product.galleryImageUrls),
          photoAlts: parseImageAlts(product.imageAlts),
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          priceCents: product.priceCents,
          costCents: product.costCents,
          sku: product.sku,
          upc: product.upc,
          currency: product.currency,
          stockQuantity: product.stockQuantity,
          lowStockThreshold: product.lowStockThreshold,
          supplyStatus: product.supplyStatus,
          isHidden: product.isHidden,
          isArchived: product.isArchived,
          standId: product.stand.id,
          standName: product.stand.name,
          standSlug: product.stand.slug,
          publicUrl,
          cardTier: true,
          preOrderEligible: product.preOrderEligible,
          freshnessNote: product.freshnessNote,
          priceTiers,
          hasOptions: product.optionGroups.length > 0,
          options: product.optionGroups.map((g) => ({
            name: g.name,
            choices: g.choices.map((c) => ({ name: c.name, priceDeltaCents: c.priceDeltaCents })),
          })),
          categories: categories.map((c) => ({ ...c, checked: productCategoryIds.has(c.id) })),
          upsellProductId: product.upsellProductId,
          upsellPriceCents: product.upsellPriceCents,
          siblingProducts,
        }}
        initialImageError={imageError ?? null}
      />
      <EntitySeoCard
        ownerId={owner.id}
        businessName={owner.businessName}
        entityKey={entitySeoKey("product", product.id)}
        returnTo={`/dashboard/products/${product.id}`}
        status={seo}
        variant="social"
      />
    </main>
  );
}
