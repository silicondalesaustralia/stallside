import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { adminBlogPath } from "@/lib/blog/paths";
import { loadAiVisibility } from "@/lib/blog/ai-visibility-queries";
import AdminAiVisibilityTrend from "./AdminAiVisibilityTrend";
import AdminAiVisibilityDomains from "./AdminAiVisibilityDomains";
import AdminAiVisibilityQuestions from "./AdminAiVisibilityQuestions";

export default async function AdminAiVisibilityPage() {
  await requireAdmin();
  const { runs, latest, topDomains } = await loadAiVisibility();

  return (
    <main className="flex flex-col gap-6">
      <Link href={adminBlogPath()} className="text-sm font-semibold text-[var(--leaf-dark)] underline">
        ← Back to blog queue
      </Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">AI visibility</h1>
        <p className="mt-1 text-[var(--muted)]">
          Every Sunday the agent asks ChatGPT (with web search, Australian location) the same buyer questions and records whether Vendl
          is mentioned or cited, which competitors appear, and which pages are cited. It is a weekly sample: answers vary between runs
          and differ from what signed-in users see.
        </p>
      </div>
      {runs.length === 0 ? (
        <p className="dash-card p-4 text-sm text-[var(--muted)]">
          No runs yet. The first check runs on Sunday at 9pm, or run the &quot;Blog planner&quot; workflow manually with weekly research ticked.
        </p>
      ) : (
        <>
          <AdminAiVisibilityTrend runs={runs} />
          <AdminAiVisibilityDomains domains={topDomains} />
          <AdminAiVisibilityQuestions rows={latest} />
        </>
      )}
    </main>
  );
}
