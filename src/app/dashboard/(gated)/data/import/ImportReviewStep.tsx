"use client";

import type { BuiltImport } from "@/lib/data-import/build-rows";
import ImportIssueList from "./ImportIssueList";

function summary(built: BuiltImport): string {
  if (built.entity === "customers") return `${built.items.length} customers with an email address.`;
  if (built.entity === "inventory") return `${built.items.length} stock counts.`;
  const withVariants = built.items.filter((p) => p.variants.length > 0);
  const variantCount = withVariants.reduce((s, p) => s + p.variants.length, 0);
  return `${built.items.length} products${
    withVariants.length ? `, ${withVariants.length} with variants (${variantCount} variants in total)` : ""
  }.`;
}

export default function ImportReviewStep({
  built,
  updateExisting,
  progress,
  onUpdateExisting,
  onBack,
  onRun,
}: {
  built: BuiltImport;
  updateExisting: boolean;
  progress: number | null;
  onUpdateExisting: (v: boolean) => void;
  onBack: () => void;
  onRun: () => void;
}) {
  const running = progress !== null;
  return (
    <section className="dash-card flex flex-col gap-4 p-4">
      <div>
        <h2 className="font-semibold text-[var(--field)]">Ready to import</h2>
        <p className="mt-0.5 text-sm text-[var(--muted)]">{summary(built)}</p>
      </div>
      {built.entity === "products" ? (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={updateExisting}
            disabled={running}
            onChange={(e) => onUpdateExisting(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Update products I already have (matched by SKU, then by name). Untick to only add new
            products.
          </span>
        </label>
      ) : null}
      {built.entity === "customers" ? (
        <p className="text-sm text-[var(--muted)]">
          Only customers marked as subscribed in your old system are added to email marketing.
          Existing customers keep their details; blanks are filled in.
        </p>
      ) : null}
      <ImportIssueList issues={built.issues} />
      {running ? (
        <div className="h-2 overflow-hidden rounded-full bg-[var(--paper)]">
          <div className="h-full bg-[var(--leaf)]" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      ) : null}
      <div className="flex gap-2">
        <button type="button" disabled={running} onClick={onBack} className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm">
          Back
        </button>
        <button
          type="button"
          disabled={running || built.items.length === 0}
          onClick={onRun}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {running ? `Importing… ${Math.round((progress ?? 0) * 100)}%` : `Import ${built.items.length}`}
        </button>
      </div>
    </section>
  );
}
