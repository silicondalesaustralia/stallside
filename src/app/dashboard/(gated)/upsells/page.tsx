import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import StandUpsellsForm from "@/app/dashboard/(gated)/businesses/[standId]/StandUpsellsForm";
import UpsellOverridesList from "./UpsellOverridesList";
import UpsellList from "./UpsellList";
import { loadUpsellRows } from "./load-upsell-rows";

export default async function UpsellsPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const stand = selected
    ? await prisma.stand.findFirst({ where: { id: selected.id, ownerId: owner.id } })
    : null;

  if (!stand) {
    return (
      <main className="flex flex-col gap-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">Upsells &amp; offers</h1>
        <NoBusinessYet />
      </main>
    );
  }

  const [upsellRows, products, productOverrides, preOrderPages] = await Promise.all([
    loadUpsellRows(stand.id),
    prisma.product.findMany({
      where: { standId: stand.id, isArchived: false, isHidden: false },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, priceCents: true },
    }),
    prisma.product.findMany({
      where: { standId: stand.id, isArchived: false, upsellProductId: { not: null } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, upsellProductId: true },
    }),
    prisma.preOrderPage.findMany({
      where: { standId: stand.id, isActive: true, preOrderUpsellName: { not: null } },
      orderBy: { title: "asc" },
      select: { id: true, title: true, preOrderUpsellName: true },
    }),
  ]);
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  return (
    <main className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">Upsells &amp; offers</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Extra sales at checkout for {stand.name}. These apply to your online store cart and your stall checkout.
        </p>
      </div>

      <UpsellList upsells={upsellRows} />

      <div className="border-t border-[var(--line)] pt-6">
        <h2 className="text-base font-semibold">Business default and offers</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          The default upsell below is used when no upsell above fits the cart.
        </p>
      </div>
      <StandUpsellsForm
        standId={stand.id}
        currency={stand.currency}
        products={products}
        conversion={{
          upsellProductId: stand.upsellProductId,
          upsellPriceCents: stand.upsellPriceCents,
          firstOrderDiscountEnabled: stand.firstOrderDiscountEnabled,
          firstOrderDiscountPercent: stand.firstOrderDiscountPercent,
          firstOrderDiscountAmountCents: stand.firstOrderDiscountAmountCents,
          showPublicScarcity: stand.showPublicScarcity,
        }}
      />

      <UpsellOverridesList
        products={productOverrides.map((p) => ({
          id: p.id,
          name: p.name,
          offers: (p.upsellProductId && nameById.get(p.upsellProductId)) || "another product",
        }))}
        preOrderPages={preOrderPages.map((p) => ({ id: p.id, title: p.title, addOn: p.preOrderUpsellName ?? "" }))}
      />
    </main>
  );
}
