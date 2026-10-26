"use client";

import type { ReviewLine } from "@/lib/production/invoice-scan/schema";
import { isUnit, unitLabel } from "@/lib/production/unit-convert";
import { tdClass } from "../../form-styles";
import { lineProblem, unitOptions, type ScanMaterial } from "./review-helpers";

const cellInput = "w-full rounded-md border border-[var(--line)] bg-white px-2 py-1 text-sm";

export default function InvoiceLineRow({
  line,
  materials,
  onChange,
}: {
  line: ReviewLine;
  materials: ScanMaterial[];
  onChange: (patch: Partial<ReviewLine>) => void;
}) {
  const problem = lineProblem(line, materials);
  const units = unitOptions(line, materials);
  const muted = line.include ? "" : "opacity-50";

  return (
    <tr className={muted}>
      <td className={tdClass}>
        <input
          type="checkbox"
          aria-label={`Include ${line.description}`}
          checked={line.include}
          onChange={(e) => onChange({ include: e.target.checked })}
        />
      </td>
      <td className={`${tdClass} min-w-[12rem]`}>
        <input className={cellInput} value={line.description} onChange={(e) => onChange({ description: e.target.value })} />
        {line.confidence === "low" ? <p className="mt-1 text-xs text-amber-700">Hard to read — please check</p> : null}
      </td>
      <td className={`${tdClass} min-w-[11rem]`}>
        <select className={cellInput} value={line.materialId} onChange={(e) => onChange({ materialId: e.target.value })}>
          <option value="">Choose…</option>
          <option value="new">+ New material</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        {problem ? <p className="mt-1 text-xs font-semibold text-red-700">{problem}</p> : null}
      </td>
      <td className={tdClass}>
        <div className="flex gap-1">
          <input
            className={`${cellInput} w-20 text-right`}
            type="number"
            min="0"
            step="any"
            defaultValue={line.quantity}
            onChange={(e) => onChange({ quantity: Number(e.target.value) })}
          />
          <select
            className={`${cellInput} w-20`}
            value={line.unit}
            onChange={(e) => {
              if (isUnit(e.target.value)) onChange({ unit: e.target.value });
            }}
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {unitLabel(u)}
              </option>
            ))}
            {units.includes(line.unit) ? null : <option value={line.unit}>{unitLabel(line.unit)}</option>}
          </select>
        </div>
      </td>
      <td className={tdClass}>
        <input
          className={`${cellInput} w-24 text-right`}
          type="number"
          min="0"
          step="0.01"
          defaultValue={(line.totalCents / 100).toFixed(2)}
          onChange={(e) => onChange({ totalCents: Math.max(0, Math.round(Number(e.target.value) * 100)) })}
        />
      </td>
    </tr>
  );
}
