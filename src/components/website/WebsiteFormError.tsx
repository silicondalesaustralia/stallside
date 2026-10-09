import { DRAFT_CONFLICT_MESSAGE } from "@/lib/website/persistence/messages";

const KNOWN_ERRORS: Record<string, string> = {
  conflict: DRAFT_CONFLICT_MESSAGE,
  publish_blocked:
    "Can't publish yet: some sections still show placeholder instructions. Replace them, then publish your website.",
  not_published: "Publish your website first. After that, this can go live on its own.",
};

/** Website section error line; shared codes get specific copy, anything else the page's fallback. */
export default function WebsiteFormError({
  error,
  fallback,
}: {
  error?: string;
  fallback: string;
}) {
  if (!error) return null;
  return (
    <p role="alert" className="text-sm font-medium text-[var(--gone)]">
      {KNOWN_ERRORS[error] ?? fallback}
    </p>
  );
}
