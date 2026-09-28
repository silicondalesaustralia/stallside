"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MAX_IMPORT_BYTES } from "@/lib/inventory/import-limits";
import {
  applyStockImport,
  previewStockImport,
  type ImportPreviewResult,
} from "./stock-import-actions";
import InventoryImportPreview from "./InventoryImportPreview";

type Preview = Extract<ImportPreviewResult, { ok: true }>;

export default function InventoryImportPanel() {
  const router = useRouter();
  const [csv, setCsv] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onFile(file: File | undefined) {
    setPreview(null);
    setCsv(null);
    setMessage(null);
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setMessage("File is too large (1 MB max).");
      return;
    }
    try {
      const text = await file.text();
      setFileName(file.name);
      startTransition(async () => {
        const result = await previewStockImport(text);
        if ("error" in result) {
          setMessage(result.error);
          return;
        }
        setCsv(text);
        setPreview(result);
      });
    } catch (error) {
      console.error("Reading import file failed", error);
      setMessage("Could not read that file.");
    }
  }

  function onApply() {
    if (!csv) return;
    startTransition(async () => {
      const result = await applyStockImport(csv);
      if ("error" in result) {
        setMessage(result.error);
        return;
      }
      setPreview(null);
      setCsv(null);
      setMessage(`Imported. ${result.changed} product(s) adjusted.`);
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--line)] bg-white p-4 text-sm">
        <p className="font-semibold">Import stock from a CSV file</p>
        <p className="mt-1 text-[var(--muted)]">
          Download the template, fill in the <strong>On hand</strong> column with what you
          counted, then upload it here. An edited Export CSV, or your own file with an{" "}
          <strong>On hand</strong> column plus a <strong>Product ID</strong>,{" "}
          <strong>SKU</strong>, or <strong>Product</strong> name column, works too. Rows with a
          blank quantity are skipped. Nothing changes until you confirm.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <a
            href="/dashboard/inventory/template"
            download
            className="rounded-lg px-4 py-2 font-semibold text-[var(--ink)] outline outline-[var(--line)]"
          >
            Download template
          </a>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--field)] px-4 py-2 font-semibold text-[var(--ink-on-dark)]">
            {pending && !preview ? "Reading…" : "Choose CSV file"}
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              disabled={pending}
              onChange={(e) => {
                void onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {message ? <p className="text-sm font-semibold">{message}</p> : null}

      {preview ? (
        <>
          <p className="text-sm">
            <strong>{fileName}</strong>: {preview.changes} to update · {preview.unchanged} already
            correct · <span className={preview.issues ? "text-red-700" : undefined}>{preview.issues} skipped</span>
          </p>
          <InventoryImportPreview lines={preview.lines} />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onApply}
              disabled={pending || preview.changes === 0}
              className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
            >
              {pending ? "Importing…" : `Update ${preview.changes} product(s)`}
            </button>
            <button type="button" onClick={() => void onFile(undefined)} className="text-sm font-semibold text-[var(--muted)] underline">
              Cancel
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
