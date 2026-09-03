import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { menuPublicUrl } from "@/lib/menu";
import MenuForm from "../MenuForm";

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const { menuId } = await params;
  const { owner } = await requireOwner();
  const menu = await prisma.menu.findFirst({
    where: { id: menuId, ownerId: owner.id },
    include: {
      items: { orderBy: { sortOrder: "asc" }, select: { productId: true } },
      stand: {
        select: { slug: true, currency: true, timezone: true, name: true },
      },
    },
  });
  if (!menu) notFound();

  const [products, storefront] = await Promise.all([
    prisma.product.findMany({
      where: {
        standId: menu.standId,
        ownerId: owner.id,
        isArchived: false,
        isHidden: false,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, priceCents: true },
    }),
    prisma.storefront.findUnique({
      where: { ownerId: owner.id },
      select: { slug: true },
    }),
  ]);

  const publicUrl = menuPublicUrl({
    standSlug: menu.stand.slug,
    menuSlug: menu.slug,
    showOnShop: menu.showOnShop,
    storefrontSlug: storefront?.slug ?? null,
  });

  return (
    <main className="flex flex-col gap-6">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/menus" className="underline">
          Menus
        </Link>
      </p>
      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/dashboard/fulfilment/orders?view=today"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 font-semibold hover:border-[var(--leaf)]"
        >
          Prepare & pack
        </Link>
        <Link
          href={`/dashboard/calendar?view=week${menu.orderByAt ? `&date=${menu.orderByAt.toISOString().slice(0, 10)}` : ""}`}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 font-semibold hover:border-[var(--leaf)]"
        >
          View in calendar
        </Link>
        <Link
          href={`/dashboard/campaigns/new?menuId=${menu.id}&template=new_menu`}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 font-semibold hover:border-[var(--leaf)]"
        >
          Tell customers
        </Link>
        {menu.kind === "PREORDER_DROP" ? (
          <Link
            href={`/dashboard/production?menuId=${menu.id}&range=week`}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 font-semibold hover:border-[var(--leaf)]"
          >
            Production
          </Link>
        ) : null}
      </div>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{menu.title}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {menu.stand.name} ·{" "}
          <a href={publicUrl} target="_blank" className="underline">
            Open public menu
          </a>
        </p>
      </div>
      <MenuForm
        products={products}
        stripeConnected={Boolean(
          owner.stripeAccountId && owner.stripeChargesEnabled,
        )}
        currency={menu.stand.currency}
        timeZone={menu.stand.timezone}
        values={{
          id: menu.id,
          title: menu.title,
          slug: menu.slug,
          description: menu.description,
          kind: menu.kind,
          isActive: menu.isActive,
          hideOnBusinessPage: menu.hideOnBusinessPage,
          showOnStand: menu.showOnStand,
          showOnShop: menu.showOnShop,
          orderByAt: menu.orderByAt?.toISOString() ?? "",
          collectionAt: menu.collectionAt?.toISOString() ?? "",
          collectionNote: menu.collectionNote,
          showExactStock: menu.showExactStock,
          paymentTiming: menu.paymentTiming,
          depositPercent: menu.depositPercent,
          handoverMode: menu.handoverMode,
          productIds: menu.items.map((i) => i.productId),
        }}
      />
    </main>
  );
}
