import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { loadSupplierLedger } from "@/lib/suppliers/ledger";
import { revokeSupplier } from "./member-actions";
import ProductTermsForm from "./ProductTermsForm";
import LinkedProductTermsForm from "./LinkedProductTermsForm";
import LinkProductForm from "./LinkProductForm";
import ApproveLotButton from "./ApproveLotButton";
import DeleteSupplierProductButton from "./DeleteSupplierProductButton";
import DeleteSupplierButton from "./DeleteSupplierButton";
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
    include: { stand: { select: { id: true, name: true, currency: true } } },
  });
  if (!member) notFound();

  const [ledger, linkable, pendingLots] = await Promise.all([
    loadSupplierLedger(member.id),
    prisma.product.findMany({
      where: {
        ownerId: owner.id,
        standId: member.standId,
        memberId: null,
        isArchived: false,
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.stockLot.findMany({
      where: { memberId: member.id, status: "PENDING", quantityRemaining: { gt: 0 } },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const linkedIds = new Set(ledger.products.filter((p) => p.linked).map((p) => p.id));
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
          <dt className="text-[var(--muted)]">Their stock on hand</dt>
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

      {pendingLots.length > 0 ? (
        <div className="dash-card flex flex-col gap-3 p-4">
          <h2 className="font-semibold text-[var(--field)]">Waiting for your approval</h2>
          {pendingLots.map((lot) => (
            <ApproveLotButton
              key={lot.id}
              memberId={member.id}
              lotId={lot.id}
              label={`${lot.quantityRemaining} × ${lot.product.name}`}
            />
          ))}
        </div>
      ) : null}

      <LinkProductForm
        memberId={member.id}
        products={linkable.filter((p) => !linkedIds.has(p.id))}
      />

      <ul className="flex flex-col gap-3">
        {ledger.products.map((product) => (
          <li key={product.id} className="dash-card p-4">
            <p className="font-semibold text-[var(--field)]">{product.name}</p>
            <p className="text-sm text-[var(--muted)]">
              {product.linked ? "Shared with your catalogue · " : ""}
              Added {product.unitsAdded} · Sold {product.unitsSold} · Their units{" "}
              {product.stockQuantity}
              {product.pendingUnits > 0 ? ` · ${product.pendingUnits} pending` : ""}
              {!product.linked && product.isArchived ? " · Not on the stall yet" : ""}
            </p>
            {product.linked ? (
              <LinkedProductTermsForm
                memberId={member.id}
                productId={product.id}
                memberName={member.name}
                owedCents={product.supplierUnitCents ?? 0}
                autoApprove={product.autoApprove}
              />
            ) : (
              <>
                <ProductTermsForm
                  memberId={member.id}
                  productId={product.id}
                  priceCents={product.priceCents}
                  owedCents={product.supplierUnitCents}
                  archived={product.isArchived}
                />
                <div className="mt-2">
                  <DeleteSupplierProductButton
                    memberId={member.id}
                    productId={product.id}
                    productName={product.name}
                  />
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <PayoutForm memberId={member.id} />

      <div className="flex flex-col gap-2">
        {member.status !== "REVOKED" ? (
          <form action={revokeSupplier}>
            <input type="hidden" name="memberId" value={member.id} />
            <button type="submit" className="text-sm text-red-700 underline">
              Revoke access
            </button>
          </form>
        ) : null}
        <DeleteSupplierButton memberId={member.id} memberName={member.name} />
      </div>
    </div>
  );
}
