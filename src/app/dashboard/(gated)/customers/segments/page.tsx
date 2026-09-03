import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import {
  countSegmentCustomers,
  parseSegmentRules,
  SEGMENT_PRESETS,
} from "@/lib/grow/segments";
import { createSegmentFromPreset, archiveSegment } from "./actions";

export default async function SegmentsPage() {
  const { owner } = await requireOwner();

  const segments = await prisma.customerSegment.findMany({
    where: { ownerId: owner.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const savedCounts = await Promise.all(
    segments.map(async (s) => ({
      id: s.id,
      count: await countSegmentCustomers(owner.id, parseSegmentRules(s.rules)),
    })),
  );
  const countById = Object.fromEntries(savedCounts.map((c) => [c.id, c.count]));

  const presetEntries = Object.entries(SEGMENT_PRESETS);
  const presetCounts = await Promise.all(
    presetEntries.map(async ([key, p]) => ({
      key,
      count: await countSegmentCustomers(owner.id, p.rules),
    })),
  );
  const presetCountByKey = Object.fromEntries(
    presetCounts.map((c) => [c.key, c.count]),
  );

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">
            <Link href="/dashboard/marketing" className="underline">
              Grow
            </Link>
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Segments
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Groups of customers you can message or reward.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/customers/segments/new">
          + Custom segment
        </DashPrimaryCta>
      </div>

      <section>
        <h2 className="text-lg font-semibold">Presets</h2>
        <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {presetEntries.map(([key, p]) => (
            <li
              key={key}
              className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="mt-1 text-[var(--muted)]">
                  {p.description} · {presetCountByKey[key] ?? 0} customers
                </p>
              </div>
              <form action={createSegmentFromPreset}>
                <input type="hidden" name="presetKey" value={key} />
                <button
                  type="submit"
                  className="text-[var(--leaf-dark)] underline"
                >
                  Save
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Your segments</h2>
        {segments.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">
            No saved segments yet. Save a preset or create a custom one.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {segments.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="mt-1 text-[var(--muted)]">
                    {s.description || s.presetKey || "custom"} ·{" "}
                    {countById[s.id] ?? 0} customers
                  </p>
                </div>
                <form action={archiveSegment}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="text-[var(--muted)] underline">
                    Archive
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
