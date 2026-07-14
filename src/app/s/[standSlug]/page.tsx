import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BrandMark from "@/components/BrandMark";
import SafeSignHtml from "@/components/SafeSignHtml";
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
      owner: true,
    },
  });

  if (!stand || !stand.isActive) notFound();

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
      {stand.description ? (
        <SafeSignHtml
          html={stand.description}
          className="mt-4 text-xl leading-relaxed text-[var(--ink)] [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_strong]:font-bold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
        />
      ) : null}
      {stand.locationLabel ? (
        <p className="mt-3 text-lg text-[var(--muted)]">{stand.locationLabel}</p>
      ) : null}

      {products.length === 0 ? (
        <p className="mt-10 text-xl text-[var(--muted)]">Nothing for sale right now.</p>
      ) : (
        <PublicCart
          standSlug={stand.slug}
          currency={stand.currency}
          products={products}
          cardEnabled={Boolean(
            stand.owner.stripeAccountId && stand.owner.stripeChargesEnabled,
          )}
          paypalEnabled={Boolean(
            stand.owner.paypalMerchantId && stand.owner.paypalPaymentsEnabled,
          )}
        />
      )}
    </main>
  );
}
