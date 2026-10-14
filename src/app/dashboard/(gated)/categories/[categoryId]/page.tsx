import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import SortableOrderList from "@/components/SortableOrderList";
import CategoryEditForm from "./CategoryEditForm";
import CategoryProductsPicker from "./CategoryProductsPicker";
import { saveCategoryProductOrder } from "../category-product-actions";
import { setCategoryActive } from "../actions";
import PublishStatusCard from "@/components/website/PublishStatusCard";
import EntitySeoCard from "@/components/website/seo/EntitySeoCard";
import { entitySeoKey } from "@/lib/studio/seo-settings";
import ViewOnSiteLink from "@/components/dashboard/ViewOnSiteLink";
import { ownerSiteUrl } from "@/lib/storefront/owner-site-url";
import { shopCategoryPath } from "@/lib/storefront/paths";

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ saved?: string; error?: string; published?: string; unpublished?: string; seo?: string }>;
}) {
  const { owner } = await requireOwner();
  const { categoryId } = await params;
  const { saved, error, published, unpublished, seo } = await searchParams;

  const [category, products] = await Promise.all([
    prisma.category.findFirst({
      where: { id: categoryId, ownerId: owner.id },
      include: {
        products: {
          where: { product: { isArchived: false } },
          orderBy: [{ sortOrder: "asc" }, { product: { name: "asc" } }],
          select: {
            productId: true,
            product: { select: { name: true, isHidden: true, stand: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.product.findMany({
      where: { ownerId: owner.id, isArchived: false },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, sku: true, stand: { select: { name: true } } },
    }),
  ]);
  if (!category) notFound();
  const viewUrl = await ownerSiteUrl(owner.id, (slug, draft, base) => shopCategoryPath(slug, category.slug, draft, base));

  const multiStand = new Set(products.map((p) => p.stand.name)).size > 1;
  const inCategory = new Set(category.products.map((l) => l.productId));
  const orderItems = category.products.map((l) => ({
    id: l.productId,
    label: l.product.name,
    href: `/dashboard/products/${l.productId}`,
    detail: [multiStand ? l.product.stand.name : null, l.product.isHidden ? "Hidden" : null]
      .filter(Boolean)
      .join(" · "),
  }));

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard/categories" className="text-sm font-semibold text-[var(--leaf-dark)] underline">
            ← Categories
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            {category.title}
          </h1>
        </div>
        {viewUrl ? <ViewOnSiteLink href={viewUrl} /> : null}
      </div>

      {published ? <p className="text-sm font-medium text-[var(--ok)]">Category published.</p> : null}
      {unpublished ? <p className="text-sm font-medium text-[var(--ok)]">Category unpublished.</p> : null}

      <PublishStatusCard
        live={category.isActive}
        liveNote="Shown in your shop, on your website and in QR codes."
        offNote="Hidden from your shop, your website and QR codes. Its products are kept."
        toggleAction={setCategoryActive.bind(null, category.id, !category.isActive)}
      />

      <CategoryEditForm category={category} saved={saved === "1"} nameError={error === "name"} />

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Product order in this category</h2>
        <SortableOrderList
          key={orderItems.map((i) => i.id).join()}
          items={orderItems}
          onSave={saveCategoryProductOrder.bind(null, category.id)}
          emptyText="No products in this category yet. Tick some below."
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Products in this category</h2>
        <CategoryProductsPicker
          categoryId={category.id}
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            detail: [p.sku ? `SKU ${p.sku}` : null, multiStand ? p.stand.name : null]
              .filter(Boolean)
              .join(" · ") || null,
            checked: inCategory.has(p.id),
          }))}
        />
      </section>

      <EntitySeoCard
        ownerId={owner.id}
        businessName={owner.businessName}
        entityKey={entitySeoKey("category", category.id)}
        returnTo={`/dashboard/categories/${category.id}`}
        status={seo}
      />
    </main>
  );
}
