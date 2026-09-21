import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { loadSupplierLedger } from "@/lib/suppliers/ledger";
import { revokeSupplier } from "./member-actions";
import ProductTermsForm from "./ProductTermsForm";
import PayoutForm from "./PayoutForm";

export default async function SupplierMemberPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const { owner } = await requireOwner();
  const member = await prisma.standMember.findFirst({
    where: { id: memberId, ownerId: owner.id },
    include: { stand: { select: { name: true, currency: true } } },
  });
  if (!member) notFound();

  const ledger = await loadSupplierLedger(member.id);
  const currency = member.stand.currency;
  const balance = ledger.owedCents - ledger.paidCents;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/suppliers" className="text-sm text-[var(--leaf-dark)] underline">
          Suppliers
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          {member.name}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {member.email} · {member.stand.name} · {member.status.toLowerCase()}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div className="dash-card p-3">
          <dt className="text-[var(--muted)]">Added</dt>
          <dd className="text-lg font-semibold">{ledger.unitsAdded}</dd>
        </div>
        <div className="dash-card p-3">
          <dt className="text-[var(--muted)]">Sold</dt>
          <dd className="text-lg font-semibold">{ledger.unitsSold}</dd>
        </div>
        <div className="dash-card p-3">
          <dt className="text-[var(--muted)]">On hand</dt>
          <dd className="text-lg font-semibold">{ledger.onHand}</dd>
        </div>
        <div className="dash-card p-3">
          <dt className="text-[var(--muted)]">Owed</dt>
          <dd className="text-lg font-semibold">{formatMoney(ledger.owedCents, currency)}</dd>
        </div>
        <div className="dash-card p-3">
          <dt className="text-[var(--muted)]">Marked paid</dt>
          <dd className="text-lg font-semibold">{formatMoney(ledger.paidCents, currency)}</dd>
        </div>
        <div className="dash-card p-3">
          <dt className="text-[var(--muted)]">Balance</dt>
          <dd className="text-lg font-semibold">{formatMoney(balance, currency)}</dd>
        </div>
      </dl>

      <ul className="flex flex-col gap-3">
        {ledger.products.map((product) => (
          <li key={product.id} className="dash-card p-4">
            <p className="font-semibold text-[var(--field)]">{product.name}</p>
            <p className="text-sm text-[var(--muted)]">
              Added {product.unitsAdded} · Sold {product.unitsSold} · On hand{" "}
              {product.stockQuantity}
              {product.isArchived ? " · Not on the stall yet" : ""}
            </p>
            <ProductTermsForm
              memberId={member.id}
              productId={product.id}
              priceCents={product.priceCents}
              owedCents={product.supplierUnitCents}
              archived={product.isArchived}
            />
          </li>
        ))}
      </ul>

      <PayoutForm memberId={member.id} />

      {member.status !== "REVOKED" ? (
        <form action={revokeSupplier}>
          <input type="hidden" name="memberId" value={member.id} />
          <button type="submit" className="text-sm text-red-700 underline">
            Revoke access
          </button>
        </form>
      ) : null}
    </div>
  );
}
