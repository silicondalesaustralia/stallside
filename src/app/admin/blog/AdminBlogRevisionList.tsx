import Link from "next/link";
import type { AdminBlogRevisionRow } from "@/lib/blog/admin-queries";
import { countDiffChanges, diffHtmlBlocks } from "@/lib/blog/html-diff";
import { adminBlogRevisionPath, blogSectionLabel } from "@/lib/blog/paths";
import { parseChangeNotes } from "@/lib/blog/types";

export default function AdminBlogRevisionList({ revisions }: { revisions: AdminBlogRevisionRow[] }) {
  if (revisions.length === 0) {
    return <p className="dash-card p-5 text-[var(--muted)]">No updates waiting for review.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {revisions.map((revision) => {
        const { added, removed } = countDiffChanges(
          diffHtmlBlocks(revision.baseBodyHtml, revision.proposedBodyHtml),
        );
        const notes = parseChangeNotes(revision.changeNotes);
        return (
          <li key={revision.id} className="dash-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Update · {blogSectionLabel(revision.post.section)}
            </p>
            <Link
              href={adminBlogRevisionPath(revision.id)}
              className="mt-1 block text-lg font-semibold text-[var(--field)] hover:underline"
            >
              {revision.post.title}
            </Link>
            <p className="mt-1 text-sm">
              <span className="font-semibold text-green-800">+{added} blocks</span>
              {" · "}
              <span className="font-semibold text-red-800">−{removed} blocks</span>
            </p>
            {notes.length ? (
              <ul className="mt-2 list-disc pl-5 text-sm text-[var(--ink)]">
                {notes.slice(0, 3).map((note) => (
                  <li key={note.section}>
                    <span className="font-semibold">{note.section}:</span> {note.reason}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
