import Link from "next/link";
import { redirect } from "next/navigation";
import TapAndGoSetupCard from "@/components/TapAndGoSetupCard";
import StandPaymentOptions from "@/app/dashboard/(gated)/businesses/[standId]/StandPaymentOptions";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { isPayPalConnectAvailable } from "@/lib/paypal";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { squareEligibleBillingCurrency } from "@/lib/commerce/payment-rail";
import { isSquareConnectEnabled } from "@/lib/square/config";
import { getSquareConnection } from "@/lib/square/connection";
import { OnlinePaymentProvider } from "@/generated/prisma/client";

export default async function CheckoutSettingsPage() {
  const { owner, user } = await requireOwner();
  const { businesses, selected } = await resolveSelectedBusiness(owner.id);

  if (businesses.length === 0) {
    return (
      <main className="flex w-full max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
          <p className="mt-2 text-[var(--muted)]">
            Create a business first, then choose how customers pay on your QR
            stand and website.
          </p>
        </div>
        <Link
          href="/dashboard/businesses/new"
          className="inline-flex self-start rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Create business
        </Link>
      </main>
    );
  }

  if (!selected) {
    redirect("/dashboard/businesses");
  }

  const stand = await prisma.stand.findFirst({
    where: { id: selected.id, ownerId: owner.id },
    select: {
      id: true,
      name: true,
      currency: true,
      localTransferAlias: true,
      localTransferMethodId: true,
      acceptCash: true,
      acceptLocalTransfer: true,
      acceptCard: true,
      acceptPayPal: true,
      acceptSquare: true,
      _count: { select: { products: { where: { isArchived: false } } } },
    },
  });
  if (!stand) {
    redirect("/dashboard/businesses");
  }

  const cardTier = ownerHasProAccess(owner, {
    email: user.email,
    role: user.role,
  });
  const cardReady = Boolean(
    owner.stripeAccountId && owner.stripeChargesEnabled,
  );
  const paypalConnectAvailable = isPayPalConnectAvailable();
  const paypalReady = Boolean(
    owner.paypalMerchantId &&
      owner.paypalOnboardingComplete &&
      owner.paypalPaymentsEnabled,
  );

  const squareEligible = squareEligibleBillingCurrency(owner.billingCurrency);
  let squareReady = false;
  if (squareEligible && isSquareConnectEnabled()) {
    const conn = await getSquareConnection(owner.id);
    squareReady =
      conn?.status === "ACTIVE" &&
      Boolean(conn.paymentsEnabled) &&
      Boolean(conn.primaryLocationId) &&
      owner.onlinePaymentProvider === OnlinePaymentProvider.SQUARE;
  }

  return (
    <main className="flex w-full max-w-3xl flex-col gap-8">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/settings/payments" className="underline">
          Payments
        </Link>
      </p>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-2 text-[var(--muted)]">
          Choose payment methods for QR stand checkout and your website shop —
          they share the same checkout. Connect providers under Payments first.
        </p>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Editing methods for{" "}
        <strong className="text-[var(--ink)]">{stand.name}</strong>
        {businesses.length > 1 ? (
          <>
            {" "}
            ·{" "}
            <Link
              href="/dashboard/businesses"
              className="text-[var(--leaf-dark)] underline"
            >
              Switch business
            </Link>
          </>
        ) : null}
      </p>

      {stand._count.products > 0 ? (
        <TapAndGoSetupCard
          cardTier={cardTier}
          stripeConnected={owner.stripeChargesEnabled}
          stripeStarted={Boolean(owner.stripeAccountId)}
          urgent={Boolean(owner.stripeAccountId) && !owner.stripeChargesEnabled}
        />
      ) : null}

      <StandPaymentOptions
        standId={stand.id}
        currency={stand.currency}
        localTransferAlias={stand.localTransferAlias}
        localTransferMethodId={stand.localTransferMethodId}
        acceptCash={stand.acceptCash}
        acceptLocalTransfer={stand.acceptLocalTransfer}
        acceptCard={stand.acceptCard}
        acceptPayPal={stand.acceptPayPal}
        acceptSquare={stand.acceptSquare}
        cardReady={cardReady}
        paypalReady={paypalReady}
        paypalConnectAvailable={paypalConnectAvailable}
        squareEligible={squareEligible}
        squareReady={squareReady}
        cardTier={cardTier}
        heading="Payment methods"
        description={`Shown at QR stand and website checkout. Currency: ${stand.currency}.`}
      />
    </main>
  );
}
