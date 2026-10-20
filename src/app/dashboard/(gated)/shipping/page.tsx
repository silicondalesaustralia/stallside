import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { getOwnerShippingSettings } from "@/lib/shipping/settings";
import NoBusinessYet from "@/components/NoBusinessYet";
import FulfilmentDefaultCard from "./FulfilmentDefaultCard";
import ShippingRatesCard from "./ShippingRatesCard";

export default async function ShippingPage({
  searchParams,
}: {
  searchParams: Promise<{ fulfilment?: string; rates?: string }>;
}) {
  const { fulfilment, rates } = await searchParams;
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const shipping = selected ? await getOwnerShippingSettings(owner.id, selected.id) : null;
  const stand = selected && shipping ? { id: selected.id, name: selected.name, ...shipping } : null;

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">Shipping</h1>
        <p className="mt-1 text-[var(--muted)]">
          {stand
            ? `What ships and what it costs · ${stand.name}. Add tracking on each order in Orders.`
            : "Set up a business to choose shipping."}
        </p>
      </div>
      {stand ? (
        <>
          <FulfilmentDefaultCard standId={stand.id} value={stand.settings.fulfilmentDefault} status={fulfilment} />
          <ShippingRatesCard
            standId={stand.id}
            mode={stand.settings.shippingMode}
            flat={stand.settings.flat}
            freeOver={stand.settings.freeOver}
            currency={stand.currency}
            status={rates}
          />
        </>
      ) : (
        <NoBusinessYet />
      )}
    </main>
  );
}
