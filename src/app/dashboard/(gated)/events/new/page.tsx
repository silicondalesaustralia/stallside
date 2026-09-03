import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { resolveStandTimezone, toDateTimeLocalInTz, zonedWallClockToUtc } from "@/lib/stand-timezone";
import { dayKeyInTz } from "@/lib/calendar/range";
import NoBusinessYet from "@/components/NoBusinessYet";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { createSellerEvent } from "../actions";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ startsAt?: string }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const timeZone = resolveStandTimezone(owner.defaultTimezone);
  const startsDefault =
    sp.startsAt?.trim() ||
    toDateTimeLocalInTz(
      (() => {
        const dk = dayKeyInTz(new Date(), timeZone);
        const [y, m, d] = dk.split("-").map(Number);
        return zonedWallClockToUtc(y, m - 1, d, 9, 0, 0, timeZone);
      })(),
      timeZone,
    );
  const { selected } = await resolveSelectedBusiness(owner.id);
  const stands = await prisma.stand.findMany({
    where: { ownerId: owner.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  if (stands.length === 0) {
    return (
      <main className="flex flex-col gap-8">
        <h1 className="text-3xl font-semibold tracking-tight">New event</h1>
        <NoBusinessYet />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/events" className="underline">
            Markets &amp; events
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          New event
        </h1>
      </div>

      <form action={createSellerEvent} className="dash-card flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Business / stand</span>
          <select
            name="standId"
            required
            defaultValue={selected?.id ?? stands[0]?.id}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          >
            {stands.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Name</span>
          <input
            name="name"
            required
            placeholder="Saturday farmers market"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Location</span>
          <input
            name="locationLabel"
            placeholder="Town square"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Starts</span>
          <input
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={startsDefault}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Ends (optional)</span>
          <input
            name="endsAt"
            type="datetime-local"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <button type="submit" className={dashCtaClass}>
          Create event
        </button>
      </form>
    </main>
  );
}
