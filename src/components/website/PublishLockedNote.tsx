import Link from "next/link";

type Props = { createHref: string; editorHref: string };

/** Shown instead of "Publish site" until there's a site to publish. */
export default function PublishLockedNote({ createHref, editorHref }: Props) {
  return (
    <div className="max-w-sm space-y-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm">
      <button
        type="button"
        disabled
        className="cursor-not-allowed rounded-full bg-[var(--line)] px-4 py-2 font-semibold text-[var(--muted)]"
      >
        Publish site
      </button>
      <p className="text-xs text-[var(--muted)]">
        You can publish once your website is created.{" "}
        <Link href={createHref} className="font-medium text-[var(--field)] underline">
          Create it with AI
        </Link>{" "}
        or{" "}
        <Link href={editorHref} className="font-medium text-[var(--field)] underline">
          build it in the editor
        </Link>{" "}
        and publish from there.
      </p>
    </div>
  );
}
