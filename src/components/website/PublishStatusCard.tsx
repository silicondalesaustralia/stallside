/** Live / unpublished status with a single Publish or Unpublish button. */
export default function PublishStatusCard({
  live,
  liveNote,
  offNote,
  toggleAction,
}: {
  live: boolean;
  liveNote: string;
  offNote: string;
  /** Flips the current state. */
  toggleAction: () => void | Promise<void>;
}) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-white p-5">
      <div>
        <p className="flex items-center gap-2 font-semibold text-[var(--field)]">
          <span
            className={`size-2 rounded-full ${live ? "bg-[var(--ok)]" : "bg-[var(--muted)]"}`}
            aria-hidden
          />
          {live ? "Published" : "Unpublished"}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">{live ? liveNote : offNote}</p>
      </div>
      <form action={toggleAction}>
        <button
          type="submit"
          className={
            live
              ? "rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold"
              : "rounded-full bg-[var(--field)] px-4 py-2 text-sm font-semibold text-white"
          }
        >
          {live ? "Unpublish" : "Publish"}
        </button>
      </form>
    </section>
  );
}
