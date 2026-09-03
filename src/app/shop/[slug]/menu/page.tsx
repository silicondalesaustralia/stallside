import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { shopHomePath, shopMenuPath } from "@/lib/menu";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  try {
    await loadStorefrontPage(slug, sp.draft === "1");
    return { title: "Menus" };
  } catch {
    return { title: "Menus", robots: { index: false, follow: false } };
  }
}

export default async function ShopMenusIndexPage({
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
  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const basePath = await currentStorefrontBasePath(ctx.storefront.slug);

  const menus = await prisma.menu.findMany({
    where: {
      ownerId: ctx.owner.id,
      standId: ctx.stand.id,
      isActive: true,
      showOnShop: true,
    },
    orderBy: [{ kind: "asc" }, { title: "asc" }],
    select: {
      slug: true,
      title: true,
      description: true,
      kind: true,
      orderByAt: true,
    },
  });

  const openMenus = menus.filter(
    (m) =>
      m.kind === MenuKind.ALWAYS_AVAILABLE ||
      (m.orderByAt && m.orderByAt.getTime() > Date.now()),
  );

  return (
    <StorefrontPageShell ctx={ctx} draft={draft} activePage="menu">
      <div className="storefront-page-content storefront-page-content--narrow">
        <Link
          href={shopHomePath(ctx.storefront.slug, draft, basePath)}
          className="text-sm font-semibold text-[var(--leaf-dark)] underline"
        >
          ← Home
        </Link>
        <h1 className={`mt-4 text-3xl font-bold ${studioCtx.active ? "studio-heading" : "font-[family-name:var(--font-display)]"}`}>
          Menus
        </h1>
        {openMenus.length === 0 ? (
          <p className="mt-4 text-[var(--muted)]">No menus available right now.</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {openMenus.map((menu) => (
              <li key={menu.slug}>
                <Link
                  href={shopMenuPath(ctx.storefront.slug, menu.slug, draft, basePath)}
                  className="block rounded-[var(--studio-card-radius,1rem)] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-card,none)]"
                >
                  <p className="font-semibold text-[var(--field)]">{menu.title}</p>
                  {menu.description ? (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {menu.description}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StorefrontPageShell>
  );
}
