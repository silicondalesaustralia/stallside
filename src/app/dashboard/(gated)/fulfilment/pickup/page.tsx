import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { savePickupWindow } from "../actions";
import { formatPickupWindowLabel } from "@/lib/fulfilment/window-format";
import { fulfilmentKindLabel } from "@/lib/fulfilment/window-format";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function FulfilmentPickupPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;

  const [locations, options] = await Promise.all([
    prisma.pickupLocation.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.fulfilmentOption.findMany({
      where: {
        ownerId: owner.id,
        kind: { in: ["PICKUP", "PREORDER_SHEET"] },
      },
      include: { pickupLocation: true, pickupWindow: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <main className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/fulfilment" className="underline">
            Fulfilment
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold">
          Pickup schedules
        </h1>
      </div>

      {params.saved ? (
        <p className="text-sm text-[var(--leaf-dark)]">Saved.</p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {options.map((opt) => (
          <li key={opt.id} className="dash-card p-4">
            <p className="font-semibold">{opt.label}</p>
            <p className="text-sm text-[var(--muted)]">
              {fulfilmentKindLabel(opt.kind)}
              {opt.pickupLocation ? ` · ${opt.pickupLocation.publicLabel}` : ""}
              {opt.pickupWindow
                ? ` · ${formatPickupWindowLabel(opt.pickupWindow)}`
                : ""}
            </p>
          </li>
        ))}
      </ul>

      <form action={savePickupWindow} className="dash-card flex max-w-lg flex-col gap-4 p-4">
        <h2 className="font-semibold">Add weekly pickup</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Label</span>
          <input name="label" placeholder="Saturday morning" className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Location</span>
          <select name="pickupLocationId" className="rounded-lg border border-[var(--line)] px-3 py-2.5">
            <option value="">— Optional —</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Pickup day</span>
          <select name="weekday" className="rounded-lg border border-[var(--line)] px-3 py-2.5">
            {WEEKDAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Start (mins from midnight)</span>
            <input name="startTimeMin" type="number" defaultValue={480} className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">End</span>
            <input name="endTimeMin" type="number" defaultValue={660} className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Orders close — weekday</span>
            <select name="orderCloseWeekday" className="rounded-lg border border-[var(--line)] px-3 py-2.5">
              {WEEKDAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Close time (mins)</span>
            <input name="orderCloseTimeMin" type="number" defaultValue={1080} className="rounded-lg border border-[var(--line)] px-3 py-2.5" />
          </label>
        </div>
        <button type="submit" className={dashCtaClass}>
          Create pickup schedule
        </button>
      </form>
    </main>
  );
}
