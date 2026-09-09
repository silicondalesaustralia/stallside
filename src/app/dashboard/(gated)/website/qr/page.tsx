import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NoBusinessYet from "@/components/NoBusinessYet";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import { standQrTargetUrl } from "@/lib/stand-qr";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";

export default async function WebsiteQrListPage() {
  const { owner } = await requireOwner();

  const [stands, storefront, qrCodes, categories] = await Promise.all([
    prisma.stand.findMany({
      where: { ownerId: owner.id, isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        cartMode: true,
        qrLinkMode: true,
        qrCategory: { select: { title: true, slug: true } },
      },
    }),
    prisma.storefront.findUnique({
      where: { ownerId: owner.id },
      select: { id: true, slug: true },
    }),
    prisma.qrCode.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        linkMode: true,
        category: { select: { title: true } },
        stand: { select: { name: true } },
      },
    }),
    prisma.category.count({
      where: { ownerId: owner.id, isActive: true },
    }),
  ]);

  if (stands.length === 0) {
    return (
      <main className="flex flex-col gap-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          QR codes
        </h1>
        <NoBusinessYet />
      </main>
    );
  }

  const primaryCustomHostname = storefront
    ? await loadPrimaryCustomHostname(storefront.id)
    : null;

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            QR codes
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
            Print posters that open your website — whole shop or a category like
            “Farm Stand”. Same business, different doors.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/website/qr/new">
          + New QR code
        </DashPrimaryCta>
      </div>

      {categories === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Tip: create a category (e.g. Farm Stand) under{" "}
          <Link href="/dashboard/categories" className="underline">
            Categories
          </Link>
          , add products, then make a QR for that shelf.
        </p>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          Primary business QR
        </h2>
        <ul className="flex flex-col gap-3">
          {stands.map((stand) => {
            const target = standQrTargetUrl({
              linkMode: stand.qrLinkMode,
              standSlug: stand.slug,
              cartMode: stand.cartMode,
              storefrontSlug: storefront?.slug,
              categorySlug: stand.qrCategory?.slug,
              primaryCustomHostname,
            });
            const destLabel =
              stand.qrLinkMode === "WEBSITE_CATEGORY" && stand.qrCategory
                ? `Category · ${stand.qrCategory.title}`
                : stand.qrLinkMode === "WEBSITE_HOME"
                  ? "Website home"
                  : "Stand checkout";
            return (
              <li
                key={stand.id}
                className="dash-card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-semibold text-[var(--ink)]">{stand.name}</p>
                  <p className="text-sm text-[var(--muted)]">{destLabel}</p>
                  <p className="mt-1 truncate font-receipt text-xs text-[var(--muted)]">
                    {target}
                  </p>
                </div>
                <Link
                  href={`/dashboard/businesses/${stand.id}/qr`}
                  className="text-sm font-semibold text-[var(--leaf-dark)] underline"
                >
                  Edit &amp; print
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          Extra QR codes
        </h2>
        {qrCodes.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No extra codes yet. Create one for a category poster.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {qrCodes.map((qr) => (
              <li
                key={qr.id}
                className="dash-card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-semibold text-[var(--ink)]">{qr.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {qr.linkMode === "WEBSITE_CATEGORY" && qr.category
                      ? `Category · ${qr.category.title}`
                      : "Website home"}
                    {" · "}
                    {qr.stand.name}
                  </p>
                </div>
                <Link
                  href={`/dashboard/website/qr/${qr.id}`}
                  className="text-sm font-semibold text-[var(--leaf-dark)] underline"
                >
                  Edit &amp; print
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
