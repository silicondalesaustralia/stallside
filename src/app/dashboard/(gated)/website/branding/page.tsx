import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { parseAccentColor } from "@/lib/stand-brand";
import WebStudioSteps from "@/components/website/WebStudioSteps";
import BrandingForm from "./BrandingForm";

export default async function WebsiteBrandingPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { owner } = await requireOwner();
  const sp = await searchParams;
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const stand = await prisma.stand.findFirst({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "asc" },
    select: { logoUrl: true, accentColor: true, secondaryColor: true },
  });
  const logoUrl = owner.brandLogoUrl ?? stand?.logoUrl ?? null;
  const overrides = parseStorefrontConfig(storefront.draftConfig).themeOverrides;
  const accentColor =
    parseAccentColor(overrides?.accentColor) ??
    parseAccentColor(owner.brandAccentColor) ??
    parseAccentColor(stand?.accentColor) ??
    "#2e7d3f";
  const secondaryColor =
    parseAccentColor(overrides?.secondaryColor) ??
    parseAccentColor(owner.brandSecondaryColor) ??
    parseAccentColor(stand?.secondaryColor) ??
    accentColor;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 pb-12">
      <WebStudioSteps />
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Branding
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Logo, colours, favicon and hero. Change colours anytime — AI uses them
          when recommending looks.
        </p>
      </div>

      {sp.saved ? (
        <p className="text-sm font-medium text-[var(--ok)]">Branding saved.</p>
      ) : null}
      {sp.error ? (
        <p className="text-sm font-medium text-red-700">
          Couldn&apos;t save branding. Try another image.
        </p>
      ) : null}

      <BrandingForm
        logoUrl={logoUrl}
        faviconUrl={storefront.faviconUrl}
        heroImageUrl={storefront.heroImageUrl}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
      />

      <p className="text-sm text-[var(--muted)]">
        Next:{" "}
        <Link href="/dashboard/website/ai" className="font-medium underline">
          AI builder
        </Link>{" "}
        to draft your site, or skip to{" "}
        <Link href="/dashboard/website/studio" className="font-medium underline">
          Edit layout
        </Link>
        .
      </p>
    </main>
  );
}
