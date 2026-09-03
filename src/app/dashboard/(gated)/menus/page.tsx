import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { menuKindLabel, menuPublicUrl, menuScheduleLabel } from "@/lib/menu";

export default async function MenusListPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);

  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <h1 className="text-3xl font-semibold tracking-tight">Menus</h1>
        <NoBusinessYet />
      </main>
    );
  }

  const [menus, storefront, stand] = await Promise.all([
    prisma.menu.findMany({
      where: { standId: selected.id, ownerId: owner.id },
      orderBy: [{ kind: "asc" }, { title: "asc" }],
      include: { _count: { select: { items: true } } },
    }),
    prisma.storefront.findUnique({
      where: { ownerId: owner.id },
      select: { slug: true },
    }),
    prisma.stand.findFirst({
      where: { id: selected.id },
      select: { timezone: true },
    }),
  ]);

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Menus</h1>
          <p className="mt-1 text-[var(--muted)]">
            Curate products into shoppable menu pages — always on or scheduled
            drops. Same cart and checkout as everything else.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/menus/new">+ New menu</DashPrimaryCta>
      </div>

      {menus.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No menus yet. Group products for a weekly bake list, market box, or
          always-on shop category.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {menus.map((menu) => {
            const schedule = menuScheduleLabel({
              kind: menu.kind,
              collectionAt: menu.collectionAt,
              timeZone: stand?.timezone,
            });
            const url = menuPublicUrl({
              standSlug: selected.slug,
              menuSlug: menu.slug,
              showOnShop: menu.showOnShop,
              storefrontSlug: storefront?.slug ?? null,
            });
            return (
              <li
                key={menu.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {menu.title}
                    {!menu.isActive ? (
                      <span className="ml-2 text-[var(--muted)]">(off)</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[var(--muted)]">
                    {menuKindLabel(menu.kind)}
                    {schedule ? ` · ${schedule}` : ""} · {menu._count.items}{" "}
                    products
                  </p>
                  <p className="mt-1 break-all text-xs text-[var(--muted)]">
                    {url}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/menus/${menu.id}`}
                    className="text-[var(--leaf-dark)] underline"
                  >
                    Edit
                  </Link>
                  {menu.kind === "PREORDER_DROP" ? (
                    <Link
                      href={`/dashboard/production?menuId=${menu.id}&range=week`}
                      className="text-[var(--leaf-dark)] underline"
                    >
                      Production
                    </Link>
                  ) : null}
                  <Link
                    href={url}
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
