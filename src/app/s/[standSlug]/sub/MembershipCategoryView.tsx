import { subscriptionOfferPath } from "@/lib/subscription-offer";
import {
  membershipCategoryCardCopy,
  membershipCategoryIntro,
  membershipCategoryPrice,
  membershipCategoryTermLine,
  sortMembershipCategoryOffers,
} from "@/lib/membership-category-copy";
import MembershipCategoryCard from "./MembershipCategoryCard";
import MembershipCategoryFooter from "./MembershipCategoryFooter";
import MembershipCategoryIntro from "./MembershipCategoryIntro";
import MembershipCategoryShell from "./MembershipCategoryShell";

type Offer = {
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  currency: string;
  termWeeks: number | null;
  weeklyPriceCents: number | null;
  monthlyPriceCents: number | null;
  upfrontPriceCents: number | null;
};

export default function MembershipCategoryView({
  standSlug,
  standName,
  accentColor,
  offers,
}: {
  standSlug: string;
  standName: string;
  accentColor?: string | null;
  offers: Offer[];
}) {
  const intro = membershipCategoryIntro(standSlug, standName);
  const ordered = sortMembershipCategoryOffers(standSlug, offers);

  return (
    <MembershipCategoryShell accentColor={accentColor}>
      <MembershipCategoryIntro
        eyebrow={intro.eyebrow}
        heading={intro.heading}
        intro={intro.intro}
      />
      <ul
        className={
          ordered.length === 1
            ? "membership-grid mx-auto grid w-full max-w-[470px] grid-cols-1 gap-5"
            : "membership-grid grid grid-cols-1 gap-5 sm:grid-cols-2"
        }
      >
        {ordered.map((offer) => {
          const copy = membershipCategoryCardCopy({
            standSlug,
            offerSlug: offer.slug,
            title: offer.title,
            description: offer.description,
          });
          const price = membershipCategoryPrice({
            currency: offer.currency,
            weeklyPriceCents: offer.weeklyPriceCents,
            monthlyPriceCents: offer.monthlyPriceCents,
            upfrontPriceCents: offer.upfrontPriceCents,
          });
          const termLine = membershipCategoryTermLine({
            currency: offer.currency,
            termWeeks: offer.termWeeks,
            upfrontPriceCents: offer.upfrontPriceCents,
          });
          return (
            <li key={offer.slug} className="min-w-0">
              <MembershipCategoryCard
                href={subscriptionOfferPath(standSlug, offer.slug)}
                title={offer.title}
                imageUrl={offer.imageUrl}
                quantityLabel={copy.quantityLabel}
                shortDescription={copy.shortDescription}
                priceAmount={price?.amount ?? null}
                priceUnit={price?.unit ?? null}
                termLine={termLine}
              />
            </li>
          );
        })}
      </ul>
      <MembershipCategoryFooter text={intro.footer} />
    </MembershipCategoryShell>
  );
}
