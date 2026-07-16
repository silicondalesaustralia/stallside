import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ProductEditForm from "./ProductEditForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const { owner } = await requireOwner();
  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId: owner.id, isActive: true },
    include: { stand: { select: { name: true } } },
  });
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-lg">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/products" className="underline">
          Products
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit product</h1>
      <div className="mt-8">
        <ProductEditForm
          product={{
            id: product.id,
            name: product.name,
            description: product.description,
            priceCents: product.priceCents,
            currency: product.currency,
            lowStockThreshold: product.lowStockThreshold,
            standName: product.stand.name,
          }}
        />
      </div>
    </main>
  );
}
