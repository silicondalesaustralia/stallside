import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { APP_DOMAIN } from "@/lib/constants";
import { standCheckoutUrl, standQrDataUrl } from "@/lib/stand-qr";
import { standPaymentBrands } from "@/lib/stand-payment-brands";
import { parsePriceTiers } from "@/lib/price-tiers";
import { formatMoney } from "@/lib/public-product";
import QrPrintEditor from "./QrPrintEditor";
import QrWorkspace from "./QrWorkspace";

export default async function StandQrPage({
  params,
}: {
  params: Promise<{ standId: string }>;
}) {
  const { standId } = await params;
  const { owner, user } = await requireOwner();
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
    include: {
      products: {
        where: { isArchived: false, isActive: true, isHidden: false },
        orderBy: { sortOrder: "asc" },
        take: 12,
      },
    },
  });
  if (!stand) notFound();

  const checkoutUrl = standCheckoutUrl(stand.slug);
  const qrDataUrl = await standQrDataUrl(checkoutUrl, 640);
  const siteUrl = `https://${APP_DOMAIN}`;
  const paymentBrands = standPaymentBrands(stand, {
    ...owner,
    user: { email: user.email, role: user.role },
  });

  const bundleLines: string[] = [];
  if (stand.posterShowBundles) {
    for (const p of stand.products) {
      const tiers = parsePriceTiers(p.priceTiers);
      if (!tiers.length) continue;
      const parts = tiers.map(
        (t) => `${t.qty}× ${formatMoney(t.totalCents, stand.currency)}`,
      );
      bundleLines.push(`${p.name}: ${parts.join(" · ")}`);
    }
  }

  const freshnessLines = stand.posterShowFreshness
    ? stand.products
        .map((p) => p.freshnessNote?.trim())
        .filter((n): n is string => Boolean(n))
        .slice(0, 4)
    : [];

  let firstOrderLine: string | null = null;
  if (stand.posterShowFirstOrder && stand.firstOrderDiscountEnabled) {
    firstOrderLine =
      stand.firstOrderDiscountAmountCents != null &&
      stand.firstOrderDiscountAmountCents > 0
        ? `First time? Get ${formatMoney(stand.firstOrderDiscountAmountCents, stand.currency)} off — enter your email at checkout.`
        : `First time? Get ${stand.firstOrderDiscountPercent}% off — enter your email at checkout.`;
  }

  const sheet = {
    name: stand.name,
    qrCallout: stand.qrCallout,
    qrSignMessage: stand.qrSignMessage,
    description: stand.description,
    locationLabel: stand.locationLabel,
    checkoutUrl,
    qrDataUrl,
    siteUrl,
    paymentBrands,
    logoUrl: stand.logoUrl,
    accentColor: stand.accentColor,
    secondaryColor: stand.secondaryColor,
    showPosterCta: stand.posterShowCta,
    posterCtaText: stand.posterCtaText,
    bundleLines,
    firstOrderLine,
    freshnessLines,
    showHowItWorks: stand.posterShowHowItWorks,
    showInstructions: stand.posterShowInstructions,
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 print:max-w-none print:gap-0">
      <p className="text-sm text-[var(--muted)] print:hidden">
        <Link href="/dashboard/stands" className="underline">
          My stands
        </Link>
        {" · "}
        <Link href={`/dashboard/stands/${stand.id}`} className="underline">
          {stand.name}
        </Link>
      </p>

      <QrWorkspace
        sheet={sheet}
        checkoutUrl={checkoutUrl}
        qrDataUrl={qrDataUrl}
        fileName={`${stand.slug}-qr.png`}
        urlWarning={
          !checkoutUrl.startsWith("https://") ? (
            <p className="mb-3 rounded-lg border border-[var(--warn)]/40 bg-[var(--panel)] px-3 py-2 text-sm text-[var(--warn)]">
              This QR still points at a local URL. Set{" "}
              <code className="font-receipt">
                NEXT_PUBLIC_APP_URL=https://{APP_DOMAIN}
              </code>{" "}
              in production and regenerate before printing.
            </p>
          ) : null
        }
      />

      <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4 print:hidden">
        <QrPrintEditor stand={stand} />
      </div>
    </main>
  );
}
