"use client";

import { useState, useTransition } from "react";
import {
  importFromSquareAction,
  loadSquareImportCandidates,
  type SquareImportRow,
} from "./import-actions";
import { useActionStatus } from "./use-action-status";
import ActionStatusText from "./ActionStatusText";
import SquareImportList from "./SquareImportList";

export default function SquareImportPanel({
  stands,
  defaultStandId,
  currency,
}: {
  stands: Array<{ id: string; name: string }>;
  defaultStandId: string | null;
  currency: string;
}) {
  const [pending, start] = useTransition();
  const [rows, setRows] = useState<SquareImportRow[] | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [standId, setStandId] = useState(defaultStandId ?? stands[0]?.id ?? "");
  const { status, report, fail, clear } = useActionStatus();

  function load() {
    clear();
    start(async () => {
      try {
        const res = await loadSquareImportCandidates();
        if ("error" in res) return report(res, "");
        setRows(res.rows);
        setSelected(new Set(res.rows.map((r) => r.variationId)));
        const extra = [
          res.linked ? `${res.linked} already linked` : "",
          res.matchesExisting
            ? `${res.matchesExisting} match existing Vendl products (use Review matches)`
            : "",
        ].filter(Boolean);
        setSummary(
          `${res.rows.length} new Square item${res.rows.length === 1 ? "" : "s"}` +
            (extra.length ? ` · ${extra.join(" · ")}` : ""),
        );
      } catch (error) {
        fail(error);
      }
    });
  }

  function runImport() {
    const ids = [...selected];
    start(async () => {
      try {
        const res = await importFromSquareAction(standId, ids);
        report(res, "ok" in res ? res.message : "");
        if ("ok" in res) {
          setRows((prev) => prev?.filter((r) => !selected.has(r.variationId)) ?? null);
          setSelected(new Set());
        }
      } catch (error) {
        fail(error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-[var(--muted)]">
        Create Vendl products from your Square catalogue, with price, SKU, photo, and
        stock at your primary location. They stay linked so stock syncs both ways.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={load}
        className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold hover:bg-[var(--wash)] disabled:opacity-60"
      >
        {pending && !rows ? "Loading Square items…" : rows ? "Reload Square items" : "Load Square items"}
      </button>
      {summary ? <p className="text-[var(--muted)]">{summary}</p> : null}
      {rows && rows.length > 0 ? (
        <>
          <SquareImportList
            rows={rows}
            selected={selected}
            onChange={setSelected}
            currency={currency}
          />
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs">
              Import into
              <select
                value={standId}
                onChange={(e) => setStandId(e.target.value)}
                className="rounded-lg border border-[var(--line)] bg-white px-2 py-1.5 text-sm"
              >
                {stands.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={pending || selected.size === 0 || !standId}
              onClick={runImport}
              className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending
                ? "Importing…"
                : `Import ${selected.size} item${selected.size === 1 ? "" : "s"} into Vendl`}
            </button>
          </div>
        </>
      ) : null}
      <ActionStatusText status={status} />
    </div>
  );
}
