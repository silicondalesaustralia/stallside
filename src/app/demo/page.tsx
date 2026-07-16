import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import DemoRegionPicker from "@/components/DemoRegionPicker";
import DemoStandPanel from "@/components/DemoStandPanel";
import MarketingPageShell from "@/components/MarketingPageShell";
import {
  DEMO_REGIONS,
  demoStandSlugForRegion,
  isDemoRegion,
  type DemoRegion,
} from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import { standCheckoutUrl, standQrDataUrl } from "@/lib/stand-qr";
import { standOffersCard, standPaymentBrands } from "@/lib/stand-payment-brands";

export const metadata: Metadata = {
  title: "Try Demo",
  description: `Scan a live ${APP_NAME} QR and try checkout — cash, PayID, or Stripe test cards.`,
  alternates: { canonical: "/demo" },
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const params = await searchParams;
  const region: DemoRegion | null = isDemoRegion(params.region)
    ? params.region
    : null;

  const slug = region ? demoStandSlugForRegion(region) : null;
  const stand = slug
    ? await prisma.stand.findUnique({
        where: { slug },
        include: {
          owner: { include: { user: { select: { email: true, role: true } } } },
        },
      })
    : null;

  const regionMeta = region
    ? DEMO_REGIONS.find((r) => r.id === region)
    : null;

  let panel: ReactNode = null;
  if (region && !slug) {
    panel = (
      <SetupHint
        title="Demo stand not configured"
        body={`Set ${regionMeta?.envKey ?? "DEMO_STAND_SLUG_*"} in the environment to a stand slug from your admin account.`}
      />
    );
  } else if (region && slug && (!stand || !stand.isActive)) {
    panel = (
      <SetupHint
        title="Demo stand not found"
        body={`Create an active stand with slug “${slug}”, then refresh this page.`}
      />
    );
  } else if (stand) {
    const checkoutUrl = standCheckoutUrl(stand.slug);
    const qrDataUrl = await standQrDataUrl(checkoutUrl, 480);
    const owner = {
      ...stand.owner,
      user: stand.owner.user,
    };
    const paymentBrands = standPaymentBrands(stand, owner);
    panel = (
      <DemoStandPanel
        name={stand.name}
        checkoutUrl={checkoutUrl}
        qrDataUrl={qrDataUrl}
        paymentBrands={paymentBrands}
        cardDemoReady={standOffersCard(stand, owner)}
      />
    );
  }

  return (
    <MarketingPageShell>
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-[var(--muted)]">
          <Link href="/" className="underline">
            Home
          </Link>
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Try the demo
        </h1>
        <p className="mt-3 text-base leading-snug text-[var(--muted)]">
          Pick your country, then scan the QR for Green Valley Eggs on your phone
          or open checkout in this browser. Card payments use Stripe test mode —
          no real money.
        </p>

        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold text-[var(--field)]">
            1. Select your country
          </p>
          <DemoRegionPicker selected={region} />
        </div>

        {region ? (
          <div className="mt-10">
            <p className="mb-3 text-sm font-semibold text-[var(--field)]">
              2. Scan or open checkout
            </p>
            {panel}
          </div>
        ) : null}
      </main>
    </MarketingPageShell>
  );
}

function SetupHint({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--warn)]/40 bg-[var(--panel)] px-4 py-4 text-sm text-[var(--ink)]">
      <p className="font-semibold text-[var(--field)]">{title}</p>
      <p className="mt-1 text-[var(--muted)]">{body}</p>
    </div>
  );
}
