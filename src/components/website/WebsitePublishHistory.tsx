import { restorePublicationAction } from "@/app/dashboard/(gated)/website/publications/actions";

type Props = {
  activePublicationId: string | null;
  publications: { id: string; createdAt: Date }[];
};

const dateFormat = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function WebsitePublishHistory({ activePublicationId, publications }: Props) {
  if (publications.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <h2 className="text-base font-semibold text-[var(--field)]">Publish history</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Restoring copies a past version into your draft. Your live site doesn&apos;t change until you publish.
      </p>
      <ul className="mt-4 divide-y divide-[var(--line)]">
        {publications.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span>
              {dateFormat.format(p.createdAt)}
              {p.id === activePublicationId ? (
                <span className="ml-2 rounded-full bg-[var(--wash)] px-2 py-0.5 text-xs font-semibold text-[var(--field)]">
                  Live
                </span>
              ) : null}
            </span>
            <form action={restorePublicationAction}>
              <input type="hidden" name="publicationId" value={p.id} />
              <button
                type="submit"
                className="rounded-lg border border-[var(--line)] px-3 py-1 text-xs font-semibold"
              >
                Restore as draft
              </button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
