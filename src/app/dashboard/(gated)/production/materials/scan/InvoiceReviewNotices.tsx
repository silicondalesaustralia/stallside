import { formatMoney } from "@/lib/money";
import type { ReviewInvoice } from "@/lib/production/invoice-scan/schema";
import { basisLabel, includedTotalCents } from "./review-helpers";

const note = "rounded-lg px-3 py-2 text-sm";

export default function InvoiceReviewNotices({ invoice, currency }: { invoice: ReviewInvoice; currency: string }) {
  const included = includedTotalCents(invoice.lines);
  const invoiceTotal =
    invoice.totalCents == null
      ? null
      : invoice.costBasis === "ex-tax"
        ? invoice.totalCents - (invoice.taxCents ?? 0)
        : invoice.totalCents;
  const mismatch = invoiceTotal != null && Math.abs(invoiceTotal - included) > Math.max(100, invoiceTotal * 0.02);
  const otherCurrency = invoice.currency && invoice.currency.toUpperCase() !== currency.toUpperCase();
  const basis = basisLabel(invoice);

  return (
    <div className="flex flex-col gap-2">
      <p className={`${note} bg-[var(--wash)] text-[var(--muted)]`}>
        Check each line, then record. Ticked lines add to stock and become each material&apos;s current cost, so
        recipes, margins and profit update straight away.{" "}
        {invoice.costBasis === "ex-tax"
          ? `Costs exclude ${invoice.taxLabel} because you claim it back.`
          : invoice.taxRecoverable
            ? `Costs include any ${invoice.taxLabel} paid.`
            : `Costs include any ${invoice.taxLabel} paid, since it's part of what your supplies cost you.`}
      </p>
      {invoice.duplicateOf ? (
        <p className={`${note} bg-amber-50 font-semibold text-amber-900`}>
          Invoice {invoice.invoiceNumber} looks like it was already recorded on {invoice.duplicateOf}. Recording it again
          will double the stock.
        </p>
      ) : null}
      {mismatch && invoiceTotal != null ? (
        <p className={`${note} bg-amber-50 text-amber-900`}>
          Ticked lines total {formatMoney(included, currency)}; the invoice says {formatMoney(invoiceTotal, currency)} ({basis}).
          Delivery and fees are left out on purpose. Check nothing else is missing.
        </p>
      ) : null}
      {otherCurrency ? (
        <p className={`${note} bg-amber-50 text-amber-900`}>
          This invoice is in {invoice.currency}, but your business uses {currency}. Convert the costs before recording.
        </p>
      ) : null}
    </div>
  );
}
