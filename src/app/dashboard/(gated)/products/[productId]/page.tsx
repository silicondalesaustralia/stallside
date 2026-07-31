import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { SITE_URL } from "@/lib/legal";
import { standProductPath } from "@/lib/stand-seo";
import ProductEditForm from "./ProductEditForm";
import ProductLifecycleActions from "../ProductLifecycleActions";
import ProductOptionsEditor from "./ProductOptionsEditor";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const { owner, user } = await requireOwner();
  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId: owner.id },
    include: {
      stand: { select: { name: true, slug: true } },
      optionGroups: {
        orderBy: { sortOrder: "asc" },
        include: { choices: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!product) notFound();

  const cardTier = ownerHasProAccess(owner, {
    email: user.email,
    role: user.role,
  });
  const stripeConnected = Boolean(
    owner.stripeAccountId && owner.stripeChargesEnabled,
  );
  const path = standProductPath(product.stand.slug, product.slug);

  return (
    <main className="mx-auto max-w-lg">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/products" className="underline">
          Products
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit product</h1>
      {product.isArchived || product.isHidden ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          {product.isArchived
            ? "Archived — not on your stand. Restore to sell again."
            : "Hidden from the stand page — direct link still works."}
        </p>
      ) : null}
      <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3">
        <ProductLifecycleActions
          productId={product.id}
          productName={product.name}
          isHidden={product.isHidden}
          isArchived={product.isArchived}
        />
      </div>
      <div className="mt-8 flex flex-col gap-8">
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
            currency: product.currency,
            lowStockThreshold: product.lowStockThreshold,
            standName: product.stand.name,
            standSlug: product.stand.slug,
            publicUrl: `${SITE_URL}${path}`,
            cardTier,
            stripeConnected,
            isPreOrder: product.isPreOrder,
            orderByAt: product.orderByAt,
            collectionAt: product.collectionAt,
            collectionNote: product.collectionNote,
            showExactStock: product.showExactStock,
          }}
        />
        <ProductOptionsEditor
          productId={product.id}
          initial={product.optionGroups.map((g) => ({
            name: g.name,
            choices: g.choices.map((c) => ({
              name: c.name,
              priceDeltaCents: c.priceDeltaCents,
            })),
          }))}
        />
      </div>
    </main>
  );
}
