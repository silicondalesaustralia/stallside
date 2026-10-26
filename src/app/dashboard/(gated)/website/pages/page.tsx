import WebsiteFormError from "@/components/website/WebsiteFormError";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import SiteSlugClashNotice from "@/components/website/SiteSlugClashNotice";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { ensureCustomPages, type StorefrontCustomPage } from "@/lib/studio/custom-pages";
import { customPagePublicPath } from "@/lib/studio/custom-page-paths";
import { appBaseUrl } from "@/lib/app-url";
import { shopHomePath } from "@/lib/storefront/paths";
import { syncBuiltinCustomPages } from "./actions";
import PagesTable, { type PagesTableRow } from "./PagesTable";
import { setCustomPageEnabled } from "./publish-actions";
import { customPageStatus, liveCustomPageIds } from "./page-status";

const POLICY_KEYS = ["privacy", "terms", "returns", "shipping"];

function pageDetail(page: StorefrontCustomPage): string {
  return [
    `/${page.slug}`,
    page.routeKind === "builtin" ? "Built-in" : null,
    page.showInFooter && !page.showInNav ? "Footer" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default async function WebsitePagesListPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; published?: string; unpublished?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  await syncBuiltinCustomPages();
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const pages = ensureCustomPages(storefront.draftConfig);
  const params = await searchParams;
  const base = appBaseUrl();
  const liveIds = liveCustomPageIds(storefront.isPublished, storefront.publishedConfig);

  const policyPages = pages.filter((p) => p.builtinKey && POLICY_KEYS.includes(p.builtinKey));
  const contentPages = pages
    .filter((p) => p.routeKind === "custom" || ["about", "contact", "blog"].includes(p.builtinKey ?? ""))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const row = (page: StorefrontCustomPage, type: PagesTableRow["type"]): PagesTableRow => ({
    id: page.id,
    title: page.title,
    detail: pageDetail(page),
    type,
    status: customPageStatus(page, liveIds),
    previewUrl: `${base}${customPagePublicPath(storefront.slug, page, true)}`,
    editHref: `/dashboard/website/pages/${page.id}`,
    toggleAction: setCustomPageEnabled.bind(null, page.id, !page.enabled, "list"),
  });

  const rows: PagesTableRow[] = [
    {
      id: "home",
      title: "Home",
      detail: "/",
      type: "Home",
      status: storefront.isPublished ? "live" : "off",
      previewUrl: `${base}${shopHomePath(storefront.slug, true)}`,
      editHref: "/dashboard/website/pages/home",
    },
    ...contentPages.map((p) => row(p, "Content")),
    ...policyPages.map((p) => row(p, "Policy")),
  ];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-5 pb-12">
      <PageHeader
        title="Pages"
        subtitle="Page settings, publishing and search & social. Page content, and the header and footer menus, are edited right on your site."
        actions={<DashPrimaryCta href="/dashboard/website/pages/new">+ Add page</DashPrimaryCta>}
      />

      {params.saved ? <p className="text-sm font-medium text-[var(--ok)]">Page saved.</p> : null}
      {params.deleted ? <p className="text-sm font-medium text-[var(--ok)]">Page deleted.</p> : null}
      {params.published ? <p className="text-sm font-medium text-[var(--ok)]">Page published.</p> : null}
      {params.unpublished ? <p className="text-sm font-medium text-[var(--ok)]">Page unpublished.</p> : null}
      <WebsiteFormError error={params.error} fallback="Something went wrong." />
      <SiteSlugClashNotice ownerId={owner.id} configRaw={storefront.draftConfig} />

      <PagesTable
        rows={rows}
        footer={`${rows.length} page${rows.length === 1 ? "" : "s"}${
          policyPages.length > 0
            ? " · Policy pages are editable starters, not legal advice, and show in the footer by default."
            : ""
        }`}
      />
    </main>
  );
}
