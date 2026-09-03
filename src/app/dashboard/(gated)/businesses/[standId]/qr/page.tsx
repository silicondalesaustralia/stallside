import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { APP_DOMAIN } from "@/lib/constants";
import { standQrDataUrl, standQrTargetUrl } from "@/lib/stand-qr";
import { standPaymentBrands } from "@/lib/stand-payment-brands";
import { parsePriceTiers } from "@/lib/price-tiers";
import { formatMoney } from "@/lib/public-product";
import { businessPageProductWhere } from "@/lib/product-visibility";
import { publicApexHost } from "@/lib/tenancy/host-mode";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import QrStudio from "./QrStudio";

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
      qrCategory: { select: { id: true, slug: true, title: true } },
      products: {
        where: {
          ...businessPageProductWhere,
          isActive: true,
          isPreOrder: false,
        },
        orderBy: { sortOrder: "asc" },
        take: 12,
      },
    },
  });
  if (!stand) notFound();

  const storefront = await prisma.storefront.findUnique({
    where: { ownerId: owner.id },
    select: { id: true, slug: true },
  });
  const categories = await prisma.category.findMany({
    where: { ownerId: owner.id, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: { id: true, slug: true, title: true },
  });
  const primaryCustomHostname = storefront
    ? await loadPrimaryCustomHostname(storefront.id)
    : null;

  const checkoutUrl = standQrTargetUrl({
    linkMode: stand.qrLinkMode,
    standSlug: stand.slug,
    cartMode: stand.cartMode,
    storefrontSlug: storefront?.slug,
    categorySlug: stand.qrCategory?.slug,
    primaryCustomHostname,
  });
  const qrDataUrl = await standQrDataUrl(checkoutUrl, 640);
  const siteUrl = `https://${publicApexHost()}`;
  const paymentBrands = standPaymentBrands(stand, {
    ...owner,
    user: { email: user.email, role: user.role },
  });

  const bundleLines: string[] = [];
  for (const p of stand.products) {
    const tiers = parsePriceTiers(p.priceTiers);
    if (!tiers.length) continue;
    const parts = tiers.map(
      (t) => `${t.qty}× ${formatMoney(t.totalCents, stand.currency)}`,
    );
    bundleLines.push(`${p.name}: ${parts.join(" · ")}`);
  }

  const freshnessLines = stand.products
    .map((p) => p.freshnessNote?.trim())
    .filter((n): n is string => Boolean(n))
    .slice(0, 4);

  let firstOrderLine: string | null = null;
  if (stand.firstOrderDiscountEnabled) {
    firstOrderLine =
      stand.firstOrderDiscountAmountCents != null &&
      stand.firstOrderDiscountAmountCents > 0
        ? `First time? Get ${formatMoney(stand.firstOrderDiscountAmountCents, stand.currency)} off - enter your email at checkout.`
        : `First time? Get ${stand.firstOrderDiscountPercent}% off - enter your email at checkout.`;
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 print:max-w-none print:gap-0 print:px-0">
      <p className="text-sm text-[var(--muted)] print:hidden">
        <Link href="/dashboard/businesses" className="underline">
          My Businesses
        </Link>
        {" · "}
        <Link href={`/dashboard/businesses/${stand.id}`} className="underline">
          {stand.name}
        </Link>
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
          qrLinkMode: stand.qrLinkMode,
          qrCategoryId: stand.qrCategoryId,
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
        storefrontSlug={storefront?.slug ?? null}
        categories={categories}
        primaryCustomHostname={primaryCustomHostname}
        siteUrl={siteUrl}
        paymentBrands={paymentBrands}
        initialCheckoutUrl={checkoutUrl}
        initialQrDataUrl={qrDataUrl}
        fileName={`${stand.slug}-qr.png`}
        bundleLines={bundleLines}
        firstOrderLine={firstOrderLine}
        freshnessLines={freshnessLines}
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
    </main>
  );
}
