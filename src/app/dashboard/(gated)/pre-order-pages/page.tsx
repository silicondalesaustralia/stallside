import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { formatCollectionLabel } from "@/lib/pre-order";
import { preOrderPagePath } from "@/lib/preorder-page";
import { SITE_URL } from "@/lib/legal";

export default async function PreOrderPagesListPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);

  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Pre-order pages
        </h1>
        <NoBusinessYet />
      </main>
    );
  }

  const pages = await prisma.preOrderPage.findMany({
    where: { standId: selected.id, ownerId: owner.id },
    orderBy: [{ collectionAt: "asc" }, { title: "asc" }],
    include: { _count: { select: { items: true } } },
  });

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Pre-order pages
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            {selected.name} - one link with several products for the same
            collection day.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/pre-order-pages/new">
          + New pre-order page
        </DashPrimaryCta>
      </div>

      {pages.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No pre-order pages yet. Create one, pick products, share the link.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {pages.map((page) => {
            const path = preOrderPagePath(selected.slug, page.slug);
            return (
              <li
                key={page.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {page.title}
                    {!page.isActive ? (
                      <span className="ml-2 text-[var(--muted)]">(off)</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[var(--muted)]">
                    {formatCollectionLabel(page.collectionAt)} ·{" "}
                    {page._count.items} products
                  </p>
                  <p className="mt-1 break-all text-xs text-[var(--muted)]">
                    {SITE_URL}
                    {path}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/pre-order-pages/${page.id}`}
                    className="text-[var(--leaf-dark)] underline"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/pre-order-pages/${page.id}/qr`}
                    className="text-[var(--leaf-dark)] underline"
                  >
                    QR
                  </Link>
                  <Link
                    href={path}
                    target="_blank"
                    className="text-[var(--leaf-dark)] underline"
                  >
                    Open
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
