import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import PreOrderPageForm from "../PreOrderPageForm";

export default async function NewPreOrderPagePage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) {
    return (
      <main>
        <h1 className="text-3xl font-semibold tracking-tight">
          New pre-order page
        </h1>
        <div className="mt-3">
          <NoBusinessYet />
        </div>
      </main>
    );
  }

  const [products, stand] = await Promise.all([
    prisma.product.findMany({
      where: {
        standId: selected.id,
        ownerId: owner.id,
        isArchived: false,
        isHidden: false,
        preOrderEligible: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        priceCents: true,
        optionGroups: { select: { id: true } },
      },
    }),
    prisma.stand.findUnique({
      where: { id: selected.id },
      select: { currency: true, locationLabel: true, timezone: true },
    }),
  ]);

  const stripeConnected = Boolean(
    owner.stripeAccountId && owner.stripeChargesEnabled,
  );

  return (
    <main className="flex flex-col gap-6">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/pre-order-pages" className="underline">
          Pre-order pages
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        New pre-order page
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{selected.name}</p>
      <div className="mt-6">
        <PreOrderPageForm
          stripeConnected={stripeConnected}
          currency={stand?.currency ?? "AUD"}
          timeZone={stand?.timezone ?? "Australia/Adelaide"}
          standLocationLabel={stand?.locationLabel ?? null}
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            priceCents: p.priceCents,
            hasOptions: p.optionGroups.length > 0,
          }))}
        />
      </div>
    </main>
  );
}
