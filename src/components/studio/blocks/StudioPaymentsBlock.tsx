import PaymentBrandIcon from "@/components/PaymentBrandIcon";
import InlineEditableText from "@/components/studio/InlineEditableText";
import SectionHeadingTag from "@/components/studio/SectionHeadingTag";
import { paymentBrandLabel, WORDMARK_BRANDS, type PaymentBrand } from "@/lib/payment-brand-assets";

export type PaymentsLayout = "slider" | "bar";

const HEADING = "font-[family-name:var(--font-display)] text-xl font-bold text-[var(--field)]";

function Chip({ brand, showLabel }: { brand: PaymentBrand; showLabel: boolean }) {
  const icon = WORDMARK_BRANDS.has(brand) ? "h-6 w-auto max-w-[4.5rem]" : "size-7";
  return (
    <span className="studio-payments__chip">
      <PaymentBrandIcon brand={brand} className={icon} />
      {showLabel ? <span className="studio-payments__label">{paymentBrandLabel(brand)}</span> : null}
      {showLabel ? null : <span className="sr-only">{paymentBrandLabel(brand)}</span>}
    </span>
  );
}

/** The payment methods a customer can use, as a static bar or a scrolling strip. */
export default function StudioPaymentsBlock({
  heading,
  layout,
  showLabels,
  brands,
  editable = false,
}: {
  heading: string;
  layout: PaymentsLayout;
  showLabels: boolean;
  brands: PaymentBrand[];
  editable?: boolean;
}) {
  if (!brands.length && !editable) return null;
  const chips = (prefix: string) =>
    brands.map((brand) => <Chip key={`${prefix}-${brand}`} brand={brand} showLabel={showLabels} />);
  // A slider only scrolls when there are enough marks to fill it.
  const slide = layout === "slider" && brands.length > 3;

  return (
    <section className="studio-section studio-payments mx-auto max-w-[var(--studio-content-max)] px-4 py-[var(--studio-section-py,2.5rem)] sf-sm:px-8">
      {editable ? (
        <InlineEditableText prop="heading" value={heading} as="h2" className={`${HEADING} text-center`} placeholder="Add a heading (optional)" />
      ) : heading ? (
        <SectionHeadingTag className={`${HEADING} text-center`}>{heading}</SectionHeadingTag>
      ) : null}
      {!brands.length ? (
        <p className="mt-4 rounded-lg border border-dashed border-[var(--line)] bg-[var(--wash)] p-4 text-center text-sm text-[var(--muted)]">
          No payment methods are switched on yet. Turn them on in your stand&apos;s payment settings and they&apos;ll show here.
          This section is hidden on your site until then.
        </p>
      ) : slide ? (
        <div className="studio-payments__slider ticker-tape mt-4" aria-label="Ways to pay">
          <div className="ticker-track payment-marquee-track">
            <div className="ticker-group gap-3 px-1.5">{chips("a")}</div>
            <div className="ticker-group gap-3 px-1.5" aria-hidden>{chips("b")}</div>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3" aria-label="Ways to pay">
          {chips("a")}
        </div>
      )}
    </section>
  );
}
