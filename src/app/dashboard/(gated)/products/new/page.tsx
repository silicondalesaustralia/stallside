import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";
import NewProductForm from "./NewProductForm";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ standId?: string }>;
}) {
  const { owner, user } = await requireOwner();
  const { standId } = await searchParams;
  const stands = await prisma.stand.findMany({
    where: { ownerId: owner.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const cardTier = ownerHasCardTierAccess(owner, {
    email: user.email,
    role: user.role,
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
      <NewProductForm
        stands={stands}
        defaultStandId={standId}
        cardTier={cardTier}
      />
    </main>
  );
}
