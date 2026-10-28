"use client";

import { ENTITY_LABELS, type ImportEntity } from "@/lib/data-import/fields";
import { PLATFORMS, presetsFor } from "@/lib/data-import/presets";

const OTHER = "Other";
const chip = "rounded-lg border px-3 py-1.5 text-sm font-medium";
const on = "border-[var(--leaf)] bg-[var(--paper)] text-[var(--field)]";
const off = "border-[var(--line)] text-[var(--muted)]";

export default function ImportSourceStep({
  platform,
  entity,
  busy,
  error,
  onPlatform,
  onEntity,
  onFile,
}: {
  platform: string;
  entity: ImportEntity;
  busy: boolean;
  error: string | null;
  onPlatform: (p: string) => void;
  onEntity: (e: ImportEntity) => void;
  onFile: (file: File) => void;
}) {
  const preset = presetsFor(platform, entity)[0];
  return (
    <section className="dash-card flex flex-col gap-4 p-4">
      <div>
        <h2 className="font-semibold text-[var(--field)]">1. Where is your data coming from?</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {[...PLATFORMS, OTHER].map((p) => (
            <button key={p} type="button" onClick={() => onPlatform(p)} className={`${chip} ${platform === p ? on : off}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-[var(--field)]">2. What are you importing?</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(ENTITY_LABELS) as ImportEntity[]).map((e) => (
            <button key={e} type="button" onClick={() => onEntity(e)} className={`${chip} ${entity === e ? on : off}`}>
              {ENTITY_LABELS[e]}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg bg-[var(--paper)] p-3 text-sm text-[var(--muted)]">
        {platform === OTHER
          ? "Export a CSV from your current system. You'll match its columns to Vendl's on the next step."
          : preset
            ? preset.howToExport
            : `${platform} doesn't have a standard ${ENTITY_LABELS[entity].toLowerCase()} export. Upload any CSV and match the columns yourself.`}
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-[var(--field)]">3. Upload the CSV file</span>
        <input
          type="file"
          accept=".csv,text/csv"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
          className="text-sm"
        />
      </label>
      {error ? <p className="text-sm text-[var(--gone)]">{error}</p> : null}
    </section>
  );
}
