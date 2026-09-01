import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage, storefrontEnabledPages } from "@/lib/storefront/page-loader";
import { storefrontMetadata } from "@/lib/storefront/seo";
import StorefrontShell from "@/components/storefront/StorefrontShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const body = ctx.config.pages.about?.body ?? ctx.branding.about;
    return storefrontMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published: ctx.storefront.isPublished && !draft,
      pageTitle: "About",
      description: body ?? undefined,
    });
  } catch {
    return { title: "About", robots: { index: false, follow: false } };
  }
}

export default async function StorefrontAboutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  if (!ctx.config.pages.about?.enabled) notFound();

  const body =
    ctx.config.pages.about?.body?.trim() ||
    ctx.branding.about ||
    `${ctx.branding.headline} is a local food business${ctx.branding.regionLabel ? ` based in ${ctx.branding.regionLabel}` : ""}. We’re proud to bring fresh, quality products to our community.`;

  const enabledPages = storefrontEnabledPages(ctx.config);

  return (
    <StorefrontShell
      storefrontSlug={ctx.storefront.slug}
      standSlug={ctx.stand.slug}
      branding={ctx.branding}
      activePage="about"
      enabledPages={enabledPages}
      draft={draft}
      isDraftPreview={ctx.isDraftPreview}
      fulfilmentOptions={ctx.fulfilmentOptions}
      currency={ctx.stand.currency}
    >
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          About {ctx.branding.headline}
        </h1>
        <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed text-[var(--muted)]">
          {body}
        </p>
      </article>
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontShell>
  );
}
