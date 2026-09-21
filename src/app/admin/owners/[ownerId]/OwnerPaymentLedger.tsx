import PaymentLedgerTable from "./PaymentLedgerTable";
import { loadOwnerPaymentLedger } from "@/lib/owner-payment-ledger";

export default async function OwnerPaymentLedger({
  ownerId,
  stripeCustomerId,
}: {
  ownerId: string;
  stripeCustomerId: string | null;
}) {
  const { rows, invoiceError } = await loadOwnerPaymentLedger({
    ownerId,
    stripeCustomerId,
  });

  return (
    <section className="dash-card space-y-3 p-5">
      <div>
        <h2 className="text-lg font-semibold">Payments to Vendl</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Every counted transaction fee and paid subscription invoice.
        </p>
      </div>
      {invoiceError ? (
        <p className="text-sm text-red-700">{invoiceError}</p>
      ) : null}
      <PaymentLedgerTable rows={rows} />
    </section>
  );
}
