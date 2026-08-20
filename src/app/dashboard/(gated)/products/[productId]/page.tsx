import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/legal";
import { standProductPath } from "@/lib/stand-seo";
import ProductEditForm from "./ProductEditForm";
import ProductLifecycleActions from "../ProductLifecycleActions";
import ProductOptionsEditor from "./ProductOptionsEditor";
import ProductStockCard from "./ProductStockCard";
import { parsePriceTiers } from "@/lib/price-tiers";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ imageError?: string }>;
}) {
  const { productId } = await params;
  const { imageError } = await searchParams;
  const { owner } = await requireOwner();
  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId: owner.id },
    include: {
      stand: {
        select: {
          id: true,
          name: true,
          slug: true,
          products: {
            where: {
              isArchived: false,
              isHidden: false,
              NOT: { id: productId },
            },
            orderBy: { sortOrder: "asc" },
            select: { id: true, name: true, priceCents: true },
          },
        },
      },
      optionGroups: {
        orderBy: { sortOrder: "asc" },
        include: { choices: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!product) notFound();

  const path = standProductPath(product.stand.slug, product.slug);

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">
            <Link href="/dashboard/products" className="underline">
              Products
            </Link>
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            {product.name}
          </h1>
          {product.isArchived || product.isHidden ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {product.isArchived
                ? "Archived - not on your stand. Restore to sell again."
                : "Hidden from the stand page - direct link still works."}
            </p>
          ) : null}
        </div>
        <div className="dash-card px-4 py-3">
          <ProductLifecycleActions
            productId={product.id}
            productName={product.name}
            isHidden={product.isHidden}
            isArchived={product.isArchived}
          />
        </div>
      </div>
      <ProductEditForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          imageUrl: product.imageUrl,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          priceCents: product.priceCents,
          costCents: product.costCents,
          sku: product.sku,
          upc: product.upc,
          currency: product.currency,
          lowStockThreshold: product.lowStockThreshold,
          standId: product.stand.id,
          standName: product.stand.name,
          standSlug: product.stand.slug,
          publicUrl: `${SITE_URL}${path}`,
          cardTier: true,
          preOrderEligible: product.preOrderEligible,
          freshnessNote: product.freshnessNote,
          priceTiers: parsePriceTiers(product.priceTiers),
          hasOptions: product.optionGroups.length > 0,
          upsellProductId: product.upsellProductId,
          upsellPriceCents: product.upsellPriceCents,
          siblingProducts: product.stand.products,
        }}
        initialImageError={imageError ?? null}
      />
      <ProductStockCard
        productId={product.id}
        stockQuantity={product.stockQuantity}
      />
      <ProductOptionsEditor
        productId={product.id}
        disabled={parsePriceTiers(product.priceTiers).length > 0}
        initial={product.optionGroups.map((g) => ({
          name: g.name,
          choices: g.choices.map((c) => ({
            name: c.name,
            priceDeltaCents: c.priceDeltaCents,
          })),
        }))}
      />
    </main>
  );
}
