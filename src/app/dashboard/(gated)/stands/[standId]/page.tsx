import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ownerHasCardTierAccess } from "@/lib/owner-trial";
import { standCheckoutUrl, standQrDataUrl } from "@/lib/stand-qr";
import { standPaymentBrands } from "@/lib/stand-payment-brands";
import PaymentIconRow from "@/components/PaymentIconRow";
import StandDeleteButton from "./StandDeleteButton";
import StandEditForm from "./StandEditForm";
import StandPaymentOptions from "./StandPaymentOptions";

export default async function StandDetailPage({
  params,
}: {
  params: Promise<{ standId: string }>;
}) {
  const { standId } = await params;
  const { owner, user } = await requireOwner();
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId: owner.id },
    include: { products: { orderBy: { sortOrder: "asc" } } },
  });
  if (!stand) notFound();

  const checkoutUrl = standCheckoutUrl(stand.slug);
  const qrDataUrl = await standQrDataUrl(checkoutUrl, 240);
  const cardTier = ownerHasCardTierAccess(owner, {
    email: user.email,
    role: user.role,
  });
  const cardReady = Boolean(
    owner.stripeAccountId && owner.stripeChargesEnabled,
  );
  const paypalReady = Boolean(
    owner.paypalMerchantId &&
      owner.paypalOnboardingComplete &&
      owner.paypalPaymentsEnabled,
  );
  const paymentBrands = standPaymentBrands(stand, {
    ...owner,
    user: { email: user.email, role: user.role },
  });

  return (
    <main className="flex flex-col gap-10">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/stands" className="underline">
            Stands
          </Link>
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{stand.name}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Checkout:{" "}
              <a href={checkoutUrl} className="text-[var(--leaf-dark)] underline" target="_blank">
                /s/{stand.slug}
              </a>
            </p>
          </div>
          <Link
            href={`/dashboard/stands/${stand.id}/qr`}
            className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            QR &amp; print
          </Link>
        </div>
      </div>

      <section className="flex flex-wrap items-center gap-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <div className="flex shrink-0 flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="" className="size-28" />
          {paymentBrands.length > 0 ? (
            <PaymentIconRow brands={paymentBrands} />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Stand QR code</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Always available here - download or print anytime for the stall.
            Payment icons match what is enabled below.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/dashboard/stands/${stand.id}/qr`}
              className="font-medium text-[var(--leaf-dark)] underline"
            >
              Open print page
            </Link>
            <a href={qrDataUrl} download={`${stand.slug}-qr.png`} className="underline">
              Download PNG
            </a>
          </div>
        </div>
      </section>

      <StandPaymentOptions
        standId={stand.id}
        currency={stand.currency}
        localTransferAlias={stand.localTransferAlias}
        localTransferMethodId={stand.localTransferMethodId}
        acceptCash={stand.acceptCash}
        acceptLocalTransfer={stand.acceptLocalTransfer}
        acceptCard={stand.acceptCard}
        acceptPayPal={stand.acceptPayPal}
        cardReady={cardReady}
        paypalReady={paypalReady}
        cardTier={cardTier}
      />

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-lg font-semibold">Stand details</h2>
          <div className="mt-4">
            <StandEditForm stand={stand} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Products</h2>
            <Link
              href={`/dashboard/products/new?standId=${stand.id}`}
              className="text-sm text-[var(--leaf-dark)] underline"
            >
              Add product
            </Link>
          </div>
          {stand.products.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">No products yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {stand.products.map((p) => (
                <li key={p.id} className="flex justify-between gap-3">
                  <span>{p.name}</span>
                  <span className="text-[var(--muted)]">{p.stockQuantity} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <StandDeleteButton standId={stand.id} standName={stand.name} />
    </main>
  );
}
