import type { ReactNode } from "react";
import Link from "next/link";
import DemoPreOrderPanel from "@/components/DemoPreOrderPanel";
import DemoStandPanel from "@/components/DemoStandPanel";
import {
  DEMO_PRODUCTS,
  demoCustomerUrlForProduct,
  demoPreOrderPageSlug,
  demoStandSlugForProduct,
  isDemoProduct,
  type DemoProduct,
} from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { APP_DOMAIN } from "@/lib/constants";
import { standCheckoutUrl, standQrDataUrl } from "@/lib/stand-qr";
import { demoSignPaymentBrands } from "@/lib/stand-payment-brands";

export default async function FarmstandCheckoutDemo({
  productParam,
}: {
  productParam?: string;
}) {
  const product: DemoProduct | null = isDemoProduct(productParam)
    ? productParam
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
  } else if (product === "preorder" && slug && !demoPreOrderPageSlug()) {
    panel = (
      <SetupHint
        title="Demo pre-order page not configured"
        body="Set DEMO_PREORDER_PAGE_SLUG to the public pre-order page slug."
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
        where: { standId: stand.id, slug: pageSlug, isActive: true },
        select: { title: true },
      });
      if (!page) {
        panel = (
          <SetupHint
            title="Demo pre-order page not found"
            body={`Create an active pre-order page with slug “${pageSlug}” on “${stand.name}”.`}
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
          paymentBrands={demoSignPaymentBrands(stand, {
            ...stand.owner,
            user: stand.owner.user,
          })}
        />
      );
    }
  }

  return (
    <div>
      <p className="text-sm text-[var(--muted)]">
        Pick stall checkout or pre-orders — then walk through it as a customer.
      </p>
      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-[var(--field)]">
          1. Choose a product
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {DEMO_PRODUCTS.map((item) => {
            const selected = product === item.id;
            return (
              <Link
                key={item.id}
                href={`/demo?tab=checkout&product=${item.id}`}
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
    </div>
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
