import type { AdminBlogTopicRow } from "@/lib/blog/admin-queries";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { createManualTopicAction } from "./topic-actions";
import AdminBlogTopicActions from "./AdminBlogTopicActions";

const fieldClass =
  "rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--leaf)] focus:ring-2";

export default function AdminBlogTopicList({ topics }: { topics: AdminBlogTopicRow[] }) {
  return (
    <div className="flex flex-col gap-4">
      <form action={createManualTopicAction} className="dash-card flex flex-col gap-3 p-4 md:flex-row md:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">Suggest a topic</span>
          <input name="title" required minLength={5} placeholder="How to sell sourdough online" className={fieldClass} />
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">Angle (optional)</span>
          <input name="angle" placeholder="Compare pre-orders vs walk-up sales" className={fieldClass} />
        </label>
        <select name="section" defaultValue="GUIDE" className={fieldClass} aria-label="Section">
          <option value="GUIDE">Guide</option>
          <option value="NEWS">News</option>
        </select>
        <button type="submit" className={dashCtaClass}>Add topic</button>
      </form>

      {topics.length === 0 ? (
        <p className="dash-card p-5 text-[var(--muted)]">The backlog is empty.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {topics.map((topic) => (
            <li key={topic.id} className="dash-card flex flex-wrap items-start justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  {topic.recommendationRank && topic.recommendedAt
                    ? `#${topic.recommendationRank} in ${topic.recommendedAt.toLocaleDateString("en-AU")} email · `
                    : ""}
                  {topic.targetPostSlug ? `update /${topic.targetPostSlug} · ` : ""}
                  {topic.source.replace("_", " ")} · score {topic.score}
                  {topic.status === "WAITING_FOR_RELEASE" ? " · waiting for feature release" : ""}
                  {topic.expiresAt ? ` · expires ${topic.expiresAt.toLocaleDateString("en-AU")}` : ""}
                </p>
                <p className="mt-1 font-semibold text-[var(--field)]">{topic.title}</p>
                {topic.angle ? <p className="mt-1 text-sm text-[var(--ink)]">{topic.angle}</p> : null}
                {topic.writeError ? (
                  <p className="mt-1 text-sm text-red-700">Last write attempt failed: {topic.writeError}</p>
                ) : null}
              </div>
              <AdminBlogTopicActions topic={topic} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
