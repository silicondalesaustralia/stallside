import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { storefrontMetadata } from "@/lib/storefront/seo";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import StudioPublicSections from "@/lib/studio/public-render";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import StudioPreviewOwnerBar from "@/components/studio/StudioPreviewOwnerBar";
import StudioStorefrontEditor from "@/components/studio/StudioStorefrontEditor";
import { studioPreviewEditPath } from "@/lib/studio/return-to";
import { webStudioPath } from "@/lib/website/web-studio-nav";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string; edit?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    return {
      ...storefrontMetadata({
        branding: ctx.branding,
        slug: ctx.storefront.slug,
        published: ctx.storefront.isPublished && !draft,
      }),
      title: `${sp.edit === "1" ? "Edit" : "Preview"} · ${ctx.branding.headline}`,
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: "Preview", robots: { index: false, follow: false } };
  }
}

export default async function StudioPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    draft?: string;
    edit?: string;
    page?: string;
    saved?: string;
    published?: string;
    error?: string;
  }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  const edit = draft && sp.edit === "1";
  const ctx = await loadStorefrontPage(slug, draft);

  if (edit) {
    return (
      <StudioStorefrontEditor
        ctx={ctx}
        page={sp.page}
        flash={{ saved: sp.saved === "1", published: sp.published === "1", error: sp.error }}
      />
    );
  }

  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  if (!studioCtx.active) {
    if (draft) redirect(studioPreviewEditPath(ctx.storefront.slug));
    notFound();
  }
  const editPath = studioPreviewEditPath(ctx.storefront.slug);

  const homeNodes = studioCtx.studio.nodes;
  if (!homeNodes) {
    if (draft) redirect(editPath);
    notFound();
  }

  return (
    <>
      {draft ? (
        <StudioPreviewOwnerBar
          editHref={editPath}
          dashboardHref={webStudioPath("studio")}
        />
      ) : null}
      <StorefrontPageShell ctx={ctx} draft={draft} activePage="home">
        <StudioPublicSections nodes={homeNodes} metadata={studioCtx.metadata} />
      </StorefrontPageShell>
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </>
  );
}
