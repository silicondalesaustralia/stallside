import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import {
  buildStorefrontPageMetadata,
  seoConfigSource,
} from "@/lib/studio/resolve-seo-metadata";
import { ensureCustomPages } from "@/lib/studio/custom-pages";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import StudioPublicSections from "@/lib/studio/public-render";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import { loadCustomPageFromContext } from "@/lib/studio/load-custom-page";
import { studioPageNodes } from "@/lib/studio/storage";
import { storefrontButtonClass } from "@/lib/storefront/branding";
import { StorefrontSocialLinks } from "@/components/storefront/StorefrontSections";
import type { BuiltinPageKey } from "@/lib/studio/custom-pages";
import { POLICY_STATIC_FALLBACK } from "@/lib/studio/policy-content";

type StorefrontCtx = Awaited<ReturnType<typeof loadStorefrontPage>>;

async function renderCraftOrFallback(
  ctx: StorefrontCtx,
  pageSlug: string,
  draft: boolean | undefined,
  fallback: ReactNode,
) {
  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const page = loadCustomPageFromContext(ctx, pageSlug, draft);
  const nodes =
    page && studioCtx.active ? studioPageNodes(studioCtx.studio, page.id) : undefined;

  if (nodes && studioCtx.active) {
    return <StudioPublicSections nodes={nodes} metadata={studioCtx.metadata} />;
  }
  return fallback;
}

function PolicyStaticFallback({
  policyKey,
  studioActive,
}: {
  policyKey: keyof typeof POLICY_STATIC_FALLBACK;
  studioActive: boolean;
}) {
  const fb = POLICY_STATIC_FALLBACK[policyKey];
  const headingClass = studioActive
    ? "studio-heading"
    : "font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]";

  return (
    <article className="storefront-page-content storefront-page-content--narrow">
      <h1 className={headingClass}>{fb.title}</h1>
      <div className="mt-8 space-y-8">
        {fb.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-lg font-semibold text-[var(--field)]">{s.heading}</h2>
            <p className="mt-3 whitespace-pre-wrap text-[var(--muted)] leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}

async function renderBuiltinAbout(ctx: StorefrontCtx, draft?: boolean) {
  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const body =
    ctx.config.pages.about?.body?.trim() ||
    ctx.branding.about ||
    `${ctx.branding.headline} is a local food business${ctx.branding.regionLabel ? ` based in ${ctx.branding.regionLabel}` : ""}. We're proud to bring fresh, quality products to our community.`;
  const pageTitle =
    studioCtx.active && studioCtx.templateId === "farmhouse" ? "Our farm" : `About ${ctx.branding.headline}`;

  return renderCraftOrFallback(
    ctx,
    "about",
    draft,
    <article className="storefront-page-content storefront-page-content--narrow">
      <h1 className={studioCtx.active ? "studio-heading" : "font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]"}>
        {pageTitle}
      </h1>
      <p className="mt-6 whitespace-pre-wrap text-lg leading-relaxed text-[var(--muted)]">{body}</p>
    </article>,
  );
}

async function renderBuiltinContact(ctx: StorefrontCtx, draft?: boolean) {
  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const btnClass = storefrontButtonClass(ctx.branding);

  return renderCraftOrFallback(
    ctx,
    "contact",
    draft,
    <div className="storefront-page-content storefront-page-content--narrow">
      <h1 className={studioCtx.active ? "studio-heading" : "font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]"}>
        Contact
      </h1>
      <p className="mt-4 text-lg text-[var(--muted)]">
        We&apos;d love to hear from you — whether it&apos;s about an order, pickup times, or our products.
      </p>
      {ctx.branding.regionLabel ? (
        <p className="mt-2 font-medium text-[var(--leaf-dark)]">{ctx.branding.regionLabel}</p>
      ) : null}
      <a
        href={`mailto:${ctx.branding.contactEmail}`}
        className={`mt-8 inline-flex ${studioCtx.active ? "studio-btn studio-btn--primary" : btnClass}`}
      >
        {ctx.branding.contactEmail}
      </a>
      {ctx.branding.contactPhone ? (
        <p className="mt-6 text-[var(--muted)]">
          Phone:{" "}
          <a href={`tel:${ctx.branding.contactPhone}`} className="font-semibold text-[var(--field)]">
            {ctx.branding.contactPhone}
          </a>
        </p>
      ) : null}
      <div className="mt-10">
        <StorefrontSocialLinks branding={ctx.branding} />
      </div>
    </div>,
  );
}

async function renderBuiltinPolicy(
  ctx: StorefrontCtx,
  slug: BuiltinPageKey,
  policyKey: keyof typeof POLICY_STATIC_FALLBACK,
  draft?: boolean,
) {
  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  return renderCraftOrFallback(
    ctx,
    slug,
    draft,
    <PolicyStaticFallback policyKey={policyKey} studioActive={studioCtx.active} />,
  );
}

async function generateBuiltinMetadata(
  slug: string,
  draft: boolean,
  pageSlug: BuiltinPageKey,
  defaultTitle: string,
  defaultDescription?: string,
): Promise<Metadata> {
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const published = ctx.storefront.isPublished && !draft;
    const configRaw = seoConfigSource(
      ctx.storefront.draftConfig,
      ctx.storefront.publishedConfig,
      published,
    );
    const page = ensureCustomPages(configRaw).find(
      (p) => p.builtinKey === pageSlug || p.slug === pageSlug,
    );
    return buildStorefrontPageMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published,
      configRaw,
      entityType: "page",
      entityId: page?.id,
      defaults: {
        title: page?.title ?? defaultTitle,
        description: defaultDescription ?? page?.navLabel ?? page?.title ?? defaultTitle,
      },
      path: `/${pageSlug}`,
    });
  } catch {
    return { title: defaultTitle, robots: { index: false, follow: false } };
  }
}

export async function generateAboutMetadata(slug: string, draft: boolean) {
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const body = ctx.config.pages.about?.body ?? ctx.branding.about;
    return generateBuiltinMetadata(slug, draft, "about", "About", body ?? undefined);
  } catch {
    return { title: "About", robots: { index: false, follow: false } };
  }
}

export async function generateContactMetadata(slug: string, draft: boolean) {
  return generateBuiltinMetadata(slug, draft, "contact", "Contact");
}

export async function generatePrivacyMetadata(slug: string, draft: boolean) {
  return generateBuiltinMetadata(slug, draft, "privacy", "Privacy policy");
}

export async function generateTermsMetadata(slug: string, draft: boolean) {
  return generateBuiltinMetadata(slug, draft, "terms", "Terms of service");
}

export async function generateReturnsMetadata(slug: string, draft: boolean) {
  return generateBuiltinMetadata(slug, draft, "returns", "Returns & refunds");
}

export async function generateShippingMetadata(slug: string, draft: boolean) {
  return generateBuiltinMetadata(slug, draft, "shipping", "Shipping & pickup");
}

async function builtinPageShell(
  slug: string,
  draft: boolean,
  pageSlug: BuiltinPageKey,
  content: ReactNode,
) {
  const ctx = await loadStorefrontPage(slug, draft);
  const page = loadCustomPageFromContext(ctx, pageSlug, draft);
  if (!page?.enabled) notFound();

  return (
    <StorefrontPageShell ctx={ctx} draft={draft} activePage={pageSlug}>
      {content}
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}

export async function BuiltinAboutPage({ slug, draft }: { slug: string; draft: boolean }) {
  const ctx = await loadStorefrontPage(slug, draft);
  if (!ctx.config.pages.about?.enabled) notFound();
  return (
    <StorefrontPageShell ctx={ctx} draft={draft} activePage="about">
      {await renderBuiltinAbout(ctx, draft)}
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}

export async function BuiltinContactPage({ slug, draft }: { slug: string; draft: boolean }) {
  const ctx = await loadStorefrontPage(slug, draft);
  if (!ctx.config.pages.contact?.enabled) notFound();
  return (
    <StorefrontPageShell ctx={ctx} draft={draft} activePage="contact">
      {await renderBuiltinContact(ctx, draft)}
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}

export async function BuiltinPrivacyPage({ slug, draft }: { slug: string; draft: boolean }) {
  const ctx = await loadStorefrontPage(slug, draft);
  return builtinPageShell(slug, draft, "privacy", await renderBuiltinPolicy(ctx, "privacy", "privacy", draft));
}

export async function BuiltinTermsPage({ slug, draft }: { slug: string; draft: boolean }) {
  const ctx = await loadStorefrontPage(slug, draft);
  return builtinPageShell(slug, draft, "terms", await renderBuiltinPolicy(ctx, "terms", "terms", draft));
}

export async function BuiltinReturnsPage({ slug, draft }: { slug: string; draft: boolean }) {
  const ctx = await loadStorefrontPage(slug, draft);
  return builtinPageShell(slug, draft, "returns", await renderBuiltinPolicy(ctx, "returns", "returns", draft));
}

export async function BuiltinShippingPage({ slug, draft }: { slug: string; draft: boolean }) {
  const ctx = await loadStorefrontPage(slug, draft);
  return builtinPageShell(slug, draft, "shipping", await renderBuiltinPolicy(ctx, "shipping", "shipping", draft));
}

/** Redirect custom slugs that match builtin pages */
export function redirectBuiltinCustomPage(pageSlug: string, storefrontSlug: string) {
  const key = pageSlug.toLowerCase();
  const builtins = ["about", "contact", "privacy", "terms", "returns", "shipping", "blog"] as const;
  if (builtins.includes(key as (typeof builtins)[number])) {
    redirect(`/shop/${encodeURIComponent(storefrontSlug)}/${key}`);
  }
}
