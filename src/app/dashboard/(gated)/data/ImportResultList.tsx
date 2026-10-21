import type { ApplyState } from "./import-types";

export default function ImportResultList({ state }: { state: ApplyState }) {
  if (!state.ok) return <p className="text-sm text-red-700">{state.error}</p>;
  return (
    <div className="flex flex-col gap-2 text-sm">
      {state.results.map((r) => (
        <div key={r.fileName}>
          <p className="font-medium text-green-800">
            {r.fileName}: {r.created} added, {r.updated} updated
          </p>
          {r.warnings.length ? (
            <ul className="list-disc pl-5 text-amber-800">
              {r.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
      {state.stoppedAt ? (
        <p className="font-medium text-red-700">
          Stopped at {state.stoppedAt}. Files listed above were saved; fix this one and import it again.
        </p>
      ) : null}
    </div>
  );
}
