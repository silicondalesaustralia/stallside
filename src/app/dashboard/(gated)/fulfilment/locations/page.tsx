import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { savePickupLocation, togglePickupLocation } from "./actions";
import { PickupLocationType } from "@/generated/prisma/client";

const TYPES: PickupLocationType[] = [
  "FARM_STAND",
  "FARM_GATE",
  "MARKET",
  "SHOP",
  "HOME",
  "OTHER",
];

export default async function PickupLocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const locations = await prisma.pickupLocation.findMany({
    where: { ownerId: owner.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
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
          Pickup locations
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Public label shows before purchase; full address can be revealed after
          order confirmation.
        </p>
      </div>

      {params.saved ? (
        <p className="text-sm text-[var(--leaf-dark)]">Saved.</p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {locations.map((loc) => (
          <li
            key={loc.id}
            className={`dash-card flex items-center justify-between p-4 ${!loc.isActive ? "opacity-60" : ""}`}
          >
            <div>
              <p className="font-semibold">{loc.name}</p>
              <p className="text-sm text-[var(--muted)]">
                {loc.publicLabel}
                {loc.suburb ? ` · ${loc.suburb}` : ""}
              </p>
            </div>
            <form action={togglePickupLocation}>
              <input type="hidden" name="id" value={loc.id} />
              <button type="submit" className="text-sm underline">
                {loc.isActive ? "Disable" : "Enable"}
              </button>
            </form>
          </li>
        ))}
      </ul>

      <form action={savePickupLocation} className="dash-card flex max-w-lg flex-col gap-4 p-4">
        <h2 className="font-semibold">Add location</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Name (internal)</span>
          <input name="name" required className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Public label</span>
          <input
            name="publicLabel"
            required
            placeholder="Macclesfield"
            className="rounded-lg border border-[var(--line)] px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Type</span>
          <select name="type" className="rounded-lg border border-[var(--line)] px-3 py-2.5">
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Suburb</span>
          <input name="suburb" className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Address (private until order)</span>
          <input name="addressLine1" className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Public instructions</span>
          <textarea name="publicInstructions" rows={2} className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Private instructions (after order)</span>
          <textarea name="privateInstructions" rows={2} className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="showFullAddressBeforePurchase" />
          Show full address before purchase
        </label>
        <button type="submit" className={dashCtaClass}>
          Save location
        </button>
      </form>
    </main>
  );
}
