import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { KnowledgeArticle } from "@/lib/knowledge-base";

type GuidePagerProps = {
  previous: KnowledgeArticle | null;
  next: KnowledgeArticle | null;
};

export default function GuidePager({ previous, next }: GuidePagerProps) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="More in this section" className="grid gap-3 sm:grid-cols-2">
      {previous ? (
        <Link
          href={`/dashboard/knowledge/${previous.slug}`}
          className="flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 hover:border-[var(--leaf)]"
        >
          <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <ArrowLeft aria-hidden className="size-3.5" /> Previous
          </span>
          <span className="mt-1 font-medium text-[var(--ink)]">{previous.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={`/dashboard/knowledge/${next.slug}`}
          className="flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-right hover:border-[var(--leaf)]"
        >
          <span className="flex items-center justify-end gap-1 text-xs text-[var(--muted)]">
            Next <ArrowRight aria-hidden className="size-3.5" />
          </span>
          <span className="mt-1 font-medium text-[var(--ink)]">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
