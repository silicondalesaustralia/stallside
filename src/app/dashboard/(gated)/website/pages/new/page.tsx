import { CUSTOM_PAGE_TEMPLATES } from "@/lib/studio/custom-pages";
import { createCustomPage } from "../actions";

const SEEDED_TEMPLATES = new Set([
  "about",
  "contact",
  "privacy",
  "terms",
  "returns",
  "shipping-pickup",
  "blog-index",
]);

export default async function NewWebsitePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 pb-12">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          Add a page
        </h1>
        <p className="mt-2 text-[var(--muted)]">Choose a starting template, then customise with sections.</p>
      </div>

      {params.error ? (
        <p className="text-sm font-medium text-[var(--gone)]">
          Check the page title and URL slug — slugs must be lowercase letters, numbers and hyphens.
        </p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2">
        {CUSTOM_PAGE_TEMPLATES.filter((t) => !SEEDED_TEMPLATES.has(t.id)).map((tpl) => (
          <li key={tpl.id} className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <h2 className="font-semibold text-[var(--field)]">{tpl.label}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{tpl.description}</p>
            <form action={createCustomPage} className="mt-4 space-y-3">
              <input type="hidden" name="template" value={tpl.id} />
              <label className="block text-sm">
                <span className="font-medium">Page title</span>
                <input
                  name="title"
                  required
                  defaultValue={tpl.label}
                  className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">URL slug</span>
                <input
                  name="slug"
                  placeholder="e.g. wholesale"
                  className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2"
                />
              </label>
              <button type="submit" className="rounded-full bg-[var(--field)] px-4 py-2 text-sm font-semibold text-white">
                Create page
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
