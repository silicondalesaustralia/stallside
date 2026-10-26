"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatMoney } from "@/lib/money";
import type { ReviewInvoice, ReviewLine } from "@/lib/production/invoice-scan/schema";
import { inputClass, labelClass, thClass } from "../../form-styles";
import { saveScannedInvoice } from "../save-scan-action";
import InvoiceLineRow from "./InvoiceLineRow";
import InvoiceReviewNotices from "./InvoiceReviewNotices";
import { basisLabel, lineProblem, switchBasis, toSaveInput, type ScanMaterial } from "./review-helpers";

export default function InvoiceReview({
  initial,
  materials,
  currency,
  onDone,
}: {
  initial: ReviewInvoice;
  materials: ScanMaterial[];
  currency: string;
  onDone: (message: string) => void;
}) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const included = invoice.lines.filter((l) => l.include);
  const blocked = included.length === 0 || included.some((l) => lineProblem(l, materials));

  function patchLine(key: string, patch: Partial<ReviewLine>) {
    setInvoice((prev) => ({ ...prev, lines: prev.lines.map((l) => (l.key === key ? { ...l, ...patch } : l)) }));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await saveScannedInvoice(toSaveInput(invoice));
        if ("error" in result) {
          setError(result.error);
          return;
        }
        router.refresh();
        onDone(result.message ?? "Saved.");
      } catch (err) {
        console.error("saveScannedInvoice failed", err);
        setError("Could not save. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className={labelClass}>
          Supplier
          <input className={inputClass} value={invoice.supplier} onChange={(e) => setInvoice({ ...invoice, supplier: e.target.value })} />
        </label>
        <label className={labelClass}>
          Invoice / receipt no.
          <input className={inputClass} value={invoice.invoiceNumber} onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })} />
        </label>
        <label className={labelClass}>
          Received
          <input className={inputClass} type="date" value={invoice.invoiceDate} onChange={(e) => setInvoice({ ...invoice, invoiceDate: e.target.value })} />
        </label>
      </div>

      <InvoiceReviewNotices invoice={invoice} currency={currency} />
      {invoice.taxRecoverable ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={invoice.costBasis === "ex-tax"}
            onChange={(e) => setInvoice(switchBasis(invoice, e.target.checked ? "ex-tax" : "inc-tax"))}
          />
          I&apos;m registered for {invoice.taxLabel} and claim it back, so record costs excluding {invoice.taxLabel}
        </label>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--wash)]">
            <tr>
              <th className={thClass} />
              <th className={thClass}>Item on invoice</th>
              <th className={thClass}>Material</th>
              <th className={thClass}>Quantity received</th>
              <th className={thClass}>Cost ({basisLabel(invoice)})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {invoice.lines.map((line) => (
              <InvoiceLineRow key={`${line.key}-${invoice.costBasis}`} line={line} materials={materials} onChange={(patch) => patchLine(line.key, patch)} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending || blocked}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
        >
          {pending ? "Saving…" : `Record ${included.length} purchase${included.length === 1 ? "" : "s"}`}
        </button>
        <span className="text-sm text-[var(--muted)]">
          {formatMoney(included.reduce((s, l) => s + l.totalCents, 0), currency)} goes into material costs
        </span>
        {invoice.receiptUrl ? (
          <a href={invoice.receiptUrl} target="_blank" rel="noreferrer" className="text-sm text-[var(--leaf-dark)] underline">
            View document
          </a>
        ) : null}
      </div>
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
