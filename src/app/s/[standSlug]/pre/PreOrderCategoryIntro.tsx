import SectionCopy from "@/components/studio/SectionCopy";
import SectionElement from "@/components/studio/SectionElement";
import { isShown, type OfferPageView } from "@/lib/studio/offer-page-settings";

export default function PreOrderCategoryIntro({
  eyebrow,
  heading,
  intro,
  view,
}: {
  eyebrow: string;
  heading: string;
  intro: string;
  view?: OfferPageView;
}) {
  return (
    <header className="mb-7 sm:mb-8">
      {isShown(view, "showEyebrow") ? (
        <SectionElement el="eyebrow" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pc-label)] sm:text-xs">
          <SectionCopy k="eyebrow" fallback={eyebrow} />
        </SectionElement>
      ) : null}
      {isShown(view, "showHeading") ? (
        <h1
          data-section-heading
          className="mt-3 font-[family-name:var(--font-display)] text-[30px] font-medium leading-[1.15] tracking-tight sm:text-[36px]"
        >
          <SectionElement el="title" as="span">
            <SectionCopy k="heading" fallback={heading} />
          </SectionElement>
        </h1>
      ) : null}
      {isShown(view, "showIntro") ? (
        <SectionElement el="intro" className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
          <SectionCopy k="intro" fallback={intro} multiline />
        </SectionElement>
      ) : null}
    </header>
  );
}
