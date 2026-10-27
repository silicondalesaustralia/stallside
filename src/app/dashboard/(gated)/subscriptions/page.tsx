import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import DashPrimaryCta from "@/components/DashPrimaryCta";
import NoBusinessYet from "@/components/NoBusinessYet";
import PageHeader from "@/components/dashboard/ui/PageHeader";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { subscriptionOffersPath } from "@/lib/subscription-offer";
import { standPublicLinks } from "@/lib/storefront/stand-public-links";
import { listOwnerOffers } from "@/lib/subscriptions/service";
import { squareSubscriptionRail } from "@/lib/square-subscriptions/rail";
import StandSubscriptionsNavToggle from "./StandSubscriptionsNavToggle";
import SubscriptionOffersTable from "./SubscriptionOffersTable";

export default async function SubscriptionsListPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);

  if (!selected) {
    return (
      <main className="flex flex-col gap-6">
        <PageHeader title="Subscriptions" />
        <NoBusinessYet />
      </main>
    );
  }

  const stand = await prisma.stand.findFirst({
    where: { id: selected.id, ownerId: owner.id },
    select: { id: true, slug: true, showSubscriptionsOnStand: true, currency: true },
  });

  const [offers, links, squareRail] = await Promise.all([
    listOwnerOffers(owner.id, selected.id),
    standPublicLinks(selected.slug),
    squareSubscriptionRail({
      stand: { acceptSquare: true },
      owner,
      offerCurrency: stand?.currency ?? "AUD",
    }),
  ]);

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="Subscriptions"
        subtitle={`${selected.name} · recurring boxes and fixed-term memberships, paid by card through ${squareRail ? "Square" : "Stripe"}.`}
        actions={<DashPrimaryCta href="/dashboard/subscriptions/new">+ New subscription</DashPrimaryCta>}
      />

      {stand ? (
        <StandSubscriptionsNavToggle
          standId={stand.id}
          enabled={stand.showSubscriptionsOnStand}
          publicPath={subscriptionOffersPath(stand.slug)}
        />
      ) : null}

      {offers.length === 0 ? (
        <div className="dash-card px-4 py-10 text-center text-sm text-[var(--muted)]">
          No subscription offers yet. Pick products, set a cadence, share the link.
        </div>
      ) : (
        <SubscriptionOffersTable
          offers={offers}
          publicUrl={Object.fromEntries(offers.map((o) => [o.id, links.offer(o.slug)]))}
          squareRail={Boolean(squareRail)}
        />
      )}
    </main>
  );
}
