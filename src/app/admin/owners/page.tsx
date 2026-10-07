import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audRatesFromMarket } from "@/lib/fx-to-aud";
import { platformFeesByOwner } from "@/lib/owner-ltv";
import AdminOwnersTable from "./AdminOwnersTable";

const PAGE_SIZE = 50;

function ownerWhere(q: string) {
  if (!q) return {};
  return {
    OR: [
      { businessName: { contains: q, mode: "insensitive" as const } },
      { contactEmail: { contains: q, mode: "insensitive" as const } },
      { id: { contains: q, mode: "insensitive" as const } },
      { user: { email: { contains: q, mode: "insensitive" as const } } },
      {
        stands: {
          some: { name: { contains: q, mode: "insensitive" as const } },
        },
      },
    ],
  };
}

function ownersHref(page: number, q: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/owners?${query}` : "/admin/owners";
}

export default async function AdminOwnersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const where = ownerWhere(q);

  const [owners, total, fx] = await Promise.all([
    prisma.owner.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        user: true,
        stands: { select: { id: true, name: true }, take: 4 },
      },
    }),
    prisma.owner.count({ where }),
    audRatesFromMarket(),
  ]);
  const feesByOwner = await platformFeesByOwner(owners.map((owner) => owner.id));
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Subscribers ({total.toLocaleString()})
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          LTV is transaction fees plus subscription payments.
        </p>
      </div>

      <form action="/admin/owners" className="flex max-w-md gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Business, stall, or email"
          aria-label="Search subscribers"
          className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
        >
          Search
        </button>
      </form>

      {owners.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {q ? "No subscribers match that search." : "No owners yet."}
        </p>
      ) : (
        <AdminOwnersTable owners={owners} feesByOwner={feesByOwner} rates={fx} />
      )}
      {pageCount > 1 ? (
        <nav className="flex items-center gap-3 text-sm">
          {page > 1 ? (
            <Link href={ownersHref(page - 1, q)} className="underline">
              Previous
            </Link>
          ) : (
            <span className="text-[var(--muted)]">Previous</span>
          )}
          <span className="text-[var(--muted)]">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={ownersHref(page + 1, q)} className="underline">
              Next
            </Link>
          ) : (
            <span className="text-[var(--muted)]">Next</span>
          )}
        </nav>
      ) : null}
    </main>
  );
}
