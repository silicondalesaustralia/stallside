import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NoBusinessYet from "@/components/NoBusinessYet";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { listOwnerQrCodes } from "@/lib/qr/owner-codes";
import BusinessQrList from "./BusinessQrList";
import QrCodeList from "./QrCodeList";

export default async function WebsiteQrListPage() {
  const { owner } = await requireOwner();

  const [stands, storefront, codes] = await Promise.all([
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
    prisma.storefront.findUnique({ where: { ownerId: owner.id }, select: { id: true, slug: true } }),
    listOwnerQrCodes(owner.id),
  ]);

  if (stands.length === 0) {
    return (
      <main className="flex flex-col gap-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">QR codes</h1>
        <NoBusinessYet />
      </main>
    );
  }

  const primaryCustomHostname = storefront ? await loadPrimaryCustomHostname(storefront.id) : null;
  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">QR codes</h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
            Print posters that open any page of your online store: a category like &ldquo;Farm Stand&rdquo;, a
            product, a menu or your checkout. Each QR code gets its own poster.
          </p>
        </div>
        <DashPrimaryCta href="/dashboard/qr/new">+ New QR code</DashPrimaryCta>
      </div>

      <BusinessQrList
        stands={stands}
        storefrontSlug={storefront?.slug ?? null}
        primaryCustomHostname={primaryCustomHostname}
      />
      <QrCodeList codes={codes} />
    </main>
  );
}
