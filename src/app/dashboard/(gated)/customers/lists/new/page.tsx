import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NewListFromRulesForm from "./NewListFromRulesForm";

export default async function NewListFromRulesPage() {
  const { owner } = await requireOwner();
  const products = await prisma.product.findMany({
    where: { ownerId: owner.id, isArchived: false },
    orderBy: { name: "asc" },
    take: 300,
    select: { id: true, name: true },
  });

  return (
    <main className="flex max-w-xl flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/customers/lists" className="underline">
            Lists
          </Link>
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          List from rules
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          e.g. everyone who bought eggs, or all pre-order customers.
        </p>
      </div>
      <NewListFromRulesForm products={products} />
    </main>
  );
}
