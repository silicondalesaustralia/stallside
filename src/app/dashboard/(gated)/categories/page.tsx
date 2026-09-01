import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { createCategory, deleteCategory, updateCategory } from "./actions";

export default async function CategoriesPage() {
  const { owner } = await requireOwner();
  const categories = await prisma.category.findMany({
    where: { ownerId: owner.id },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          Categories
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Organise your catalogue. Separate from sell tips in Getting Started.
        </p>
      </div>

      <form
        action={createCategory}
        className="dash-card flex flex-col gap-3 p-4 sm:max-w-md"
      >
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">
          New category
        </h2>
        <input
          name="title"
          required
          placeholder="Category name"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
        <textarea
          name="description"
          rows={2}
          placeholder="Optional description"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
        <button type="submit" className={dashCtaClass}>
          Add category
        </button>
      </form>

      {categories.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No categories yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {categories.map((cat) => (
            <li key={cat.id} className="dash-card p-4">
              <form
                action={updateCategory.bind(null, cat.id)}
                className="flex flex-col gap-3 sm:max-w-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-[var(--muted)]">
                    {cat._count.products} product
                    {cat._count.products === 1 ? "" : "s"} · /{cat.slug}
                  </p>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={cat.isActive}
                    />
                    Active
                  </label>
                </div>
                <input
                  name="title"
                  required
                  defaultValue={cat.title}
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 font-semibold"
                />
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={cat.description ?? ""}
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--field)] px-4 py-2 text-sm font-bold text-[var(--ink-on-dark)]"
                  >
                    Save
                  </button>
                  <button
                    type="submit"
                    formAction={deleteCategory.bind(null, cat.id)}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--gone)] outline outline-[var(--line)]"
                  >
                    Delete
                  </button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-[var(--muted)]">
        Assign categories on each{" "}
        <Link href="/dashboard/products" className="underline">
          product
        </Link>
        .
      </p>
    </main>
  );
}
