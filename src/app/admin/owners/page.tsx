import Link from "next/link";
import AdminOwnersTable from "@/components/AdminOwnersTable";
import AdminSearchForm from "@/components/AdminSearchForm";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audRatesFromMarket } from "@/lib/fx-to-aud";
import { adminListHref } from "@/lib/admin-list-href";
import type { Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 50;
const BASE = "/admin/owners";

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

  const where: Prisma.OwnerWhereInput = q
    ? {
        OR: [
          { businessName: { contains: q, mode: "insensitive" } },
          { contactEmail: { contains: q, mode: "insensitive" } },
          { user: { email: { contains: q, mode: "insensitive" } } },
          { id: { contains: q, mode: "insensitive" } },
          { stands: { some: { name: { contains: q, mode: "insensitive" } } } },
          { stands: { some: { slug: { contains: q, mode: "insensitive" } } } },
        ],
      }
    : {};

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
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Subscribers</h1>
        <p className="mt-1 text-[var(--muted)]">
          Business, stalls, plan, LTV (billing currency + AUD), and status.
        </p>
      </div>

      <AdminSearchForm
        q={q}
        placeholder="Search business, email, stall, or owner ID"
        clearHref={BASE}
      />

      {owners.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {q ? `No subscribers match “${q}”.` : "No owners yet."}
        </p>
      ) : (
        <AdminOwnersTable owners={owners} fx={fx} />
      )}
      {pageCount > 1 ? (
        <nav className="flex items-center gap-3 text-sm">
          {page > 1 ? (
            <Link href={adminListHref(BASE, page - 1, q)} className="underline">
              Previous
            </Link>
          ) : (
            <span className="text-[var(--muted)]">Previous</span>
          )}
          <span className="text-[var(--muted)]">
            Page {page} of {pageCount}
            {q ? ` · ${total} match${total === 1 ? "" : "es"}` : ""}
          </span>
          {page < pageCount ? (
            <Link href={adminListHref(BASE, page + 1, q)} className="underline">
              Next
            </Link>
          ) : (
            <span className="text-[var(--muted)]">Next</span>
          )}
        </nav>
      ) : q && total > 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {total} match{total === 1 ? "" : "es"}
        </p>
      ) : null}
    </main>
  );
}
