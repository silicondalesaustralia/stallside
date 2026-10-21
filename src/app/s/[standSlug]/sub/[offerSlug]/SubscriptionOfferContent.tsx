import { intervalLabel } from "@/lib/subscription-offer";
import type { SubscriptionOfferData } from "@/lib/storefront/views/subscription-offer-types";
import SubscriptionEnrollForm from "./SubscriptionEnrollForm";
import MembershipContentShell from "./MembershipContentShell";
import MembershipEnrollForm from "./MembershipEnrollForm";
import MembershipOfferStory from "./MembershipOfferStory";
import MembershipTermsAccordion from "./MembershipTermsAccordion";
import SectionElement from "@/components/studio/SectionElement";
import { isShown, type OfferPageView } from "@/lib/studio/offer-page-settings";

const CANCELLED = "Checkout cancelled. You can try again when ready.";

/** A subscription or membership offer: the story, prices and sign-up form. */
export default function SubscriptionOfferContent({
  data,
  cancelled = false,
  view,
}: {
  data: SubscriptionOfferData;
  cancelled?: boolean;
  /** Website layout choices; the stand page shows everything. */
  view?: OfferPageView;
}) {
  const { offer } = data;
  const remaining = data.spotsLeft;
  const signUp = data.unavailableReason === null;

  return (
    <div className="flex flex-col gap-6">
      {offer.imageUrl && isShown(view, "showImage") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={offer.imageUrl}
          alt=""
          className="sf-photo sf-photo-frame w-full rounded-xl bg-[var(--wash)] [--photo-default-ratio:16/9]"
        />
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
            view={view}
          />
          {cancelled ? (
            <p className="rounded-lg border border-[var(--m-card-border)] bg-[var(--m-card)] px-3 py-2 text-sm">
              {CANCELLED}
            </p>
          ) : null}
          {remaining != null && remaining > 0 && remaining <= 5 ? (
            <p className="text-sm text-[var(--muted)]">
              {remaining === 1 ? "1 spot left" : `${remaining} spots left`}
            </p>
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
            <p className="text-sm text-[var(--warn)]">
              {data.unavailableReason}
            </p>
          )}
          {offer.termsText && isShown(view, "showTerms") ? (
            <MembershipTermsAccordion text={offer.termsText} />
          ) : null}
        </MembershipContentShell>
      ) : (
        <>
          <div>
            <h1
              data-section-heading
              className="text-2xl font-semibold tracking-tight"
            >
              <SectionElement el="title" as="span">
                {offer.title}
              </SectionElement>
            </h1>
            {offer.description && isShown(view, "showIntro") ? (
              <SectionElement
                el="intro"
                className="mt-2 whitespace-pre-wrap text-[var(--muted)]"
              >
                {offer.description}
              </SectionElement>
            ) : null}
            <SectionElement
              el="smallPrint"
              className="mt-2 text-sm text-[var(--muted)]"
            >
              {intervalLabel(offer.interval)}
              {data.collectionDayLabel
                ? ` · ${data.collectionDayLabel} collection`
                : ""}
              {offer.collectionNote ? ` · ${offer.collectionNote}` : ""}
            </SectionElement>
          </div>
          {cancelled ? (
            <p className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
              {CANCELLED}
            </p>
          ) : null}
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
            <p className="text-sm text-[var(--warn)]">
              {data.unavailableReason}
            </p>
          )}
        </>
      )}
    </div>
  );
}
