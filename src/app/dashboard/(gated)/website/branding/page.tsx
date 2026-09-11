import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ensureStorefront } from "@/lib/catalogue/storefront";
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
    select: { logoUrl: true },
  });
  const logoUrl = owner.brandLogoUrl ?? stand?.logoUrl ?? null;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 pb-12">
      <WebStudioSteps />
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
          Branding
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Logo, favicon and hero photo. Colours and fonts are chosen when you
          build with AI.
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
