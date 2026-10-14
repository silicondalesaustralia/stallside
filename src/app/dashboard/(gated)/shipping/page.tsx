import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
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
  const stand = selected
    ? await prisma.stand.findFirst({
        where: { id: selected.id, ownerId: owner.id },
        select: {
          id: true,
          name: true,
          currency: true,
          fulfilmentDefault: true,
          shippingMode: true,
          shippingFlatCents: true,
          shippingFreeOverCents: true,
        },
      })
    : null;

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
          <FulfilmentDefaultCard standId={stand.id} value={stand.fulfilmentDefault} status={fulfilment} />
          <ShippingRatesCard
            standId={stand.id}
            mode={stand.shippingMode}
            flatCents={stand.shippingFlatCents}
            freeOverCents={stand.shippingFreeOverCents}
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
