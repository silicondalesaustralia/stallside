import type { BlogResearchNotes, BlogTargetQuery } from "@/lib/blog/types";

export default function AdminBlogResearchPanel({
  summary,
  notes,
  queries,
}: {
  summary: string | null;
  notes: BlogResearchNotes;
  queries: BlogTargetQuery[];
}) {
  const empty = !summary && !notes.whyThisTopic && !queries.length && !notes.sources?.length;
  if (empty) return null;

  return (
    <section className="dash-card flex flex-col gap-3 p-4 text-sm">
      <h2 className="font-semibold text-[var(--field)]">Agent research</h2>
      {summary ? <p>{summary}</p> : null}
      {notes.whyThisTopic ? (
        <p>
          <span className="font-semibold">Why this topic: </span>
          {notes.whyThisTopic}
        </p>
      ) : null}
      {queries.length ? (
        <div>
          <p className="font-semibold">Target searches</p>
          <ul className="mt-1 flex flex-col gap-1">
            {queries.map((q) => (
              <li key={q.query} className="flex justify-between gap-2">
                <span>{q.query}</span>
                <span className="shrink-0 text-[var(--muted)]">
                  {q.position !== undefined ? `pos ${q.position.toFixed(1)}` : ""}
                  {q.impressions !== undefined ? ` · ${q.impressions} impr` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {notes.sources?.length ? (
        <div>
          <p className="font-semibold">Sources</p>
          <ul className="mt-1 list-disc pl-5">
            {notes.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {notes.factChecks?.length ? (
        <div>
          <p className="font-semibold">Fact checks done</p>
          <ul className="mt-1 list-disc pl-5">
            {notes.factChecks.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
