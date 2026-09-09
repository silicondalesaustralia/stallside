import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { APP_DOMAIN } from "@/lib/constants";
import { standQrDataUrl, standQrTargetUrl } from "@/lib/stand-qr";
import { standPaymentBrands, withSquarePaymentsReady } from "@/lib/stand-payment-brands";
import { publicApexHost } from "@/lib/tenancy/host-mode";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import CategoryQrStudio from "./CategoryQrStudio";

export default async function WebsiteQrDetailPage({
  params,
}: {
  params: Promise<{ qrId: string }>;
}) {
  const { qrId } = await params;
  const { owner, user } = await requireOwner();

  const qr = await prisma.qrCode.findFirst({
    where: { id: qrId, ownerId: owner.id },
    include: {
      category: { select: { id: true, slug: true, title: true } },
      stand: {
        select: {
          id: true,
          name: true,
          slug: true,
          cartMode: true,
          locationLabel: true,
          logoUrl: true,
          accentColor: true,
          secondaryColor: true,
          acceptCash: true,
          acceptLocalTransfer: true,
          acceptCard: true,
          acceptPayPal: true,
          acceptSquare: true,
          localTransferAlias: true,
          localTransferMethodId: true,
          currency: true,
        },
      },
    },
  });
  if (!qr) notFound();

  const storefront = await prisma.storefront.findUnique({
    where: { ownerId: owner.id },
    select: { id: true, slug: true },
  });
  const primaryCustomHostname = storefront
    ? await loadPrimaryCustomHostname(storefront.id)
    : null;

  const checkoutUrl = standQrTargetUrl({
    linkMode: qr.linkMode,
    standSlug: qr.stand.slug,
    cartMode: qr.stand.cartMode,
    storefrontSlug: storefront?.slug,
    categorySlug: qr.category?.slug,
    primaryCustomHostname,
  });
  const qrDataUrl = await standQrDataUrl(checkoutUrl, 640);
  const siteUrl = `https://${publicApexHost()}`;
  const paymentBrands = standPaymentBrands(
    qr.stand,
    await withSquarePaymentsReady({
      ...owner,
      user: { email: user.email, role: user.role },
    }),
  );

  const destinationLabel =
    qr.linkMode === "WEBSITE_CATEGORY" && qr.category
      ? `Category · ${qr.category.title}`
      : "Website home";

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 print:max-w-none print:gap-0 print:px-0">
      <p className="text-sm text-[var(--muted)] print:hidden">
        <Link href="/dashboard/website/qr" className="underline">
          QR codes
        </Link>
        {" · "}
        {qr.name}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight print:hidden">
        {qr.name}
      </h1>

      <CategoryQrStudio
        qrId={qr.id}
        name={qr.name}
        destinationLabel={destinationLabel}
        checkoutUrl={checkoutUrl}
        qrDataUrl={qrDataUrl}
        fileName={`${qr.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`}
        siteUrl={siteUrl || `https://${APP_DOMAIN}`}
        paymentBrands={paymentBrands}
        standName={qr.stand.name}
        locationLabel={qr.stand.locationLabel}
        logoUrl={qr.stand.logoUrl}
        accentColor={qr.stand.accentColor}
        secondaryColor={qr.stand.secondaryColor}
      />
    </main>
  );
}
