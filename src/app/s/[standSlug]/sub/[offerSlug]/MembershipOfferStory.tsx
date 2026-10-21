import {
  membershipFacts,
  membershipIntroCopy,
  membershipPlansHowSummary,
} from "@/lib/membership-offer-display";
import {
  membershipHeroPrice,
  membershipValueLine,
} from "@/lib/membership-offer-pricing";
import type { MembershipPlan } from "@/lib/subscription-offer";
import MembershipFactsRow from "./MembershipFactsRow";
import MembershipHowItWorks from "./MembershipHowItWorks";
import SectionCopy from "@/components/studio/SectionCopy";
import SectionElement from "@/components/studio/SectionElement";
import { isShown, type OfferPageView } from "@/lib/studio/offer-page-settings";

export default function MembershipOfferStory({
  standName,
  title,
  description,
  currency,
  termWeeks,
  weeklyPriceCents,
  monthlyPriceCents,
  upfrontPriceCents,
  collectionWeekdayLabel,
  collectionNote,
  handoverCollect,
  plans,
  view,
}: {
  standName: string;
  title: string;
  description: string | null;
  currency: string;
  termWeeks: number | null;
  weeklyPriceCents: number | null;
  monthlyPriceCents: number | null;
  upfrontPriceCents: number | null;
  collectionWeekdayLabel: string | null;
  collectionNote: string | null;
  handoverCollect: boolean;
  plans: MembershipPlan[];
  view?: OfferPageView;
}) {
  const intro = membershipIntroCopy(description);
  const facts = membershipFacts({
    description,
    termWeeks,
    collectionWeekdayLabel,
    handoverCollect,
  });
  const hero = membershipHeroPrice({
    currency,
    weeklyPriceCents,
    monthlyPriceCents,
    upfrontPriceCents,
  });
  const value = membershipValueLine({
    currency,
    termWeeks,
    weeklyPriceCents,
    upfrontPriceCents,
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-7">
      <header>
        {isShown(view, "showEyebrow") ? (
          <SectionElement
            el="eyebrow"
            className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--m-muted)]"
          >
            {standName} · <SectionCopy k="eyebrow" fallback="Membership" />
          </SectionElement>
        ) : null}
        <h1
          data-section-heading
          className="mt-2 font-[family-name:var(--font-display)] text-[30px] font-medium leading-[1.12] tracking-tight text-[var(--m-ink)] sm:text-[36px]"
        >
          <SectionElement el="title" as="span">
            {title}
          </SectionElement>
        </h1>
        {intro && isShown(view, "showIntro") ? (
          <SectionElement
            el="intro"
            className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--m-muted)] sm:text-base"
          >
            {intro}
          </SectionElement>
        ) : null}
      </header>

      {isShown(view, "showFacts") ? <MembershipFactsRow facts={facts} /> : null}

      {hero && isShown(view, "showPrice") ? (
        <div>
          <SectionElement
            el="price"
            className="text-[34px] font-semibold leading-none tracking-tight text-[var(--m-ink)]"
          >
            {hero.amount}
            <span className="text-[16px] font-medium text-[var(--m-muted)]">
              {" "}
              {hero.suffix} · {currency.toUpperCase()}
            </span>
          </SectionElement>
          {value ? (
            <SectionElement
              el="valueLine"
              className="mt-2 text-sm text-[var(--m-muted)]"
            >
              {value}
            </SectionElement>
          ) : null}
        </div>
      ) : null}

      {isShown(view, "showHowItWorks") ? (
        <MembershipHowItWorks
          plansSummary={membershipPlansHowSummary(plans)}
          collectionDay={collectionWeekdayLabel}
          collectionNote={collectionNote}
          handoverCollect={handoverCollect}
        />
      ) : null}
    </div>
  );
}
