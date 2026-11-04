import Image from "next/image";
import Link from "next/link";
import MakersLpHeroCostNote from "@/components/lp/makers/MakersLpHeroCostNote";
import { HOME_BUTTON, HOME_EYEBROW, HOME_HEADING_FONT, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";

export default function MakersLpHero() {
  return (
    <section className={`${HOME_WRAP} grid items-center gap-6 pb-12 pt-8 md:grid-cols-2 md:gap-12 md:pb-[90px] md:pt-11`}>
      <div>
        <p className={HOME_EYEBROW}>FOR PEOPLE WHO MAKE THINGS</p>
        <h1 className={`${HOME_HEADING_FONT} mb-6 text-[48px] leading-[1.02] text-[var(--field)] sm:text-[clamp(48px,5vw,72px)]`}>
          Make it.
          <br />
          Sell it.
          <br />
          <span className="text-[var(--leaf)]">Know what you earn.</span>
        </h1>
        <p className="max-w-[400px] text-[17px] leading-relaxed text-[var(--muted)] sm:text-lg">
          Your online shop, product costs, stock and orders in one place. Built for makers and home producers.
        </p>
        <p className="mt-3 max-w-[440px] text-[15px] leading-relaxed text-[var(--muted)]">
          Paying too much for Shopify, Wix or Square? Vendl gives makers more for less.
        </p>
        <div className="mb-3.5 mt-7 flex flex-wrap items-center gap-4 sm:gap-6">
          <Link href="/signup" className={HOME_BUTTON}>
            Start free <span aria-hidden>↗</span>
          </Link>
        </div>
        <p className="text-xs text-[var(--muted)]">Free selling tools. Website and production tools with Pro.</p>
      </div>
      <div className="relative ml-5 mt-2 pb-14 md:ml-0 md:pb-[70px] md:pl-8 md:pt-5">
        <p className="mb-3 text-[9px] tracking-[0.14em] text-[var(--field)]">MADE BY THE FLETCHERS · WESTERN AUSTRALIA</p>
        <Image
          src="/gallery/fletchers-artisan-soaps.jpg"
          alt="Fletcherbrook handmade goat’s milk soaps and farm shop display"
          width={819}
          height={1024}
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, 600px"
          className="h-[410px] w-full rounded-[70px_6px_6px_6px] object-cover md:h-[440px] md:rounded-[100px_7px_7px_7px] lg:h-[525px]"
        />
        <MakersLpHeroCostNote />
        <p className="absolute bottom-2 right-0 text-[10px] text-[var(--field)] md:bottom-6 md:text-xs">
          Small batches. Real businesses. Yours.
        </p>
      </div>
    </section>
  );
}
