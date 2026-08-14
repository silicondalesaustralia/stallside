import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NewProductForm from "./NewProductForm";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ standId?: string }>;
}) {
  const { owner } = await requireOwner();
  const { standId } = await searchParams;
  const { selected } = await resolveSelectedBusiness(owner.id);
  const stands = await prisma.stand.findMany({
    where: { ownerId: owner.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, currency: true },
  });
  const cardTier = true;
  const stripeConnected = Boolean(
    owner.stripeAccountId && owner.stripeChargesEnabled,
  );

  if (stands.length === 0) {
    return (
      <main>
        <h1 className="text-3xl font-semibold tracking-tight">Add product</h1>
        <div className="mt-3">
          <NoBusinessYet />
        </div>
      </main>
    );
  }

  const defaultId = standId ?? selected?.id ?? stands[0].id;
  const defaultCurrency =
    stands.find((s) => s.id === defaultId)?.currency ?? stands[0].currency;

  return (
    <main className="flex flex-col gap-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
        Add product
      </h1>
      <NewProductForm
        stands={stands}
        defaultStandId={defaultId}
        defaultCurrency={defaultCurrency}
        cardTier={cardTier}
        stripeConnected={stripeConnected}
      />
    </main>
  );
}
