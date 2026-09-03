import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { ensureStorefront, loadStorefrontContext } from "@/lib/catalogue/storefront";
import { appBaseUrl } from "@/lib/app-url";
import { buildStudioMetadata } from "@/lib/studio/build-metadata";
import {
  defaultTemplateId,
  extractWebsiteStudio,
  studioPageNodes,
} from "@/lib/studio/storage";
import {
  COMMERCE_PAGES,
  commerceKeyForKind,
  commerceKindFromParam,
} from "@/lib/studio/commerce-pages";
import {
  buildSampleCommerceContext,
  withCommerceContext,
} from "@/lib/studio/commerce-context";
import StudioCommerceEditor from "@/components/studio/StudioCommerceEditor";

export default async function WebsiteCommerceEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ saved?: string; published?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const { kind: kindParam } = await params;
  const sp = await searchParams;
  const kind = commerceKindFromParam(kindParam);
  if (!kind) notFound();

  const meta = COMMERCE_PAGES.find((p) => p.kind === kind);
  if (!meta) notFound();

  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const ctx = await loadStorefrontContext(storefront.slug, {
    draft: true,
    ownerId: owner.id,
  });
  if (!ctx) notFound();

  const websiteStudio = extractWebsiteStudio(storefront.draftConfig);
  const templateId = defaultTemplateId(websiteStudio ?? null, ctx.businessMode);
  const baseMetadata = await buildStudioMetadata(ctx, templateId, true);
  const commerceContext = await buildSampleCommerceContext(ctx, kind);
  const metadata = withCommerceContext(baseMetadata, commerceContext);
  const pageKey = commerceKeyForKind(kind);
  const initialNodes = websiteStudio
    ? studioPageNodes(websiteStudio, pageKey) ?? null
    : null;

  let previewPath = `/shop/${encodeURIComponent(storefront.slug)}`;
  if (kind === "shop") previewPath += "/shop?draft=1";
  else if (kind === "category") {
    const slug = commerceContext.category?.slug;
    previewPath += slug
      ? `/shop?category=${encodeURIComponent(slug)}&draft=1`
      : "/shop?draft=1";
  } else if (kind === "product") {
    const slug = commerceContext.product?.slug;
    previewPath += slug
      ? `/product/${encodeURIComponent(slug)}?draft=1`
      : "/shop?draft=1";
  } else {
    const slug = commerceContext.menu?.slug;
    previewPath += slug
      ? `/menu/${encodeURIComponent(slug)}?draft=1`
      : "/menu?draft=1";
  }

  return (
    <main className="flex flex-col gap-6 pb-8">
      <div>
        <p className="text-sm">
          <Link
            href="/dashboard/website/commerce"
            className="font-semibold text-[var(--leaf-dark)] underline"
          >
            ← Shop layouts
          </Link>
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          {meta.label} layout
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{meta.description}</p>
      </div>

      {sp.saved ? <p className="text-sm font-medium text-[var(--ok)]">Draft saved.</p> : null}
      {sp.published ? (
        <p className="text-sm font-medium text-[var(--ok)]">Published.</p>
      ) : null}
      {sp.error ? (
        <p className="text-sm font-medium text-[var(--gone)]">Could not save layout.</p>
      ) : null}

      <StudioCommerceEditor
        kind={kind}
        initialNodes={initialNodes}
        metadata={metadata}
        templateId={templateId}
        previewUrl={`${appBaseUrl()}${previewPath}`}
        isPublished={storefront.isPublished}
        starter={{
          headline: ctx.branding.headline,
          subheadline: ctx.branding.subheadline,
          about: ctx.branding.about,
        }}
      />
    </main>
  );
}
