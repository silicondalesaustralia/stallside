import Link from "next/link";
import DashPrimaryCta from "@/components/DashPrimaryCta";

export type UpsellRow = {
  id: string;
  name: string;
  offer: string;
  scope: string;
  channels: string;
  isActive: boolean;
};

export default function UpsellList({ upsells }: { upsells: UpsellRow[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Cart upsells</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Offer an extra item in the cart: everywhere, for certain categories, or for certain products.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/upsells/new">+ New upsell</DashPrimaryCta>
      </div>
      {upsells.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No upsells yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
          {upsells.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium">
                  {u.name}
                  {!u.isActive ? (
                    <span className="ml-2 rounded-full bg-[var(--wash)] px-2 py-0.5 text-xs font-medium">Off</span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[var(--muted)]">
                  Offers {u.offer} · {u.scope} · {u.channels}
                </p>
              </div>
              <Link href={`/dashboard/upsells/${u.id}`} className="text-[var(--leaf-dark)] underline">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
