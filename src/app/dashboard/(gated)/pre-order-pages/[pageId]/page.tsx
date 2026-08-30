import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { preOrderPageUrl } from "@/lib/preorder-page";
import PreOrderPageForm from "../PreOrderPageForm";
import { deletePreOrderPage } from "../actions";

export default async function EditPreOrderPagePage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const { owner } = await requireOwner();
  const page = await prisma.preOrderPage.findFirst({
    where: { id: pageId, ownerId: owner.id },
    include: {
      stand: { select: { id: true, name: true, slug: true, currency: true } },
      items: { select: { productId: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!page) notFound();

  const products = await prisma.product.findMany({
    where: {
      standId: page.standId,
      ownerId: owner.id,
      isArchived: false,
      isHidden: false,
      OR: [
        { preOrderEligible: true },
        { id: { in: page.items.map((i) => i.productId) } },
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      priceCents: true,
      optionGroups: { select: { id: true } },
    },
  });

  const stripeConnected = Boolean(
    owner.stripeAccountId && owner.stripeChargesEnabled,
  );
  const publicUrl = preOrderPageUrl(page.stand.slug, page.slug);
  const remove = deletePreOrderPage.bind(null, page.id);

  return (
    <main className="flex flex-col gap-6">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/pre-order-pages" className="underline">
          Pre-order pages
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Edit pre-order page
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{page.stand.name}</p>
      <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-3 text-sm">
        <p className="font-medium">Public link</p>
        <p className="mt-1 break-all text-[var(--muted)]">{publicUrl}</p>
        <p className="mt-2 flex flex-wrap gap-3">
          <Link
            href={`/s/${page.stand.slug}/pre/${page.slug}`}
            target="_blank"
            className="text-[var(--leaf-dark)] underline"
          >
            Open
          </Link>
          <Link
            href={`/dashboard/pre-order-pages/${page.id}/qr`}
            className="text-[var(--leaf-dark)] underline"
          >
            Print QR
          </Link>
        </p>
      </div>
      <div className="mt-6">
        <PreOrderPageForm
          stripeConnected={stripeConnected}
          currency={page.stand.currency}
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            priceCents: p.priceCents,
            hasOptions: p.optionGroups.length > 0,
          }))}
          values={{
            id: page.id,
            updatedAt: page.updatedAt.toISOString(),
            title: page.title,
            slug: page.slug,
            description: page.description,
            imageUrl: page.imageUrl,
            isActive: page.isActive,
            hideOnBusinessPage: page.hideOnBusinessPage,
            orderByAt: page.orderByAt.toISOString(),
            collectionAt: page.collectionAt.toISOString(),
            collectionNote: page.collectionNote,
            showExactStock: page.showExactStock,
            paymentTiming: page.paymentTiming,
            depositPercent: page.depositPercent,
            handoverMode: page.handoverMode,
            productIds: page.items.map((i) => i.productId),
            preOrderUpsellName: page.preOrderUpsellName,
            preOrderUpsellPriceCents: page.preOrderUpsellPriceCents,
            preOrderUpsellDiscountKind: page.preOrderUpsellDiscountKind,
            preOrderUpsellDiscountValue: page.preOrderUpsellDiscountValue,
          }}
        />
      </div>
      <form action={remove} className="mt-8">
        <button
          type="submit"
          className="text-sm text-[var(--gone)] underline"
        >
          Delete page
        </button>
      </form>
    </main>
  );
}
