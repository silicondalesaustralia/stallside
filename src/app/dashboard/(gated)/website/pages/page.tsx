import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { ensureCustomPages, type StorefrontCustomPage } from "@/lib/studio/custom-pages";
import { customPagePublicPath } from "@/lib/studio/custom-page-paths";
import { appBaseUrl } from "@/lib/app-url";
import { syncBuiltinCustomPages } from "./actions";

function PageRow({
  page,
  preview,
}: {
  page: StorefrontCustomPage;
  preview: string;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <p className="font-semibold text-[var(--field)]">{page.title}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          /{page.routeKind === "builtin" ? page.slug : `pages/${page.slug}`}
          {page.routeKind === "builtin" ? " · Built-in" : ""}
          {!page.enabled ? " · Hidden" : ""}
          {page.showInFooter && !page.showInNav ? " · Footer" : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={preview}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm font-semibold"
        >
          Preview
        </a>
        <Link
          href={`/dashboard/website/pages/${page.id}`}
          className="rounded-full bg-[var(--field)] px-3 py-1.5 text-sm font-semibold text-white"
        >
          Edit
        </Link>
      </div>
    </li>
  );
}

function PageGroup({
  title,
  description,
  pages,
  previewFor,
}: {
  title: string;
  description: string;
  pages: StorefrontCustomPage[];
  previewFor: (page: StorefrontCustomPage) => string;
}) {
  if (pages.length === 0) return null;
  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      <ul className="mt-4 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
        {pages.map((page) => (
          <PageRow key={page.id} page={page} preview={previewFor(page)} />
        ))}
      </ul>
    </section>
  );
}

export default async function WebsitePagesListPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  await syncBuiltinCustomPages();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const pages = ensureCustomPages(storefront.draftConfig);
  const params = await searchParams;
  const base = appBaseUrl();

  const contentPages = pages.filter(
    (p) =>
      p.routeKind === "custom" ||
      p.builtinKey === "about" ||
      p.builtinKey === "contact" ||
      p.builtinKey === "blog",
  );
  const policyPages = pages.filter(
    (p) =>
      p.builtinKey === "privacy" ||
      p.builtinKey === "terms" ||
      p.builtinKey === "returns" ||
      p.builtinKey === "shipping",
  );

  const previewFor = (page: StorefrontCustomPage) =>
    `${base}${customPagePublicPath(storefront.slug, page, true)}`;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
            Pages
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--muted)]">
            Manage content pages, policy pages, and section layouts. Header/footer order is set under
            Navigation.
          </p>
        </div>
        <Link
          href="/dashboard/website/pages/new"
          className="rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Add page
        </Link>
      </div>

      {params.saved ? <p className="text-sm font-medium text-[var(--ok)]">Page saved.</p> : null}
      {params.deleted ? <p className="text-sm font-medium text-[var(--ok)]">Page deleted.</p> : null}
      {params.error ? <p className="text-sm font-medium text-[var(--gone)]">Something went wrong.</p> : null}

      <PageGroup
        title="Content pages"
        description="About, contact, blog index, and custom pages."
        pages={contentPages.sort((a, b) => a.sortOrder - b.sortOrder)}
        previewFor={previewFor}
      />

      <PageGroup
        title="Policy pages"
        description="Standard policy starters — editable placeholder text, not legal advice. Shown in footer by default."
        pages={policyPages}
        previewFor={previewFor}
      />
    </main>
  );
}
