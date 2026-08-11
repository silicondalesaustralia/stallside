import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import DemoPreOrderPanel from "@/components/DemoPreOrderPanel";
import DemoStandPanel from "@/components/DemoStandPanel";
import MarketingPageShell from "@/components/MarketingPageShell";
import {
  DEMO_PRODUCTS,
  demoCustomerUrlForProduct,
  demoPreOrderPageSlug,
  demoStandSlugForProduct,
  isDemoProduct,
  type DemoProduct,
} from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { APP_DOMAIN, APP_NAME } from "@/lib/constants";
import { standCheckoutUrl, standQrDataUrl } from "@/lib/stand-qr";
import { demoSignPaymentBrands } from "@/lib/stand-payment-brands";

export const metadata: Metadata = {
  title: "Try Demo",
  description: `Try a live ${APP_NAME} stall checkout or pre-order link - same tools owners use.`,
  alternates: { canonical: "/demo" },
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const params = await searchParams;
  const product: DemoProduct | null = isDemoProduct(params.product)
    ? params.product
    : null;

  const productMeta = product
    ? DEMO_PRODUCTS.find((p) => p.id === product)
    : null;
  const slug = product ? demoStandSlugForProduct(product) : null;
  const stand = slug
    ? await prisma.stand.findUnique({
        where: { slug },
        include: {
          owner: { include: { user: { select: { email: true, role: true } } } },
        },
      })
    : null;

  let panel: ReactNode = null;
  if (product && !slug) {
    panel = (
      <SetupHint
        title="Demo stand not configured"
        body={`Set ${productMeta?.envKey ?? "DEMO_*_STAND_SLUG"} in the environment to a stand slug from your admin account.`}
      />
    );
  } else if (
    product === "preorder" &&
    slug &&
    !demoPreOrderPageSlug()
  ) {
    panel = (
      <SetupHint
        title="Demo pre-order page not configured"
        body="Set DEMO_PREORDER_PAGE_SLUG to the public pre-order page slug (e.g. pre-order-bread-27-may-2027)."
      />
    );
  } else if (product && slug && (!stand || !stand.isActive)) {
    panel = (
      <SetupHint
        title="Demo stand not found"
        body={`Create an active stand with slug “${slug}”, then refresh this page.`}
      />
    );
  } else if (stand && product) {
    const checkoutUrl =
      product === "preorder"
        ? demoCustomerUrlForProduct(product)
        : standCheckoutUrl(stand.slug);
    if (!checkoutUrl) {
      panel = (
        <SetupHint
          title="Demo link not configured"
          body="Check DEMO_* environment variables."
        />
      );
    } else if (product === "preorder") {
      const pageSlug = demoPreOrderPageSlug()!;
      const page = await prisma.preOrderPage.findFirst({
        where: {
          standId: stand.id,
          slug: pageSlug,
          isActive: true,
        },
        select: { title: true },
      });
      if (!page) {
        panel = (
          <SetupHint
            title="Demo pre-order page not found"
            body={`Create an active pre-order page with slug “${pageSlug}” on “${stand.name}”, then refresh.`}
          />
        );
      } else {
        const qrDataUrl = await standQrDataUrl(checkoutUrl, 640);
        panel = (
          <DemoPreOrderPanel
            name={page.title}
            product={product}
            checkoutUrl={checkoutUrl}
            qrDataUrl={qrDataUrl}
          />
        );
      }
    } else {
      const qrDataUrl = await standQrDataUrl(checkoutUrl, 640);
      const owner = {
        ...stand.owner,
        user: stand.owner.user,
      };
      const paymentBrands = demoSignPaymentBrands(stand, owner);
      panel = (
        <DemoStandPanel
          name={stand.name}
          product={product}
          qrCallout={stand.qrCallout}
          qrSignMessage={stand.qrSignMessage}
          description={stand.description}
          locationLabel={stand.locationLabel}
          checkoutUrl={checkoutUrl}
          qrDataUrl={qrDataUrl}
          siteUrl={`https://${APP_DOMAIN}`}
          paymentBrands={paymentBrands}
        />
      );
    }
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
        <p className="mt-3 max-w-2xl text-base leading-snug text-[var(--muted)]">
          Pick stall checkout or pre-orders - then walk through it as a
          customer.
        </p>

        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold text-[var(--field)]">
            1. Choose a product
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {DEMO_PRODUCTS.map((item) => {
              const selected = product === item.id;
              return (
                <Link
                  key={item.id}
                  href={`/demo?product=${item.id}`}
                  className={`rounded-[var(--radius)] border px-4 py-4 transition ${
                    selected
                      ? "border-[var(--leaf)] bg-[var(--leaf)]/5 shadow-sm"
                      : "border-[var(--line)] bg-white hover:border-[var(--leaf)]"
                  }`}
                >
                  <span className="block font-semibold text-[var(--field)]">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--muted)]">
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {product ? (
          <div className="mt-10">
            <p className="mb-3 text-sm font-semibold text-[var(--field)]">
              {product === "preorder"
                ? "2. Share the customer link or QR"
                : "2. Scan the QR as the customer"}
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
