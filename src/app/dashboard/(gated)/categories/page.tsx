import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { listOwnerCategories } from "@/lib/categories/load";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import CategoriesTable from "./CategoriesTable";
import CategoryMenuOrder from "./CategoryMenuOrder";
import { createCategory } from "./actions";
import ViewOnSiteLink from "@/components/dashboard/ViewOnSiteLink";
import { ownerSiteUrl } from "@/lib/storefront/owner-site-url";
import { shopPagePath } from "@/lib/storefront/paths";
import SiteSlugClashNotice from "@/components/website/SiteSlugClashNotice";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; published?: string; unpublished?: string; deleted?: string; arrange?: string }>;
}) {
  const { owner } = await requireOwner();
  const { error, published, unpublished, deleted, arrange } = await searchParams;

  const [categories, shopUrl, storefront] = await Promise.all([
    listOwnerCategories(owner.id),
    ownerSiteUrl(owner.id, (slug, draft, base) => shopPagePath(slug, "shop", draft, base)),
    prisma.storefront.findFirst({ where: { ownerId: owner.id }, select: { draftConfig: true } }),
  ]);

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="Categories"
        subtitle="Group products for your shop. Categories with products show as links in your shop menu."
        actions={shopUrl ? <ViewOnSiteLink href={shopUrl} label="View shop" /> : null}
      />

      {storefront ? <SiteSlugClashNotice ownerId={owner.id} configRaw={storefront.draftConfig} /> : null}

      {published ? <p className="text-sm font-medium text-[var(--ok)]">Category published.</p> : null}
      {unpublished ? <p className="text-sm font-medium text-[var(--ok)]">Category unpublished.</p> : null}
      {deleted ? <p className="text-sm font-medium text-[var(--ok)]">Category deleted.</p> : null}

      <form action={createCategory} className="dash-card flex flex-wrap items-end gap-2 p-4">
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

      {arrange === "1" ? (
        <CategoryMenuOrder categories={categories} />
      ) : categories.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
          No categories yet. Add your first one above.
        </div>
      ) : (
        <section className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Menu order</h2>
            {categories.length > 1 ? (
              <Link
                href="/dashboard/categories?arrange=1"
                className="text-sm font-semibold text-[var(--leaf-dark)] underline"
              >
                Arrange menu order
              </Link>
            ) : null}
          </div>
          <CategoriesTable categories={categories} />
        </section>
      )}
    </main>
  );
}
