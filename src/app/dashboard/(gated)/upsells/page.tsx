import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import StandUpsellsForm from "@/app/dashboard/(gated)/businesses/[standId]/StandUpsellsForm";
import { listOwnerUpsellRows } from "@/lib/upsells/load";
import { loadUpsellOverview } from "@/lib/upsells/overview";
import UpsellOverridesList from "./UpsellOverridesList";
import UpsellsTable from "./UpsellsTable";

export default async function UpsellsPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const overview = selected ? await loadUpsellOverview(owner.id, selected.id) : null;

  if (!overview) {
    return (
      <main className="flex flex-col gap-6">
        <PageHeader title="Upsells & offers" />
        <NoBusinessYet />
      </main>
    );
  }

  const { stand, products } = overview;
  const upsellRows = await listOwnerUpsellRows(owner.id, stand.id);

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="Upsells & offers"
        subtitle={`Extra sales at checkout for ${stand.name}, on your online store cart and your stall checkout.`}
        actions={<DashPrimaryCta href="/dashboard/upsells/new">+ New upsell</DashPrimaryCta>}
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">Cart upsells</h2>
        <p className="text-sm text-[var(--muted)]">
          Offer an extra item in the cart: everywhere, for certain categories, or for certain products.
        </p>
        {upsellRows.length === 0 ? (
          <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">No upsells yet.</div>
        ) : (
          <UpsellsTable upsells={upsellRows} />
        )}
      </section>

      <section className="flex max-w-2xl flex-col gap-5 border-t border-[var(--line)] pt-6">
        <div>
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
      </section>

      <UpsellOverridesList
        products={overview.productOverrides}
        preOrderPages={overview.preOrderAddOns.map((p) => ({ id: p.id, title: p.name, addOn: p.offers }))}
      />
    </main>
  );
}
