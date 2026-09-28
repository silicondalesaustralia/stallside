import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import SortableOrderList from "@/components/SortableOrderList";
import ProductsTabs from "../products/ProductsTabs";
import ShopLayoutForm from "./ShopLayoutForm";
import { createCategory, saveCategoryOrder } from "./actions";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; layout?: string }>;
}) {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  const { error, layout } = await searchParams;

  const [categories, stand] = await Promise.all([
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
    selected
      ? prisma.stand.findUnique({
          where: { id: selected.id },
          select: { id: true, name: true, shopLayout: true },
        })
      : Promise.resolve(null),
  ]);

  const items = categories.map((c) => ({
    id: c.id,
    label: c.title,
    href: `/dashboard/categories/${c.id}`,
    detail: [
      `${c._count.products} product${c._count.products === 1 ? "" : "s"}`,
      !c.isActive ? "Inactive" : null,
      c.isActive && !c.showOnWebsite ? "Hidden from shop menu" : null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Categories
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Group products for your shop. Categories with products show as links in your shop menu.
        </p>
      </div>

      <ProductsTabs active="categories" />

      {stand ? (
        <ShopLayoutForm
          standId={stand.id}
          standName={stand.name}
          value={stand.shopLayout}
          saved={layout === "saved"}
        />
      ) : null}

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
