import Link from "next/link";
import { headers } from "next/headers";
import { logout } from "@/app/login/actions";
import { requireSupplier } from "@/lib/suppliers/access";

function standFromSearch(search: string): string | null {
  const value = new URLSearchParams(search).get("stand")?.trim();
  return value || null;
}

export default async function SupplyDeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const standId = standFromSearch(h.get("x-stallside-search") ?? "");
  const { membership, memberships, hasOwnStand, user } = await requireSupplier(
    standId,
  );

  return (
    <div className="min-h-full bg-[var(--wash)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--panel)] px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Supplier
          </p>
          <p className="font-semibold text-[var(--field)]">{membership.stand.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {hasOwnStand ? (
            <Link href="/dashboard" className="text-[var(--leaf-dark)] underline">
              Your stand
            </Link>
          ) : null}
          <span className="text-[var(--muted)]">{user.email}</span>
          <form action={logout}>
            <button type="submit" className="text-[var(--leaf-dark)] underline">
              Sign out
            </button>
          </form>
        </div>
      </header>
      {memberships.length > 1 ? (
        <nav className="flex gap-3 overflow-x-auto border-b border-[var(--line)] px-4 py-2 text-sm">
          {memberships.map((row) => (
            <Link
              key={row.id}
              href={`/supply?stand=${row.standId}`}
              className={
                row.id === membership.id
                  ? "font-semibold text-[var(--field)]"
                  : "text-[var(--leaf-dark)] underline"
              }
            >
              {row.stand.name}
            </Link>
          ))}
        </nav>
      ) : null}
      <main className="mx-auto w-full max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
