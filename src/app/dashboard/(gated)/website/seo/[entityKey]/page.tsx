import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { prisma } from "@/lib/prisma";
import { ensureCustomPages, findCustomPageById } from "@/lib/studio/custom-pages";
import { extractBlogPosts, findBlogPostById } from "@/lib/studio/blog";
import {
  entityKeyFromParam,
  extractStorefrontSeo,
  readEntitySeo,
  resolveSeoFields,
  type EntitySeoSettings,
} from "@/lib/studio/seo-settings";
import { homeSeoDefaults } from "@/lib/studio/resolve-seo-metadata";
import { resolveStorefrontBranding } from "@/lib/storefront/branding";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { saveEntitySeo } from "../actions";
import SeoSettingsForm from "../SeoSettingsForm";

type EntityContext = {
  label: string;
  pathLabel: string;
  defaults: { title: string; description: string };
  settings: EntitySeoSettings;
};

async function resolveEntityContext(
  ownerId: string,
  businessName: string,
  entityKey: string,
): Promise<EntityContext | null> {
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: ownerId },
    include: {
      user: { select: { email: true, role: true } },
      stands: { orderBy: { createdAt: "asc" }, take: 1 },
    },
  });
  const storefront = await ensureStorefront(ownerId, businessName);
  const stand = owner.stands[0];
  if (!stand) return null;
  const config = parseStorefrontConfig(storefront.draftConfig);
  const branding = resolveStorefrontBranding({ owner, stand, storefront, config });
  const seo = extractStorefrontSeo(storefront.draftConfig);
  const stored = readEntitySeo(seo, entityKey) ?? {};

  if (entityKey === "home") {
    const defaults = homeSeoDefaults(branding);
    return {
      label: "Home",
      pathLabel: "/",
      defaults: { title: defaults.title, description: defaults.description },
      settings: stored,
    };
  }

  if (entityKey.startsWith("page:")) {
    const page = findCustomPageById(
      ensureCustomPages(storefront.draftConfig),
      entityKey.slice(5),
    );
    if (!page) return null;
    return {
      label: page.title,
      pathLabel: `/${page.slug}`,
      defaults: { title: page.title, description: page.navLabel || page.title },
      settings: stored,
    };
  }

  if (entityKey.startsWith("blog:")) {
    const post = findBlogPostById(extractBlogPosts(storefront.draftConfig), entityKey.slice(5));
    if (!post) return null;
    return {
      label: post.title,
      pathLabel: `/blog/${post.slug}`,
      defaults: {
        title: post.title,
        description: post.excerpt || post.title,
      },
      settings: stored,
    };
  }

  if (entityKey.startsWith("product:")) {
    const product = await prisma.product.findFirst({
      where: { id: entityKey.slice(8), ownerId },
      select: {
        name: true,
        slug: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
        imageUrl: true,
      },
    });
    if (!product) return null;
    const defaults = {
      title: product.name,
      description: product.seoDescription ?? product.description ?? product.name,
    };
    return {
      label: product.name,
      pathLabel: `/product/${product.slug}`,
      defaults,
      settings: {
        ...stored,
        seoTitle: stored.seoTitle ?? product.seoTitle ?? undefined,
        seoDescription: stored.seoDescription ?? product.seoDescription ?? undefined,
        ogImageUrl: stored.ogImageUrl ?? product.imageUrl ?? undefined,
      },
    };
  }

  if (entityKey.startsWith("category:")) {
    const cat = await prisma.category.findFirst({
      where: { id: entityKey.slice(9), ownerId },
      select: { title: true, slug: true, description: true },
    });
    if (!cat) return null;
    return {
      label: cat.title,
      pathLabel: `/shop?category=${cat.slug}`,
      defaults: {
        title: cat.title,
        description: cat.description ?? `${cat.title} at ${branding.headline}`,
      },
      settings: stored,
    };
  }

  if (entityKey.startsWith("menu:")) {
    const menu = await prisma.menu.findFirst({
      where: { id: entityKey.slice(5), ownerId },
      select: { title: true, slug: true, description: true },
    });
    if (!menu) return null;
    return {
      label: menu.title,
      pathLabel: `/menu/${menu.slug}`,
      defaults: {
        title: menu.title,
        description: menu.description ?? menu.title,
      },
      settings: stored,
    };
  }

  return null;
}

export default async function WebsiteSeoEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ entityKey: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { owner } = await requireOwner();
  const { entityKey: entityParam } = await params;
  const sp = await searchParams;
  const entityKey = entityKeyFromParam(entityParam);
  const ctx = await resolveEntityContext(owner.id, owner.businessName, entityKey);
  if (!ctx) notFound();

  const preview = resolveSeoFields(ctx.defaults, ctx.settings);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 pb-12">
      <div>
        <p className="text-sm">
          <Link href="/dashboard/website/seo" className="font-semibold text-[var(--leaf-dark)] underline">
            ← Search & social
          </Link>
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          {ctx.label}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{ctx.pathLabel}</p>
      </div>

      {sp.saved ? <p className="text-sm font-medium text-[var(--ok)]">SEO settings saved.</p> : null}

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
        <p className="font-semibold text-[var(--field)]">Preview</p>
        <p className="mt-2 text-[var(--leaf-dark)]">{preview.title}</p>
        <p className="mt-1 text-[var(--muted)]">{preview.description}</p>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <SeoSettingsForm
          action={saveEntitySeo.bind(null, entityParam)}
          defaults={ctx.defaults}
          settings={ctx.settings}
        />
      </section>
    </main>
  );
}
