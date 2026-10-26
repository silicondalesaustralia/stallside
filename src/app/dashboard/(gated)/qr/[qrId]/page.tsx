import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { APP_DOMAIN } from "@/lib/constants";
import { standQrDataUrl } from "@/lib/stand-qr";
import { qrShortUrl } from "@/lib/qr-short-link";
import { standPaymentBrands, withSquarePaymentsReady } from "@/lib/stand-payment-brands";
import { publicApexHost } from "@/lib/tenancy/host-mode";
import { resolvePoster } from "@/lib/qr/poster";
import { loadPosterExtras } from "@/lib/qr/poster-extras";
import { standPosterBrand } from "@/lib/storefront/stand-brand-source";
import { listQrTargets } from "@/lib/qr/targets";
import { legacyQrTarget, parseQrTarget } from "@/lib/qr/target-types";
import QrCodeStudio from "@/components/qr/designer/QrCodeStudio";
import QrDestinationCard from "@/components/qr/designer/QrDestinationCard";

export default async function WebsiteQrDetailPage({ params }: { params: Promise<{ qrId: string }> }) {
  const { qrId } = await params;
  const { owner, user } = await requireOwner();

  const qr = await prisma.qrCode.findFirst({
    where: { id: qrId, ownerId: owner.id },
    include: {
      stand: {
        select: {
          id: true, name: true, description: true, locationLabel: true, qrCallout: true, qrSignMessage: true,
          posterShowCta: true, posterCtaText: true, posterShowBundles: true, posterShowFirstOrder: true,
          posterShowInstructions: true, posterShowFreshness: true, posterShowHowItWorks: true,
          slug: true, logoUrl: true, accentColor: true, secondaryColor: true,
          acceptCash: true, acceptLocalTransfer: true, acceptCard: true, acceptPayPal: true, acceptSquare: true,
          localTransferAlias: true, localTransferMethodId: true, currency: true,
        },
      },
    },
  });
  if (!qr) notFound();

  const qrUrl = qrShortUrl(qr.id);
  const [qrDataUrl, options, extras, squareReady, posterBrand] = await Promise.all([
    standQrDataUrl(qrUrl, 640),
    listQrTargets(owner.id),
    loadPosterExtras(qr.stand.id),
    withSquarePaymentsReady({ ...owner, user: { email: user.email, role: user.role } }),
    standPosterBrand(qr.stand),
  ]);
  const apex = publicApexHost();
  const target = parseQrTarget(qr.targetKind, qr.targetId) ?? legacyQrTarget(qr.linkMode, qr.categoryId);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 print:max-w-none print:gap-0 print:px-0">
      <p className="text-sm text-[var(--muted)] print:hidden">
        <Link href="/dashboard/qr" className="underline">
          QR codes
        </Link>
        {" · "}
        {qr.name}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight print:hidden">
        {qr.name}
      </h1>

      <div className="print:hidden">
        <QrDestinationCard qrId={qr.id} target={target} options={options} />
      </div>

      <QrCodeStudio
        qrId={qr.id}
        initialName={qr.name}
        initialAtStall={qr.atStall}
        initialPoster={resolvePoster(qr.poster, qr.stand)}
        qrUrl={qrUrl}
        qrDataUrl={qrDataUrl}
        fileName={`${qr.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`}
        brand={{
          siteUrl: apex ? `https://${apex}` : `https://${APP_DOMAIN}`,
          paymentBrands: standPaymentBrands(qr.stand, squareReady),
          ...posterBrand,
        }}
        extras={extras}
      />
    </main>
  );
}
