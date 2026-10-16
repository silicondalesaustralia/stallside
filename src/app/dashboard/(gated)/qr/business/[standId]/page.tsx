import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { APP_DOMAIN } from "@/lib/constants";
import { standCheckoutUrl, standQrDataUrl } from "@/lib/stand-qr";
import { standPaymentBrands } from "@/lib/stand-payment-brands";
import { loadPosterExtras } from "@/lib/qr/poster-extras";
import QrStudio from "@/app/dashboard/(gated)/businesses/[standId]/qr/QrStudio";

export default async function BusinessQrPage({ params }: { params: Promise<{ standId: string }> }) {
  const { standId } = await params;
  const { owner, user } = await requireOwner();
  const stand = await prisma.stand.findFirst({ where: { id: standId, ownerId: owner.id } });
  if (!stand) notFound();

  const checkoutUrl = standCheckoutUrl(stand.slug, stand.cartMode);
  const [qrDataUrl, extras] = await Promise.all([standQrDataUrl(checkoutUrl, 640), loadPosterExtras(stand.id)]);
  const paymentBrands = standPaymentBrands(stand, { ...owner, user: { email: user.email, role: user.role } });

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 print:max-w-none print:gap-0 print:px-0">
      <div className="flex flex-wrap items-baseline justify-between gap-3 print:hidden">
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/qr" className="underline">
            QR codes
          </Link>
          {" · "}
          {stand.name} (main QR)
        </p>
        <Link href={`/dashboard/qr/business/${stand.id}/duplicate`} className="text-sm underline">
          Duplicate for another page
        </Link>
      </div>
      <p className="text-sm text-[var(--muted)] print:hidden">
        This is your business&apos;s main QR code. Posters already printed with it keep working.
      </p>

      <QrStudio
        stand={{
          id: stand.id,
          name: stand.name,
          description: stand.description,
          locationLabel: stand.locationLabel,
          qrSignMessage: stand.qrSignMessage,
          qrCallout: stand.qrCallout,
          cartMode: stand.cartMode,
          posterShowCta: stand.posterShowCta,
          posterCtaText: stand.posterCtaText,
          posterShowBundles: stand.posterShowBundles,
          posterShowFirstOrder: stand.posterShowFirstOrder,
          posterShowInstructions: stand.posterShowInstructions,
          posterShowFreshness: stand.posterShowFreshness,
          posterShowHowItWorks: stand.posterShowHowItWorks,
          slug: stand.slug,
          logoUrl: stand.logoUrl,
          accentColor: stand.accentColor,
          secondaryColor: stand.secondaryColor,
        }}
        siteUrl={`https://${APP_DOMAIN}`}
        paymentBrands={paymentBrands}
        initialCheckoutUrl={checkoutUrl}
        initialQrDataUrl={qrDataUrl}
        fileName={`${stand.slug}-qr.png`}
        bundleLines={extras.bundleLines}
        firstOrderLine={extras.firstOrderLine}
        freshnessLines={extras.freshnessLines}
        urlWarning={
          !checkoutUrl.startsWith("https://") ? (
            <p className="mb-3 rounded-lg border border-[var(--warn)]/40 bg-[var(--panel)] px-3 py-2 text-sm text-[var(--warn)]">
              This QR still points at a local URL. Set{" "}
              <code className="font-receipt">NEXT_PUBLIC_APP_URL=https://{APP_DOMAIN}</code> in production and
              regenerate before printing.
            </p>
          ) : null
        }
      />
    </main>
  );
}
