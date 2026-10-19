import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import StandUpsellsForm from "@/app/dashboard/(gated)/businesses/[standId]/StandUpsellsForm";
import { listOwnerUpsellRows } from "@/lib/upsells/load";
import { loadUpsellOverview } from "@/lib/upsells/overview";
import UpsellOverridesList from "./UpsellOverridesList";
import UpsellList from "./UpsellList";

export default async function UpsellsPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const overview = selected ? await loadUpsellOverview(owner.id, selected.id) : null;

  if (!overview) {
    return (
      <main className="flex flex-col gap-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">Upsells &amp; offers</h1>
        <NoBusinessYet />
      </main>
    );
  }

  const { stand, products } = overview;
  const upsellRows = await listOwnerUpsellRows(owner.id, stand.id);

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
        products={overview.productOverrides}
        preOrderPages={overview.preOrderAddOns.map((p) => ({ id: p.id, title: p.name, addOn: p.offers }))}
      />
    </main>
  );
}
