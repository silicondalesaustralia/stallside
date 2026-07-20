import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BrandMark from "@/components/BrandMark";
import { localTransferForCurrency } from "@/lib/local-transfer";
import { standOffersCard, standOffersPayPal } from "@/lib/stand-payment-brands";
import { demoRegionForStandSlug, isDemoStandSlug } from "@/lib/demo";
import PublicCart from "./PublicCart";

function stockLabel(showExact: boolean, quantity: number, threshold: number): string {
  if (quantity <= 0) return "Sold out";
  if (showExact) return `${quantity} left`;
  if (quantity <= threshold) return "Low stock";
  return "Available";
}

export default async function PublicStandPage({
  params,
}: {
  params: Promise<{ standSlug: string }>;
}) {
  const { standSlug } = await params;
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const stand = await prisma.stand.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
      owner: { include: { user: { select: { email: true, role: true } } } },
    },
  });

  if (!stand || !stand.isActive) notFound();

  const demoRegion = isDemoStandSlug(stand.slug)
    ? demoRegionForStandSlug(stand.slug)
    : null;

  const method = localTransferForCurrency(stand.currency);
  const alias = stand.localTransferAlias?.trim() ?? "";
  const localTransfer =
    stand.acceptLocalTransfer &&
    method &&
    alias &&
    stand.localTransferMethodId === method.id
      ? {
          methodId: method.id,
          buttonLabel: method.buttonLabel,
          aliasLabel: method.checkoutAliasLabel,
          alias,
        }
      : null;

  const products = stand.products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    priceCents: p.priceCents,
    stockQuantity: p.stockQuantity,
    label: stockLabel(stand.showExactStock, p.stockQuantity, p.lowStockThreshold),
    soldOut: p.stockQuantity <= 0,
  }));

  return (
    <main className="mx-auto min-h-full w-full max-w-lg px-4 pb-8 pt-8">
      <div className="flex items-center gap-3">
        <BrandMark className="size-11" />
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--field)]">
          {stand.name}
        </h1>
      </div>
      {products.length === 0 ? (
        <p className="mt-10 text-xl text-[var(--muted)]">Nothing for sale right now.</p>
      ) : (
        <>
          <p className="mt-4 text-xl text-[var(--muted)]">Please select your items below.</p>
          <PublicCart
            standSlug={stand.slug}
            currency={stand.currency}
            products={products}
            cashEnabled={stand.acceptCash}
            cardEnabled={standOffersCard(stand, {
              ...stand.owner,
              user: stand.owner.user,
            })}
            paypalEnabled={standOffersPayPal(stand, {
              ...stand.owner,
              user: stand.owner.user,
            })}
            paypalClientId={process.env.PAYPAL_CLIENT_ID ?? null}
            paypalMerchantId={stand.owner.paypalMerchantId}
            paypalSandbox={
              (process.env.PAYPAL_MODE || "sandbox").toLowerCase() !== "live"
            }
            localTransfer={localTransfer}
            demoRegion={demoRegion}
          />
        </>
      )}
    </main>
  );
}
