"use client";

import { useMemo, useState } from "react";
import { buildImport } from "@/lib/data-import/build-rows";
import { toRecords } from "@/lib/data-import/detect";
import type { ImportEntity } from "@/lib/data-import/fields";
import { loadImportFile, type LoadedFile } from "@/lib/data-import/read-file";
import { runImport, type ImportTotals } from "@/lib/data-import/run-import";
import { saveMapping } from "@/lib/data-import/saved-mappings";
import type { ColumnMapping } from "@/lib/data-import/types";
import ColumnMappingStep from "./ColumnMappingStep";
import ImportResultStep from "./ImportResultStep";
import ImportReviewStep from "./ImportReviewStep";
import ImportSourceStep from "./ImportSourceStep";

type Step = "source" | "map" | "review" | "done";

export default function ImportWizard() {
  const [step, setStep] = useState<Step>("source");
  const [platform, setPlatform] = useState("Shopify");
  const [entity, setEntity] = useState<ImportEntity>("products");
  const [file, setFile] = useState<LoadedFile | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [progress, setProgress] = useState<number | null>(null);
  const [totals, setTotals] = useState<ImportTotals | null>(null);

  const built = useMemo(
    () => (file && step !== "source" ? buildImport(file.entity, toRecords(file.rows, mapping), file.preset) : null),
    [file, mapping, step],
  );

  async function onFile(picked: File) {
    setError(null);
    setBusy(true);
    try {
      const loaded = await loadImportFile(picked, entity);
      if ("error" in loaded) {
        setError(loaded.error);
        return;
      }
      setFile(loaded);
      setMapping(loaded.mapping);
      setStep("map");
    } catch (err) {
      console.error("Import file read failed", err);
      setError("Could not read that file. Save it as CSV (UTF-8) and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onRun() {
    if (!built || !file) return;
    setProgress(0);
    try {
      const source = file.preset?.platform ?? (platform === "Other" ? "CSV" : platform);
      setTotals(await runImport(built, { source, updateExisting, onProgress: setProgress }));
      setStep("done");
    } catch (err) {
      console.error("Import failed", err);
      setError("The import stopped early. Re-run it to finish; rows already imported are matched, not duplicated.");
      setStep("source");
    } finally {
      setProgress(null);
    }
  }

  function reset() {
    setFile(null);
    setTotals(null);
    setStep("source");
  }

  if (step === "map" && file) {
    return (
      <ColumnMappingStep
        file={file}
        mapping={mapping}
        onChange={setMapping}
        onBack={reset}
        onNext={() => {
          if (!file.preset) saveMapping(file.entity, file.headers, mapping);
          setStep("review");
        }}
      />
    );
  }
  if (step === "review" && built) {
    return (
      <ImportReviewStep
        built={built}
        updateExisting={updateExisting}
        progress={progress}
        onUpdateExisting={setUpdateExisting}
        onBack={() => setStep("map")}
        onRun={onRun}
      />
    );
  }
  if (step === "done" && totals && file) {
    return <ImportResultStep entity={file.entity} totals={totals} onAgain={reset} />;
  }
  return (
    <ImportSourceStep
      platform={platform}
      entity={entity}
      busy={busy}
      error={error}
      onPlatform={setPlatform}
      onEntity={setEntity}
      onFile={onFile}
    />
  );
}
