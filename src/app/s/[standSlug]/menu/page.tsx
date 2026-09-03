import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { standCatalogPath, standMenuDetailPath } from "@/lib/stand-seo";
import StandStoreHeader from "../StandStoreHeader";

export const metadata: Metadata = {
  title: "Menus",
};

export default async function PublicStandMenusIndexPage({
  params,
}: {
  params: Promise<{ standSlug: string }>;
}) {
  const { standSlug } = await params;
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const stand = await prisma.stand.findUnique({
    where: { slug },
    include: { owner: true },
  });
  if (!stand || !stand.isActive) notFound();

  const menus = await prisma.menu.findMany({
    where: {
      standId: stand.id,
      isActive: true,
      showOnStand: true,
    },
    orderBy: [{ kind: "asc" }, { title: "asc" }],
    select: {
      slug: true,
      title: true,
      description: true,
      kind: true,
      collectionAt: true,
      orderByAt: true,
    },
  });

  const branded = publicStandBranding(stand, stand.owner);
  const openMenus = menus.filter(
    (m) =>
      m.kind === MenuKind.ALWAYS_AVAILABLE ||
      (m.orderByAt && m.orderByAt.getTime() > Date.now()),
  );

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-10 pt-8"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      <StandStoreHeader
        standName={stand.name}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
        locationLabel={stand.locationLabel}
        backHref={standCatalogPath(stand.slug)}
        backLabel="← All products"
      />
      <h2 className="mt-8 text-2xl font-semibold tracking-tight">Menus</h2>
      {openMenus.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          No menus available right now.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {openMenus.map((menu) => (
            <li key={menu.slug}>
              <Link
                href={standMenuDetailPath(stand.slug, menu.slug)}
                className="block rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"
              >
                <p className="font-medium">{menu.title}</p>
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
    </main>
  );
}
