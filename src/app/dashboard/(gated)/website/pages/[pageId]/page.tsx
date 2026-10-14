import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { appBaseUrl } from "@/lib/app-url";
import { studioEditorPath } from "@/lib/studio/editor-target";
import { BLOG_INDEX_BUILTIN_ID, ensureCustomPages, findCustomPageById } from "@/lib/studio/custom-pages";
import { customPagePublicPath } from "@/lib/studio/custom-page-paths";
import { ensureBlogSettings } from "@/lib/studio/blog";
import { shopHomePath } from "@/lib/storefront/paths";
import { entitySeoKey } from "@/lib/studio/seo-settings";
import { DRAFT_CONFLICT_MESSAGE } from "@/lib/website/persistence/draft-store";
import EntitySeoCard from "@/components/website/seo/EntitySeoCard";
import PublishStatusCard from "@/components/website/PublishStatusCard";
import BlogSettingsSection from "../../blog/BlogSettingsSection";
import { setCustomPageEnabled } from "../publish-actions";
import HomePageSettings from "./HomePageSettings";
import PageSettingsForm from "./PageSettingsForm";

type SearchParams = {
  saved?: string;
  published?: string;
  unpublished?: string;
  created?: string;
  error?: string;
  msg?: string;
  seo?: string;
};

export default async function EditWebsitePage({
  params,
  searchParams,
}: {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { owner } = await requireOwner();
  const { pageId } = await params;
  const sp = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);

  if (pageId === "home") {
    return (
      <HomePageSettings
        ownerId={owner.id}
        businessName={owner.businessName}
        storefrontSlug={storefront.slug}
        previewUrl={`${appBaseUrl()}${shopHomePath(storefront.slug, true)}`}
        seoStatus={sp.seo}
      />
    );
  }

  const page = findCustomPageById(ensureCustomPages(storefront.draftConfig), pageId);
  if (!page) notFound();
  const previewUrl = `${appBaseUrl()}${customPagePublicPath(storefront.slug, page, true)}`;

  return (
    <main className="flex flex-col gap-6 pb-8">
      <div>
        <Link href="/dashboard/website/pages" className="text-sm font-semibold text-[var(--leaf-dark)] underline">
          ← Pages
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Edit: {page.title}
        </h1>
      </div>

      {sp.saved ? <p className="text-sm font-medium text-[var(--ok)]">Draft saved.</p> : null}
      {sp.published ? <p className="text-sm font-medium text-[var(--ok)]">Page published.</p> : null}
      {sp.unpublished ? <p className="text-sm font-medium text-[var(--ok)]">Page unpublished.</p> : null}
      {sp.created ? <p className="text-sm font-medium text-[var(--ok)]">Page created. Use Edit this page to add sections.</p> : null}
      {sp.error ? (
        <p className="text-sm font-medium text-[var(--gone)]">
          {sp.error === "conflict" ? DRAFT_CONFLICT_MESSAGE : sp.msg ?? "Could not save page settings."}
        </p>
      ) : null}

      <PublishStatusCard
        live={page.enabled}
        liveNote="Visible on your website and editable in the site editor."
        offNote="Hidden from your website and the site editor. Publish it to show and edit it again."
        toggleAction={setCustomPageEnabled.bind(null, page.id, !page.enabled)}
      />

      <PageSettingsForm page={page} />

      {page.id === BLOG_INDEX_BUILTIN_ID ? (
        <BlogSettingsSection settings={ensureBlogSettings(storefront.draftConfig)} />
      ) : null}

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <h2 className="font-semibold text-[var(--field)]">Content and layout</h2>
        {page.enabled ? (
          <>
            <p className="mt-1 text-sm text-[var(--muted)]">Edit this page&apos;s sections and text right on your site.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={studioEditorPath(storefront.slug, { kind: "page", pageId: page.id })}
                className="rounded-full bg-[var(--field)] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Edit this page
              </Link>
              <a href={previewUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold underline">
                Preview
              </a>
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-[var(--muted)]">Publish this page to edit its content on your site.</p>
        )}
      </section>

      <EntitySeoCard
        ownerId={owner.id}
        businessName={owner.businessName}
        entityKey={entitySeoKey("page", page.id)}
        returnTo={`/dashboard/website/pages/${page.id}`}
        status={sp.seo}
      />
    </main>
  );
}
