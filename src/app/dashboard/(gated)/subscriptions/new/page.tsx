import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { productCatalogWhere } from "@/lib/product-visibility";
import SubscriptionOfferForm from "../SubscriptionOfferForm";

export default async function NewSubscriptionOfferPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          New subscription
        </h1>
        <NoBusinessYet />
      </main>
    );
  }

  const products = await prisma.product.findMany({
    where: { standId: selected.id, ownerId: owner.id, ...productCatalogWhere },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, priceCents: true },
  });

  const stand = await prisma.stand.findFirst({
    where: { id: selected.id, ownerId: owner.id },
    select: { currency: true },
  });

  const stripeConnected = Boolean(
    owner.stripeAccountId && owner.stripeChargesEnabled,
  );

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          New subscription
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          {selected.name} — customers pay by card on a recurring schedule.
        </p>
      </div>
      <SubscriptionOfferForm
        products={products}
        stripeConnected={stripeConnected}
        currency={stand?.currency ?? "AUD"}
      />
    </main>
  );
}
