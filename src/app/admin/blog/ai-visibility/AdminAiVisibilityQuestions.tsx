import type { AiVisibilityQuestionRow } from "@/lib/blog/ai-visibility-queries";

function Badge({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${on ? "bg-[var(--leaf)] text-white" : "bg-[var(--panel)] text-[var(--muted)]"}`}>
      {on ? label : `Not ${label.toLowerCase()}`}
    </span>
  );
}

function change(row: AiVisibilityQuestionRow): string | null {
  if (row.previouslyMentioned === null || row.previouslyMentioned === row.vendlMentioned) return null;
  return row.vendlMentioned ? "New mention since last run" : "Mention lost since last run";
}

export default function AdminAiVisibilityQuestions({ rows }: { rows: AiVisibilityQuestionRow[] }) {
  return (
    <section className="dash-card divide-y divide-[var(--line)]">
      <h2 className="p-4 text-lg font-semibold">Questions (latest run)</h2>
      {rows.map((row) => (
        <details key={row.id} className="group p-4">
          <summary className="flex cursor-pointer flex-wrap items-center gap-2">
            <span className="mr-auto font-medium">{row.question}</span>
            <Badge on={row.vendlMentioned} label="Mentioned" />
            <Badge on={row.vendlCited} label="Cited" />
          </summary>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {change(row) ? <p className="font-semibold text-[var(--leaf-dark)]">{change(row)}</p> : null}
            <p className="text-[var(--muted)]">
              Competitors mentioned: {row.competitorsMentioned.length ? row.competitorsMentioned.join(", ") : "none"}
            </p>
            {row.citations.length ? (
              <ul className="list-disc pl-5">
                {row.citations.slice(0, 8).map((citation) => (
                  <li key={citation.url}>
                    <a href={citation.url} target="_blank" rel="noreferrer" className="underline">
                      {citation.title || citation.domain}
                    </a>{" "}
                    <span className="text-[var(--muted)]">{citation.domain}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--muted)]">No citations.</p>
            )}
            <p className="whitespace-pre-line rounded-lg bg-[var(--panel)] p-3">{row.answerExcerpt}</p>
          </div>
        </details>
      ))}
    </section>
  );
}
