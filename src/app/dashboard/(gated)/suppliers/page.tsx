import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import NoBusinessYet from "@/components/NoBusinessYet";
import InviteForm from "./InviteForm";

export default async function SuppliersPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) return <NoBusinessYet />;

  const members = await prisma.standMember.findMany({
    where: { standId: selected.id, ownerId: owner.id },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Suppliers
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          People who can add their own products and stock to {selected.name}. You
          set the price and pay them outside Vendl.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {members.map((member) => (
          <li key={member.id}>
            <Link
              href={`/dashboard/suppliers/${member.id}`}
              className="dash-card flex items-center justify-between gap-3 p-4"
            >
              <span>
                <span className="font-semibold text-[var(--field)]">{member.name}</span>
                <span className="mt-0.5 block text-sm text-[var(--muted)]">
                  {member.email} · {member._count.products} products
                </span>
              </span>
              <span className="text-sm capitalize text-[var(--muted)]">
                {member.status.toLowerCase()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <InviteForm />
    </div>
  );
}
