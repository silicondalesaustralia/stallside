import Link from "next/link";
import { COMMERCE_PAGES } from "@/lib/studio/commerce-pages";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { extractWebsiteStudio, studioPageNodes } from "@/lib/studio/storage";

export default async function WebsiteCommerceHubPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const studio = extractWebsiteStudio(storefront.draftConfig);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 pb-12">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          Shop layouts
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Shared Craft layouts for Shop, Category, Product and Menu pages. Every
          product and category uses the same template.
        </p>
      </div>

      {sp.error ? (
        <p className="text-sm font-medium text-[var(--gone)]">Could not open that layout.</p>
      ) : null}

      <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
        {COMMERCE_PAGES.map((page) => {
          const nodes = studio ? studioPageNodes(studio, page.key) : undefined;
          return (
            <li key={page.kind} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-[var(--field)]">{page.label}</p>
                <p className="text-sm text-[var(--muted)]">{page.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]">
                  {nodes ? "Custom layout" : "Default"}
                </span>
                <Link
                  href={`/dashboard/website/commerce/${page.kind}`}
                  className="rounded-full bg-[var(--field)] px-3 py-1.5 text-sm font-semibold text-white"
                >
                  Edit
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
