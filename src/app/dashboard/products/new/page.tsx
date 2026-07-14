import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createProduct } from "../actions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ standId?: string }>;
}) {
  const { owner } = await requireOwner();
  const { standId } = await searchParams;
  const stands = await prisma.stand.findMany({
    where: { ownerId: owner.id },
    orderBy: { name: "asc" },
  });

  if (stands.length === 0) {
    return (
      <main>
        <h1 className="text-3xl font-semibold tracking-tight">Add product</h1>
        <p className="mt-3 text-[var(--muted)]">Create a stand first.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg">
      <h1 className="text-3xl font-semibold tracking-tight">Add product</h1>
      <form action={createProduct} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Stand</span>
          <select
            name="standId"
            defaultValue={standId ?? stands[0].id}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          >
            {stands.map((stand) => (
              <option key={stand.id} value={stand.id}>
                {stand.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Product name</span>
          <input
            name="name"
            required
            placeholder="Dozen eggs"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Description (optional)</span>
          <input name="description" className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5" />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Price</span>
          <input
            name="price"
            required
            inputMode="decimal"
            placeholder="6.00"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Starting stock</span>
          <input
            name="stockQuantity"
            type="number"
            min={0}
            defaultValue={0}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Low-stock threshold</span>
          <input
            name="lowStockThreshold"
            type="number"
            min={0}
            defaultValue={5}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Save product
        </button>
      </form>
    </main>
  );
}
