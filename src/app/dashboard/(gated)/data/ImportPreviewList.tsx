import type { PreviewState } from "./import-types";

const MAX_ERRORS = 20;

function names(list: string[]): string {
  const shown = list.slice(0, 5).join(", ");
  return list.length > 5 ? `${shown} and ${list.length - 5} more` : shown;
}

export default function ImportPreviewList({ state }: { state: PreviewState }) {
  if (!state.ok) return <p className="text-sm text-red-700">{state.error}</p>;
  return (
    <div className="flex flex-col gap-3 text-sm">
      {state.sections.map((s) => (
        <div key={s.fileName}>
          <p className="font-medium text-[var(--field)]">
            {s.fileName} · {s.rowCount} rows
          </p>
          {s.preview === null ? (
            <p className="text-[var(--muted)]">Checked during import, after the new products are added.</p>
          ) : (
            <>
              {s.preview.creates.length ? (
                <p className="text-[var(--muted)]">
                  New ({s.preview.creates.length}): {names(s.preview.creates)}
                </p>
              ) : null}
              {s.preview.updates.length ? (
                <p className="text-[var(--muted)]">
                  Update ({s.preview.updates.length}): {names(s.preview.updates)}
                </p>
              ) : null}
              {s.preview.errors.length ? (
                <ul className="mt-1 list-disc pl-5 text-red-700">
                  {s.preview.errors.slice(0, MAX_ERRORS).map((e) => (
                    <li key={`${e.line}-${e.message}`}>
                      Row {e.line}: {e.message}
                    </li>
                  ))}
                  {s.preview.errors.length > MAX_ERRORS ? (
                    <li>…and {s.preview.errors.length - MAX_ERRORS} more problems</li>
                  ) : null}
                </ul>
              ) : null}
            </>
          )}
        </div>
      ))}
      {state.skipped.length ? (
        <p className="text-[var(--muted)]">Not imported: {state.skipped.join(", ")}</p>
      ) : null}
      {state.sections.some((s) => s.preview?.errors.length) ? (
        <p className="font-medium text-red-700">Fix the rows above in your spreadsheet, then check the file again.</p>
      ) : null}
    </div>
  );
}
