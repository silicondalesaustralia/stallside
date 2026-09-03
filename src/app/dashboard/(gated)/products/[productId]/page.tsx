import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/legal";
import { standProductPath } from "@/lib/stand-seo";
import { FulfilmentOptionKind, ProductChannelType } from "@/generated/prisma/client";
import ProductFulfilmentFields from "../ProductFulfilmentFields";
import ProductEditForm from "./ProductEditForm";
import ProductLifecycleActions from "../ProductLifecycleActions";
import ProductOptionsEditor from "./ProductOptionsEditor";
import ProductStockCard from "./ProductStockCard";
import ProductCatalogueFields from "./ProductCatalogueFields";
import ProductProductionSection from "../ProductProductionSection";
import { parsePriceTiers } from "@/lib/price-tiers";
import {
  normalizeBusinessMode,
  primaryLocationLabel,
} from "@/lib/business-mode";

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
      channels: true,
      categoryLinks: { select: { categoryId: true } },
      fulfilmentOptions: {
        select: { fulfilmentOptionId: true, isEnabled: true },
      },
      productRecipe: {
        include: {
          recipe: {
            select: {
              id: true,
              name: true,
              yieldQuantity: true,
              yieldLabel: true,
            },
          },
        },
      },
    },
  });
  if (!product) notFound();

  const [stands, categories, onlineFulfilmentOptions] = await Promise.all([
    prisma.stand.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: { id: true, title: true },
    }),
    prisma.fulfilmentOption.findMany({
      where: {
        ownerId: owner.id,
        isActive: true,
        kind: {
          in: [FulfilmentOptionKind.PICKUP, FulfilmentOptionKind.DELIVERY],
        },
        channels: { has: "ONLINE" },
      },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      select: { id: true, label: true, kind: true },
    }),
  ]);

  const path = standProductPath(product.stand.slug, product.slug);
  const standChannelIds = product.channels
    .filter(
      (c) =>
        c.channelType === ProductChannelType.STAND &&
        c.isEnabled &&
        c.standId,
    )
    .map((c) => c.standId as string);
  if (standChannelIds.length === 0) {
    standChannelIds.push(product.standId);
  }
  const showOnline = product.channels.some(
    (c) => c.channelType === ProductChannelType.ONLINE && c.isEnabled,
  );
  const enabledOptionIds = new Set(
    product.fulfilmentOptions
      .filter((row) => row.isEnabled)
      .map((row) => row.fulfilmentOptionId),
  );
  const hasRestrictions = product.fulfilmentOptions.length > 0;
  const fulfilmentRows = onlineFulfilmentOptions.map((option) => ({
    id: option.id,
    label: option.label,
    kind: option.kind,
    enabled: hasRestrictions ? enabledOptionIds.has(option.id) : true,
    hasRestriction: hasRestrictions,
  }));

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
      <ProductCatalogueFields
        productId={product.id}
        stands={stands}
        standChannelIds={standChannelIds}
        showOnline={showOnline}
        categories={categories}
        categoryIds={product.categoryLinks.map((l) => l.categoryId)}
        locationLabel={primaryLocationLabel(
          normalizeBusinessMode(owner.businessMode),
        )}
      />
      {showOnline && fulfilmentRows.length > 0 ? (
        <section className="dash-card p-5">
          <h2 className="font-semibold text-[var(--field)]">Online fulfilment</h2>
          <div className="mt-4">
            <ProductFulfilmentFields
              productId={product.id}
              options={fulfilmentRows}
            />
          </div>
        </section>
      ) : null}
      <ProductStockCard
        productId={product.id}
        stockQuantity={product.stockQuantity}
      />
      <ProductProductionSection
        ownerId={owner.id}
        productId={product.id}
        priceCents={product.priceCents}
        currency={product.currency}
        packagingCostCents={product.packagingCostCents}
        productRecipe={product.productRecipe}
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
