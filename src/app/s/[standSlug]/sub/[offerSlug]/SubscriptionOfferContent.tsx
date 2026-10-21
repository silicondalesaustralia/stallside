import { intervalLabel } from "@/lib/subscription-offer";
import type { SubscriptionOfferData } from "@/lib/storefront/views/subscription-offer-types";
import SubscriptionEnrollForm from "./SubscriptionEnrollForm";
import MembershipContentShell from "./MembershipContentShell";
import MembershipEnrollForm from "./MembershipEnrollForm";
import MembershipOfferStory from "./MembershipOfferStory";
import MembershipTermsAccordion from "./MembershipTermsAccordion";

const CANCELLED = "Checkout cancelled. You can try again when ready.";

/** A subscription or membership offer: the story, prices and sign-up form. */
export default function SubscriptionOfferContent({ data, cancelled = false }: { data: SubscriptionOfferData; cancelled?: boolean }) {
  const { offer } = data;
  const remaining = data.spotsLeft;
  const signUp = data.unavailableReason === null;

  return (
    <div className="flex flex-col gap-6">
      {offer.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={offer.imageUrl} alt="" className="aspect-[16/9] w-full rounded-xl object-cover" />
      ) : null}
      {data.isMembership ? (
        <MembershipContentShell accentColor={data.accentColor}>
          <MembershipOfferStory
            standName={data.standName}
            title={offer.title}
            description={offer.description}
            currency={offer.currency}
            termWeeks={offer.termWeeks}
            weeklyPriceCents={offer.weeklyPriceCents}
            monthlyPriceCents={offer.monthlyPriceCents}
            upfrontPriceCents={offer.upfrontPriceCents}
            collectionWeekdayLabel={data.collectionDayLabel}
            collectionNote={offer.collectionNote}
            handoverCollect={offer.handoverCollect}
            plans={data.plans.map((p) => p.plan)}
          />
          {cancelled ? (
            <p className="rounded-lg border border-[var(--m-card-border)] bg-[var(--m-card)] px-3 py-2 text-sm">{CANCELLED}</p>
          ) : null}
          {remaining != null && remaining > 0 && remaining <= 5 ? (
            <p className="text-sm text-[var(--muted)]">{remaining === 1 ? "1 spot left" : `${remaining} spots left`}</p>
          ) : null}
          {signUp ? (
            <MembershipEnrollForm
              standSlug={data.standSlug}
              offerSlug={offer.slug}
              currency={offer.currency}
              plans={data.plans}
              termWeeks={offer.termWeeks}
              upfrontBenefitsText={offer.upfrontBenefitsText}
              handoverDeliver={offer.handoverDeliver}
            />
          ) : (
            <p className="text-sm text-[var(--warn)]">{data.unavailableReason}</p>
          )}
          {offer.termsText ? <MembershipTermsAccordion text={offer.termsText} /> : null}
        </MembershipContentShell>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{offer.title}</h1>
            {offer.description ? <p className="mt-2 whitespace-pre-wrap text-[var(--muted)]">{offer.description}</p> : null}
            <p className="mt-2 text-sm text-[var(--muted)]">
              {intervalLabel(offer.interval)}
              {data.collectionDayLabel ? ` · ${data.collectionDayLabel} collection` : ""}
              {offer.collectionNote ? ` · ${offer.collectionNote}` : ""}
            </p>
          </div>
          {cancelled ? <p className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm">{CANCELLED}</p> : null}
          {signUp ? (
            <SubscriptionEnrollForm
              standSlug={data.standSlug}
              offerSlug={offer.slug}
              title={offer.title}
              interval={offer.interval}
              priceCents={offer.priceCents}
              currency={offer.currency}
              handoverDeliver={offer.handoverDeliver}
              lines={data.lines}
            />
          ) : (
            <p className="text-sm text-[var(--warn)]">{data.unavailableReason}</p>
          )}
        </>
      )}
    </div>
  );
}
