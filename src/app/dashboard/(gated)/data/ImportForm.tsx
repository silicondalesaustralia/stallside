"use client";

import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { applyImport, previewImport } from "./actions";
import type { ApplyState, PreviewState } from "./import-types";
import ImportPreviewList from "./ImportPreviewList";
import ImportResultList from "./ImportResultList";

export default function ImportForm({ section }: { section: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [result, setResult] = useState<ApplyState | null>(null);
  const [pending, startTransition] = useTransition();

  function payload(): FormData {
    const data = new FormData();
    if (file) data.set("file", file);
    data.set("section", section);
    return data;
  }

  function run(step: "preview" | "apply") {
    startTransition(async () => {
      try {
        if (step === "preview") {
          setResult(null);
          setPreview(await previewImport(null, payload()));
        } else {
          setResult(await applyImport(null, payload()));
          setPreview(null);
        }
      } catch (error) {
        console.error("Import request failed", error);
        const failed = { ok: false as const, error: "Upload failed. Check your connection and try again." };
        if (step === "preview") setPreview(failed);
        else setResult(failed);
      }
    });
  }

  const hasErrors = preview?.ok && preview.sections.some((s) => (s.preview?.errors.length ?? 0) > 0);
  const accept = section === "all" ? ".zip,.csv" : ".csv,.zip";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-[var(--line)] p-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Import {section === "all" ? "a ZIP export" : "a CSV"}</span>
        <input
          type="file"
          accept={accept}
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setPreview(null);
            setResult(null);
          }}
          className="text-sm"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!file || pending} onClick={() => run("preview")} className={dashCtaClass}>
          {pending && !preview ? "Checking…" : "Check file"}
        </button>
        {preview?.ok && !hasErrors ? (
          <button type="button" disabled={pending} onClick={() => run("apply")} className={dashCtaClass}>
            {pending ? "Importing…" : "Import now"}
          </button>
        ) : null}
      </div>
      {preview ? <ImportPreviewList state={preview} /> : null}
      {result ? <ImportResultList state={result} /> : null}
    </div>
  );
}
