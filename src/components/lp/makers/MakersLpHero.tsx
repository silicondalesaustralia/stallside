import Image from "next/image";
import MakersLpSignupLink from "@/components/lp/makers/MakersLpSignupLink";
import MakersLpHeroBullet from "@/components/lp/makers/MakersLpHeroBullet";
import MakersLpHeroCostNote from "@/components/lp/makers/MakersLpHeroCostNote";
import MakersLpPlanPrice from "@/components/lp/makers/MakersLpPlanPrice";
import { HOME_BUTTON, HOME_EYEBROW, HOME_HEADING_FONT, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import { MAKERS_LP_HERO_BULLETS } from "@/lib/makers-lp-benefits";

const LIST = "space-y-3 text-base leading-relaxed text-[var(--muted)]";

/** Mobile order: copy, CTA, three bullets, product visual, last two bullets. Desktop: copy left, visual right. */
export default function MakersLpHero() {
  const [first, second, third, fourth] = MAKERS_LP_HERO_BULLETS;
  return (
    <section className={`${HOME_WRAP} grid gap-x-12 gap-y-8 pb-12 pt-8 md:grid-cols-2 md:pb-[90px] md:pt-11`}>
      <div className="md:col-start-1 md:row-start-1">
        <p className={HOME_EYEBROW}>FOR PEOPLE WHO MAKE THINGS.</p>
        <h1 className={`${HOME_HEADING_FONT} mb-5 text-[38px] leading-[1.05] text-[var(--field)] sm:text-[clamp(40px,4.4vw,60px)]`}>
          New Selling Software That Finally Understands How Makers Work
        </h1>
        <p className="max-w-[520px] text-[17px] leading-relaxed text-[var(--muted)] sm:text-lg">
          From making and pricing your products to managing stock, orders and online sales, Vendl brings your business
          together in one place.
        </p>
        <div className="mb-3 mt-7">
          <MakersLpSignupLink placement="hero" className={HOME_BUTTON}>
            Start free <span aria-hidden>↗</span>
          </MakersLpSignupLink>
        </div>
        <p className="text-sm text-[var(--muted)]">Free plan available · No website needed</p>
        <p className="mb-4 mt-8 text-sm font-semibold text-[var(--field)]">Here are just a few qualities of Vendl:</p>
        <ul className={LIST}>
          {[first, second, third].map((b) => (
            <MakersLpHeroBullet key={b.lead} lead={b.lead} rest={b.rest} dash={b.dash} />
          ))}
        </ul>
      </div>
      <div className="relative ml-5 pb-14 md:col-start-2 md:row-span-2 md:row-start-1 md:ml-0 md:self-center md:pb-[70px] md:pl-8">
        <p className="mb-3 text-[11px] tracking-[0.14em] text-[var(--field)]">MADE BY THE FLETCHERS · WESTERN AUSTRALIA</p>
        <Image
          src="/gallery/fletchers-artisan-soaps.jpg"
          alt="Fletcherbrook handmade goat’s milk soaps and farm shop display"
          width={819}
          height={1024}
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, 600px"
          className="h-[340px] w-full rounded-[70px_6px_6px_6px] object-cover sm:h-[410px] md:h-[440px] md:rounded-[100px_7px_7px_7px] lg:h-[525px]"
        />
        <MakersLpHeroCostNote />
        <p className="absolute bottom-2 right-0 text-xs text-[var(--field)] md:bottom-6 md:text-[13px]">
          Small batches. Real businesses. Yours.
        </p>
      </div>
      <ul className={`${LIST} md:col-start-1 md:row-start-2`}>
        <MakersLpHeroBullet lead={fourth.lead} rest={fourth.rest} dash={fourth.dash} />
        <MakersLpHeroBullet
          lead={
            <>
              Pay <MakersLpPlanPrice plan="free" /> per month to get started,
            </>
          }
          rest={
            <>
              or <MakersLpPlanPrice plan="pro" /> per month for Pro with no Vendl transaction fee (provider fees still
              apply).
            </>
          }
        />
      </ul>
    </section>
  );
}
