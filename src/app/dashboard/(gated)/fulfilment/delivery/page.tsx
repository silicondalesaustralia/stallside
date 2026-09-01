import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { saveDeliveryZone } from "../actions";

export default async function FulfilmentDeliveryPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;

  const zones = await prisma.deliveryZone.findMany({
    where: { ownerId: owner.id },
    include: { rules: true, fulfilmentOptions: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/fulfilment" className="underline">
            Fulfilment
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold">
          Delivery zones
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Postcode and suburb lists — no route optimisation.
        </p>
      </div>

      {params.saved ? (
        <p className="text-sm text-[var(--leaf-dark)]">Saved.</p>
      ) : null}
      {params.error === "name" ? (
        <p className="text-sm text-[var(--gone)]">Enter a zone name.</p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {zones.map((z) => (
          <li key={z.id} className="dash-card p-4">
            <p className="font-semibold">{z.name}</p>
            <p className="text-sm text-[var(--muted)]">
              Fee ${(z.deliveryFeeCents / 100).toFixed(2)} · Min order $
              {(z.minOrderCents / 100).toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {z.rules.map((r) => r.value).join(", ") || "No rules yet"}
            </p>
          </li>
        ))}
      </ul>

      <form action={saveDeliveryZone} className="dash-card flex max-w-lg flex-col gap-4 p-4">
        <h2 className="font-semibold">Add delivery zone</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Zone name</span>
          <input name="name" required className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Delivery fee (cents)</span>
          <input name="deliveryFeeCents" type="number" defaultValue={0} className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Minimum order (cents)</span>
          <input name="minOrderCents" type="number" defaultValue={0} className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Postcodes (comma or newline)</span>
          <textarea name="postcodes" rows={2} placeholder="5153, 5154" className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Suburbs (comma or newline)</span>
          <textarea name="suburbs" rows={2} placeholder="Macclesfield, Stirling" className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
        </label>
        <button type="submit" className={dashCtaClass}>
          Save zone
        </button>
      </form>
    </main>
  );
}
