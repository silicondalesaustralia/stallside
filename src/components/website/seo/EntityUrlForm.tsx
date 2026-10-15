import type { EntityUrl } from "@/lib/website/seo/entity-context-types";

/** Edits an item's address; the old address can keep working through a 301 redirect. */
export default function EntityUrlForm({
  action,
  url,
}: {
  action: (formData: FormData) => void | Promise<void>;
  url: EntityUrl;
}) {
  return (
    <form action={action} className="space-y-3 rounded-xl border border-[var(--line)] p-4">
      <label className="block text-sm">
        <span className="font-medium">URL</span>
        <span className="mt-1 flex items-center overflow-hidden rounded-lg border border-[var(--line)] bg-white">
          <span className="shrink-0 bg-[var(--panel)] px-3 py-2 text-[var(--muted)]">{url.prefix}</span>
          <input
            name="slug"
            defaultValue={url.slug}
            required
            maxLength={64}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase letters, numbers and dashes only"
            className="min-w-0 flex-1 px-3 py-2"
          />
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="redirectOld" defaultChecked className="mt-0.5" />
        <span>
          Redirect the old address to the new one
          <span className="block text-xs text-[var(--muted)]">
            Keeps links, Google results and printed QR codes working (301 redirect).
          </span>
        </span>
      </label>
      <button
        type="submit"
        className="rounded-full border border-[var(--field)] px-4 py-2 text-sm font-semibold text-[var(--field)]"
      >
        Change URL
      </button>
    </form>
  );
}
