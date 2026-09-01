import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage, storefrontEnabledPages } from "@/lib/storefront/page-loader";
import { storefrontMetadata } from "@/lib/storefront/seo";
import { storefrontButtonClass } from "@/lib/storefront/branding";
import StorefrontShell from "@/components/storefront/StorefrontShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import { StorefrontSocialLinks } from "@/components/storefront/StorefrontSections";

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
    return storefrontMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published: ctx.storefront.isPublished && !draft,
      pageTitle: "Contact",
    });
  } catch {
    return { title: "Contact", robots: { index: false, follow: false } };
  }
}

export default async function StorefrontContactPage({
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
  if (!ctx.config.pages.contact?.enabled) notFound();

  const btnClass = storefrontButtonClass(ctx.branding);
  const enabledPages = storefrontEnabledPages(ctx.config);

  return (
    <StorefrontShell
      storefrontSlug={ctx.storefront.slug}
      standSlug={ctx.stand.slug}
      branding={ctx.branding}
      activePage="contact"
      enabledPages={enabledPages}
      draft={draft}
      isDraftPreview={ctx.isDraftPreview}
      fulfilmentOptions={ctx.fulfilmentOptions}
      currency={ctx.stand.currency}
    >
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">
          Contact
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)]">
          We&apos;d love to hear from you — whether it&apos;s about an order,
          pickup times, or our products.
        </p>
        {ctx.branding.regionLabel ? (
          <p className="mt-2 font-medium text-[var(--leaf-dark)]">
            {ctx.branding.regionLabel}
          </p>
        ) : null}
        <a
          href={`mailto:${ctx.branding.contactEmail}`}
          className={`mt-8 inline-flex ${btnClass}`}
        >
          {ctx.branding.contactEmail}
        </a>
        {ctx.branding.contactPhone ? (
          <p className="mt-6 text-[var(--muted)]">
            Phone:{" "}
            <a
              href={`tel:${ctx.branding.contactPhone}`}
              className="font-semibold text-[var(--field)]"
            >
              {ctx.branding.contactPhone}
            </a>
          </p>
        ) : null}
        <div className="mt-10">
          <StorefrontSocialLinks branding={ctx.branding} />
        </div>
      </div>
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontShell>
  );
}
