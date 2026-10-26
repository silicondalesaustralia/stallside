"use client";

import { useState, useTransition } from "react";
import type { ReviewInvoice } from "@/lib/production/invoice-scan/schema";
import { cardClass } from "../../form-styles";
import { scanInvoice } from "../scan-actions";
import InvoiceReview from "./InvoiceReview";
import { prepareInvoiceFile } from "./prepare-invoice-file";
import type { ScanMaterial } from "./review-helpers";

const pickClass =
  "cursor-pointer rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-[var(--ink)] outline outline-[var(--line)] hover:bg-[var(--wash)]";

export default function ScanInvoicePanel({ materials, currency }: { materials: ScanMaterial[]; currency: string }) {
  const [review, setReview] = useState<ReviewInvoice | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  function onFile(input: HTMLInputElement) {
    const picked = input.files?.[0];
    input.value = "";
    if (!picked) return;
    setMessage(null);
    setReview(null);
    startTransition(async () => {
      try {
        const file = await prepareInvoiceFile(picked);
        const body = new FormData();
        body.set("file", file);
        const result = await scanInvoice(body);
        if ("error" in result) setMessage({ text: result.error, error: true });
        else setReview(result.invoice);
      } catch (err) {
        console.error("scanInvoice failed", err);
        setMessage({ text: err instanceof Error ? err.message : "Scanning failed. Try again.", error: true });
      }
    });
  }

  return (
    <section className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Scan an invoice or receipt</h2>
          <p className="text-sm text-[var(--muted)]">
            Snap or upload a supplier invoice, receipt or order PDF. Our system reads the items, you check them, and they&apos;re
            added to stock and costs.
          </p>
        </div>
        <div className="flex gap-2">
          <label className={`${pickClass} sm:hidden`}>
            Take photo
            <input type="file" accept="image/*" capture="environment" className="sr-only" disabled={pending} onChange={(e) => onFile(e.currentTarget)} />
          </label>
          <label className={pickClass}>
            Upload photo or PDF
            <input type="file" accept="image/*,application/pdf" className="sr-only" disabled={pending} onChange={(e) => onFile(e.currentTarget)} />
          </label>
        </div>
      </div>
      {pending ? <p className="mt-3 text-sm text-[var(--muted)]">Reading your document… this takes about 10–30 seconds.</p> : null}
      {message ? (
        <p className={`mt-3 text-sm font-semibold ${message.error ? "text-red-700" : "text-[var(--leaf-dark)]"}`}>{message.text}</p>
      ) : null}
      {review ? (
        <div className="mt-4">
          <InvoiceReview
            initial={review}
            materials={materials}
            currency={currency}
            onDone={(text) => {
              setReview(null);
              setMessage({ text, error: false });
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
