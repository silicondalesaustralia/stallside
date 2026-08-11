import type { Metadata } from "next";
import Link from "next/link";
import DemoPhoneCheckout from "@/components/DemoPhoneCheckout";
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
import { APP_NAME } from "@/lib/constants";
import { standCheckoutUrl } from "@/lib/stand-qr";

export const metadata: Metadata = {
  title: "Demo checkout",
  description: `Try ${APP_NAME} checkout in a phone frame - cash, PayID, or Stripe test cards.`,
  alternates: { canonical: "/demo/phone" },
};

export default async function DemoPhonePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const params = await searchParams;
  const product: DemoProduct | null = isDemoProduct(params.product)
    ? params.product
    : null;

  if (!product) {
    return (
      <MarketingPageShell>
        <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
          <p className="text-sm text-[var(--muted)]">
            <Link href="/demo" className="underline">
              Back to demo
            </Link>
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)]">
            Pick a product first
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            Choose Stall or Pre-orders on the demo page, then open the phone
            checkout.
          </p>
          <Link
            href="/demo"
            className="mt-8 inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white"
          >
            Go to demo
          </Link>
        </main>
      </MarketingPageShell>
    );
  }

  const productMeta = DEMO_PRODUCTS.find((p) => p.id === product);
  const slug = demoStandSlugForProduct(product);
  const stand = slug
    ? await prisma.stand.findUnique({
        where: { slug },
        select: { name: true, slug: true, isActive: true },
      })
    : null;

  return (
    <MarketingPageShell>
      <main className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-[var(--muted)]">
          <Link href={`/demo?product=${product}`} className="underline">
            Back to demo
          </Link>
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Phone checkout
        </h1>
        <p className="mt-2 text-base text-[var(--muted)]">
          {stand?.name ?? productMeta?.label ?? "Demo"} · {productMeta?.label}
        </p>

        <div className="mt-8">
          {!slug ? (
            <SetupHint
              title="Demo stand not configured"
              body={`Set ${productMeta?.envKey ?? "DEMO_*_STAND_SLUG"} in the environment.`}
            />
          ) : product === "preorder" && !demoPreOrderPageSlug() ? (
            <SetupHint
              title="Demo pre-order page not configured"
              body="Set DEMO_PREORDER_PAGE_SLUG to the public pre-order page slug."
            />
          ) : !stand || !stand.isActive ? (
            <SetupHint
              title="Demo stand not found"
              body={`Create an active stand with slug “${slug}”, then refresh.`}
            />
          ) : (
            <DemoPhoneCheckout
              checkoutUrl={
                product === "preorder"
                  ? demoCustomerUrlForProduct(product)!
                  : standCheckoutUrl(stand.slug)
              }
              standName={stand.name}
              standSlug={stand.slug}
              product={product}
            />
          )}
        </div>
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
