import Link from "next/link";

type LowStockRow = {
  id: string;
  name: string;
  stockQuantity: number;
};

export default function DashboardLowStockCard({
  items,
}: {
  items: LowStockRow[];
}) {
  const count = items.length;

  return (
    <div className="dash-card flex min-h-[205px] flex-1 flex-col justify-center px-6 py-5">
      <p className="text-center text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--field)]">
        Low stock
      </p>
      <p className="mt-2 text-center font-receipt text-4xl font-semibold tabular-nums">
        {count}
        <span className="text-lg text-[var(--muted)]"> / watch</span>
      </p>
      {count === 0 ? (
        <p className="mt-2 text-center text-sm text-[var(--muted)]">
          Nothing low right now.
        </p>
      ) : (
        <ul className="mt-3 space-y-1 text-sm">
          {items.slice(0, 3).map((p) => (
            <li key={p.id} className="flex justify-between gap-3">
              <Link
                href={`/dashboard/products/${p.id}`}
                className="truncate underline-offset-2 hover:underline"
              >
                {p.name}
              </Link>
              <span className="font-receipt text-[var(--warn)]">
                {p.stockQuantity} left
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex justify-center">
        <Link
          href="/dashboard/products"
          className="rounded-full bg-white px-4 py-2 text-[13px] font-bold text-[var(--ink)] outline outline-[var(--line)]"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
