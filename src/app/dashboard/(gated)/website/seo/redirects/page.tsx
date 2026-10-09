import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { extractStorefrontRedirects } from "@/lib/studio/redirects";
import {
  addStorefrontRedirect,
  deleteStorefrontRedirect,
  publishStorefrontRedirects,
  toggleStorefrontRedirect,
} from "./actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm";

export default async function WebsiteSeoRedirectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    published?: string;
    error?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const redirects = extractStorefrontRedirects(storefront.draftConfig);
  const published = extractStorefrontRedirects(storefront.publishedConfig);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 pb-12">
      <div>
        <p className="text-sm">
          <Link
            href="/dashboard/website/seo"
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            ← Search & social
          </Link>
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          URL redirects
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Send old storefront paths to a new page after you change a slug. Paths
          are relative to your shop (e.g. <code>/products/old-name</code>).
          Publish redirects for them to take effect on the live site.
        </p>
      </div>

      {sp.saved ? (
        <p className="text-sm font-medium text-[var(--ok)]">Redirect saved.</p>
      ) : null}
      {sp.deleted ? (
        <p className="text-sm font-medium text-[var(--ok)]">Redirect deleted.</p>
      ) : null}
      {sp.published ? (
        <p className="text-sm font-medium text-[var(--ok)]">
          Redirects published to the live site.
        </p>
      ) : null}
      {sp.error === "invalid" ? (
        <p className="text-sm font-medium text-[var(--gone)]">
          Check both paths — use storefront paths like /products/slug, or a full
          https URL for the destination.
        </p>
      ) : null}
      {sp.error === "duplicate" ? (
        <p className="text-sm font-medium text-[var(--gone)]">
          A redirect already exists for that from path.
        </p>
      ) : null}

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <h2 className="font-semibold text-[var(--field)]">Add redirect</h2>
        <form action={addStorefrontRedirect} className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="font-medium">From path</span>
            <input
              name="fromPath"
              required
              placeholder="/products/old-slug"
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">To path or URL</span>
            <input
              name="toPath"
              required
              placeholder="/products/new-slug"
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Type</span>
            <select name="code" defaultValue="301" className={inputClass}>
              <option value="301">Permanent (301)</option>
              <option value="302">Temporary (302)</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Add redirect
          </button>
        </form>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-[var(--field)]">
            Draft redirects ({redirects.length})
          </h2>
          <form action={publishStorefrontRedirects}>
            <button
              type="submit"
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold"
            >
              Publish redirects
            </button>
          </form>
        </div>
        {redirects.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">No redirects yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            {redirects.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm text-[var(--field)]">
                    {r.fromPath} → {r.toPath}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {r.code} · {r.enabled ? "Enabled" : "Disabled"}
                    {published.some(
                      (p) =>
                        p.fromPath === r.fromPath &&
                        p.toPath === r.toPath &&
                        p.enabled === r.enabled &&
                        p.code === r.code,
                    )
                      ? " · Live"
                      : " · Draft only"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={toggleStorefrontRedirect}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold"
                    >
                      {r.enabled ? "Disable" : "Enable"}
                    </button>
                  </form>
                  <form action={deleteStorefrontRedirect}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--gone)]"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
