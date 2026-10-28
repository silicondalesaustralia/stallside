"use client";

import { FIELDS_BY_ENTITY } from "@/lib/data-import/fields";
import { missingRequired } from "@/lib/data-import/detect";
import type { LoadedFile } from "@/lib/data-import/read-file";
import type { ColumnMapping } from "@/lib/data-import/types";

export default function ColumnMappingStep({
  file,
  mapping,
  onChange,
  onBack,
  onNext,
}: {
  file: LoadedFile;
  mapping: ColumnMapping;
  onChange: (mapping: ColumnMapping) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const sample = file.rows[0] ?? [];
  const missing = missingRequired(file.entity, mapping);
  return (
    <section className="dash-card flex flex-col gap-4 p-4">
      <div>
        <h2 className="font-semibold text-[var(--field)]">Match your columns</h2>
        <p className="mt-0.5 text-sm text-[var(--muted)]">
          {file.preset
            ? `Recognised a ${file.preset.platform} export, so the columns are already matched. Check them and change any that look wrong.`
            : "Pick which column in your file holds each piece of information. Leave a field as “Not in my file” to skip it. We'll remember this for next time."}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)]">
              <th className="py-2 pr-3 font-medium">Vendl field</th>
              <th className="py-2 pr-3 font-medium">Column in your file</th>
              <th className="py-2 font-medium">First row</th>
            </tr>
          </thead>
          <tbody>
            {FIELDS_BY_ENTITY[file.entity].map((field) => {
              const idx = mapping[field.key] ?? -1;
              return (
                <tr key={field.key} className="border-t border-[var(--line)]">
                  <td className="py-2 pr-3 font-medium">
                    {field.label}
                    {field.required ? <span className="text-[var(--gone)]"> *</span> : null}
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      value={idx}
                      onChange={(e) => onChange({ ...mapping, [field.key]: Number(e.target.value) })}
                      className="w-full rounded-lg border border-[var(--line)] bg-white px-2 py-1.5"
                    >
                      <option value={-1}>Not in my file</option>
                      {file.headers.map((h, i) => (
                        <option key={`${h}-${i}`} value={i}>
                          {h || `Column ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="max-w-[14rem] truncate py-2 text-[var(--muted)]">
                    {idx >= 0 ? (sample[idx] ?? "") : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {missing.length ? (
        <p className="text-sm text-[var(--gone)]">Still needed: {missing.join(", ")}.</p>
      ) : null}
      <div className="flex gap-2">
        <button type="button" onClick={onBack} className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm">
          Back
        </button>
        <button
          type="button"
          disabled={missing.length > 0}
          onClick={onNext}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Review import
        </button>
      </div>
    </section>
  );
}
