import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import SortableOrderList from "@/components/SortableOrderList";
import CategoryRowActions from "./CategoryRowActions";
import { createCategory, deleteCategory, saveCategoryOrder, setCategoryActive } from "./actions";
import ViewOnSiteLink from "@/components/dashboard/ViewOnSiteLink";
import { ownerSiteUrl } from "@/lib/storefront/owner-site-url";
import { shopPagePath } from "@/lib/storefront/paths";
import SiteSlugClashNotice from "@/components/website/SiteSlugClashNotice";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; published?: string; unpublished?: string; deleted?: string }>;
}) {
  const { owner } = await requireOwner();
  const { error, published, unpublished, deleted } = await searchParams;

  const [categories, shopUrl, storefront] = await Promise.all([
    prisma.category.findMany({
      where: { ownerId: owner.id },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        isActive: true,
        showOnWebsite: true,
        _count: { select: { products: true } },
      },
    }),
    ownerSiteUrl(owner.id, (slug, draft, base) => shopPagePath(slug, "shop", draft, base)),
    prisma.storefront.findFirst({ where: { ownerId: owner.id }, select: { draftConfig: true } }),
  ]);

  const items = categories.map((c) => ({
    id: c.id,
    label: c.title,
    href: `/dashboard/categories/${c.id}`,
    detail: [
      `${c._count.products} product${c._count.products === 1 ? "" : "s"}`,
      c.isActive && !c.showOnWebsite ? "Hidden from shop menu" : null,
    ]
      .filter(Boolean)
      .join(" · "),
    badge: (
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
          c.isActive ? "bg-[var(--ok)]/15 text-[var(--ok)]" : "bg-[var(--wash)] text-[var(--muted)]"
        }`}
      >
        {c.isActive ? "Published" : "Unpublished"}
      </span>
    ),
    actions: (
      <CategoryRowActions
        title={c.title}
        isActive={c.isActive}
        toggleAction={setCategoryActive.bind(null, c.id, !c.isActive, "list")}
        deleteAction={deleteCategory.bind(null, c.id)}
      />
    ),
  }));

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Categories
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Group products for your shop. Categories with products show as links in your shop menu.
          </p>
        </div>
        {shopUrl ? <ViewOnSiteLink href={shopUrl} label="View shop" /> : null}
      </div>

      {storefront ? <SiteSlugClashNotice ownerId={owner.id} configRaw={storefront.draftConfig} /> : null}

      {published ? <p className="text-sm font-medium text-[var(--ok)]">Category published.</p> : null}
      {unpublished ? <p className="text-sm font-medium text-[var(--ok)]">Category unpublished.</p> : null}
      {deleted ? <p className="text-sm font-medium text-[var(--ok)]">Category deleted.</p> : null}

      <form action={createCategory} className="flex flex-wrap items-end gap-2 rounded-xl border border-[var(--line)] bg-white p-4">
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
          <span className="font-semibold">New category</span>
          <input
            name="title"
            required
            maxLength={80}
            placeholder="e.g. Vegetables"
            className="rounded-lg border border-[var(--line)] px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Add category
        </button>
        {error === "name" ? (
          <p className="w-full text-sm text-[var(--gone)]">Enter a category name.</p>
        ) : null}
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">Menu order</h2>
        <SortableOrderList
          key={items.map((i) => i.id).join()}
          items={items}
          onSave={saveCategoryOrder}
          emptyText="No categories yet. Add your first one above."
        />
      </section>
    </main>
  );
}
