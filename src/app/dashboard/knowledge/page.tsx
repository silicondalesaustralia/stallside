import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { listCategories } from "@/lib/knowledge-base";

export default async function KnowledgeIndexPage() {
  await requireOwner();
  const categories = listCategories();

  return (
    <main className="flex flex-col gap-10">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Owner guides</h1>
        <p className="mt-2 text-[var(--muted)]">
          Short how-tos for every part of the dashboard. Videos will appear here as
          we film them — the steps work now.
        </p>
      </div>

      {categories.map((category) => (
        <section key={category.id} className="flex max-w-3xl flex-col gap-4">
          <h2 className="text-lg font-semibold">{category.title}</h2>
          <ul className="divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
            {category.articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/dashboard/knowledge/${article.slug}`}
                  className="flex flex-col gap-1 px-4 py-4 transition hover:bg-[var(--wash)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    <span className="font-medium text-[var(--ink)]">{article.title}</span>
                    <span className="mt-1 block text-sm text-[var(--muted)]">
                      {article.summary}
                    </span>
                  </span>
                  <span className="mt-2 shrink-0 text-xs font-medium text-[var(--muted)] sm:mt-0">
                    {article.comingSoon
                      ? "Coming soon"
                      : article.videoUrl
                        ? "Has video"
                        : "Video soon"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
