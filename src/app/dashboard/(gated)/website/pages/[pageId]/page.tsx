import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { ensureStorefront, loadStorefrontContext } from "@/lib/catalogue/storefront";
import { appBaseUrl } from "@/lib/app-url";
import { buildStudioMetadata } from "@/lib/studio/build-metadata";
import { extractWebsiteStudio, studioPageNodes, defaultTemplateId } from "@/lib/studio/storage";
import {
  ensureCustomPages,
  findCustomPageById,
} from "@/lib/studio/custom-pages";
import { customPagePublicPath } from "@/lib/studio/custom-page-paths";
import StudioPageEditor from "@/components/studio/StudioPageEditor";
import { updateCustomPageMeta, deleteCustomPage } from "../actions";

export default async function EditWebsitePage({
  params,
  searchParams,
}: {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<{ saved?: string; published?: string; created?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const { pageId } = await params;
  const sp = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const pages = ensureCustomPages(storefront.draftConfig);
  const page = findCustomPageById(pages, pageId);
  if (!page) notFound();

  const ctx = await loadStorefrontContext(storefront.slug, {
    draft: true,
    ownerId: owner.id,
  });
  if (!ctx) notFound();

  const websiteStudio = extractWebsiteStudio(storefront.draftConfig);
  const templateId = defaultTemplateId(websiteStudio ?? null, ctx.businessMode);
  const metadata = await buildStudioMetadata(ctx, templateId, true);
  const initialNodes = websiteStudio ? studioPageNodes(websiteStudio, page.id) ?? null : null;
  const previewUrl = `${appBaseUrl()}${customPagePublicPath(storefront.slug, page, true)}`;

  return (
    <main className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Edit: {page.title}
        </h1>
      </div>

      {sp.saved ? <p className="text-sm font-medium text-[var(--ok)]">Draft saved.</p> : null}
      {sp.published ? <p className="text-sm font-medium text-[var(--ok)]">Published.</p> : null}
      {sp.created ? <p className="text-sm font-medium text-[var(--ok)]">Page created — add sections below.</p> : null}
      {sp.error ? <p className="text-sm font-medium text-[var(--gone)]">Could not save page settings.</p> : null}

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <h2 className="font-semibold text-[var(--field)]">Page settings</h2>
        <form action={updateCustomPageMeta.bind(null, page.id)} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium">Title</span>
            <input name="title" defaultValue={page.title} className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="font-medium">Nav label</span>
            <input name="navLabel" defaultValue={page.navLabel} className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2" />
          </label>
          {page.routeKind === "custom" ? (
            <label className="text-sm sm:col-span-2">
              <span className="font-medium">URL slug</span>
              <input name="slug" defaultValue={page.slug} className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-2" />
            </label>
          ) : null}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="enabled" defaultChecked={page.enabled} />
            Published / visible
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="showInNav" defaultChecked={page.showInNav} />
            Show in header nav
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="showInFooter" defaultChecked={page.showInFooter} />
            Show in footer
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold">
              Save settings
            </button>
          </div>
        </form>
        {page.routeKind === "custom" ? (
          <form action={deleteCustomPage.bind(null, page.id)} className="mt-4">
            <button type="submit" className="text-sm font-semibold text-[var(--gone)]">
              Delete page
            </button>
          </form>
        ) : null}
      </section>

      <StudioPageEditor
        pageId={page.id}
        pageTitle={page.title}
        pageTemplate={page.template}
        initialNodes={initialNodes}
        metadata={metadata}
        templateId={templateId}
        previewUrl={previewUrl}
        isPublished={storefront.isPublished}
        starter={{
          headline: storefront.headline ?? owner.businessName,
          subheadline: storefront.subheadline,
          about: storefront.about,
        }}
      />
    </main>
  );
}
