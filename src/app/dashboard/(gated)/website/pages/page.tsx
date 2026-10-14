import Link from "next/link";
import WebsiteFormError from "@/components/website/WebsiteFormError";
import SiteSlugClashNotice from "@/components/website/SiteSlugClashNotice";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { ensureCustomPages, type StorefrontCustomPage } from "@/lib/studio/custom-pages";
import { customPagePublicPath } from "@/lib/studio/custom-page-paths";
import { appBaseUrl } from "@/lib/app-url";
import { shopHomePath } from "@/lib/storefront/paths";
import { syncBuiltinCustomPages } from "./actions";
import PageGroup from "./PageGroup";
import PageRow from "./PageRow";

const POLICY_KEYS = ["privacy", "terms", "returns", "shipping"];

function pageDetail(page: StorefrontCustomPage): string {
  return [
    `/${page.slug}`,
    page.routeKind === "builtin" ? "Built-in" : null,
    page.enabled ? null : "Unpublished",
    page.showInFooter && !page.showInNav ? "Footer" : null,
  ]
    .filter(Boolean)
    .join(" · ");
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

  const policyPages = pages.filter((p) => p.builtinKey && POLICY_KEYS.includes(p.builtinKey));
  const contentPages = pages
    .filter((p) => p.routeKind === "custom" || ["about", "contact", "blog"].includes(p.builtinKey ?? ""))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const row = (page: StorefrontCustomPage) => (
    <PageRow
      key={page.id}
      label={page.title}
      detail={pageDetail(page)}
      previewUrl={`${base}${customPagePublicPath(storefront.slug, page, true)}`}
      editHref={`/dashboard/website/pages/${page.id}`}
    />
  );

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
            Pages
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--muted)]">
            Page settings, publishing and search &amp; social. Page content, and the header and footer
            menus, are edited right on your site.
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
      <WebsiteFormError error={params.error} fallback="Something went wrong." />
      <SiteSlugClashNotice ownerId={owner.id} configRaw={storefront.draftConfig} />

      <PageGroup title="Home page">
        <PageRow
          label="Home"
          detail="/"
          previewUrl={`${base}${shopHomePath(storefront.slug, true)}`}
          editHref="/dashboard/website/pages/home"
        />
      </PageGroup>

      {contentPages.length > 0 ? (
        <PageGroup title="Content pages" description="About, contact, blog index, and custom pages.">
          {contentPages.map(row)}
        </PageGroup>
      ) : null}

      {policyPages.length > 0 ? (
        <PageGroup
          title="Policy pages"
          description="Standard policy starters — editable placeholder text, not legal advice. Shown in footer by default."
        >
          {policyPages.map(row)}
        </PageGroup>
      ) : null}
    </main>
  );
}
