import { notFound, redirect } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { ownerHasProAccess } from "@/lib/owner-trial";
import { isPayPalConnectAvailable } from "@/lib/paypal";
import { loadOwnerStandPayments } from "@/lib/stand-payments/load";
import BusinessPaymentsTab from "../businesses/[standId]/BusinessPaymentsTab";
import PaymentsOverview from "../businesses/[standId]/PaymentsOverview";

export default async function PaymentsPage() {
  const { owner, user } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);
  if (!selected) redirect("/dashboard/businesses/new");
  const payments = await loadOwnerStandPayments(owner, selected.id);
  if (!payments) notFound();
  const { stand } = payments;

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Payments</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">How customers pay {selected.name} at checkout.</p>
      </div>
      <BusinessPaymentsTab
        standId={selected.id}
        currency={stand.currency}
        localTransferAlias={stand.localTransferAlias}
        localTransferMethodId={stand.localTransferMethodId}
        acceptCash={stand.acceptCash}
        acceptLocalTransfer={stand.acceptLocalTransfer}
        acceptCard={stand.acceptCard}
        acceptPayPal={stand.acceptPayPal}
        cardReady={Boolean(owner.stripeAccountId && owner.stripeChargesEnabled)}
        paypalReady={Boolean(owner.paypalMerchantId && owner.paypalOnboardingComplete && owner.paypalPaymentsEnabled)}
        paypalConnectAvailable={isPayPalConnectAvailable()}
        cardTier={ownerHasProAccess(owner, { email: user.email, role: user.role })}
        stripeConnected={owner.stripeChargesEnabled}
        stripeStarted={Boolean(owner.stripeAccountId)}
        productCount={stand._count.products}
        square={
          payments.square === null
            ? null
            : { accept: stand.acceptSquare, ready: payments.squareReady, isProvider: payments.squareIsProvider }
        }
        overview={<PaymentsOverview owner={owner} />}
      />
    </main>
  );
}
