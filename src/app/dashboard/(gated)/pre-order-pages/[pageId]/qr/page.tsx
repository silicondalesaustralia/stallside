import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { appBaseUrl } from "@/lib/app-url";
import { formatCollectionLabel } from "@/lib/pre-order";
import { preOrderPagePath } from "@/lib/preorder-page";
import { standQrDataUrl } from "@/lib/stand-qr";
import { publicStandBranding } from "@/lib/public-stand-branding";
import PreOrderQrWorkspace from "./PreOrderQrWorkspace";

export default async function PreOrderPageQrPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const { owner } = await requireOwner();
  const page = await prisma.preOrderPage.findFirst({
    where: { id: pageId, ownerId: owner.id },
    include: {
      stand: {
        include: { owner: true },
      },
    },
  });
  if (!page) notFound();

  const orderUrl = `${appBaseUrl()}${preOrderPagePath(page.stand.slug, page.slug)}`;
  const qrDataUrl = await standQrDataUrl(orderUrl, 640);
  const branded = publicStandBranding(page.stand, page.stand.owner);
  const collectionLabel = formatCollectionLabel(page.collectionAt);
  const note =
    page.collectionNote?.trim() ||
    page.description?.trim() ||
    null;

  const sheet = {
    standName: page.stand.name,
    pageTitle: page.title,
    collectionLabel,
    note,
    orderUrl,
    qrDataUrl,
    logoUrl: branded.logoUrl,
    accentColor: branded.accentColor,
    secondaryColor: branded.secondaryColor,
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 print:max-w-none print:gap-0">
      <p className="text-sm text-[var(--muted)] print:hidden">
        <Link href="/dashboard/pre-order-pages" className="underline">
          Pre-order pages
        </Link>
        {" · "}
        <Link
          href={`/dashboard/pre-order-pages/${page.id}`}
          className="underline"
        >
          {page.title}
        </Link>
      </p>
      <div className="print:hidden">
        <h1 className="text-3xl font-semibold tracking-tight">
          Pre-order page QR
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Unique code for this sheet - opens the pre-order page, not the main
          business catalog.
        </p>
      </div>
      <PreOrderQrWorkspace
        sheet={sheet}
        orderUrl={orderUrl}
        qrDataUrl={qrDataUrl}
        fileName={`${page.slug}-preorder-qr.png`}
      />
    </main>
  );
}
