import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { loadEmailRecipients } from "@/lib/email-stats/load-email-recipients";
import { kindLabel } from "@/lib/email-stats/format";
import EmailRecipientTable from "./EmailRecipientTable";

export default async function AdminEmailKindPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  await requireAdmin();
  const kind = decodeURIComponent((await params).kind);
  const rows = await loadEmailRecipients(kind);
  const latestSubject = rows[0]?.subject;

  return (
    <main className="flex flex-col gap-6">
      <div>
        <Link href="/admin/emails" className="text-sm text-[var(--leaf-dark)] underline">
          All emails
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{kindLabel(kind)}</h1>
        {latestSubject ? (
          <p className="mt-1 text-[var(--muted)]">{latestSubject}</p>
        ) : null}
        <p className="mt-1 text-sm text-[var(--muted)]">
          {rows.length.toLocaleString()} most recent sends, newest first.
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No sends recorded for this email.</p>
      ) : (
        <EmailRecipientTable rows={rows} />
      )}
    </main>
  );
}
