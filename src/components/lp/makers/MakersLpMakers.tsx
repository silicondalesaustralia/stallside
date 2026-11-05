import Image from "next/image";
import Link from "next/link";
import { HOME_EYEBROW, HOME_H2, HOME_HEADING_FONT, HOME_TEXT_LINK, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";

const STORIES = "/testimonials-and-gallery";

export default function MakersLpMakers() {
  return (
    <section id="makers" className={`${HOME_WRAP} scroll-mt-6 py-16 md:py-[100px]`}>
      <div className="mb-7 items-end justify-between gap-9 md:mb-10 md:flex">
        <div className="max-w-[720px]">
          <p className={HOME_EYEBROW}>THE PEOPLE BEHIND THE PRODUCTS</p>
          <h2 className={HOME_H2}>Made for Makers. Backed by Their Experiences.</h2>
          <p className="mt-5 text-base text-[var(--muted)]">
            See how makers are using Vendl, explore real shops and get a closer look at the tools behind the platform.
          </p>
        </div>
        <Link href={STORIES} className={`${HOME_TEXT_LINK} mt-5 inline-block md:mt-0`}>
          Meet our makers ↗
        </Link>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr] lg:gap-6">
        <article className="grid grid-cols-[0.8fr_1fr] bg-[var(--field)] text-[#faf9ef] md:grid-cols-[1fr_1.15fr]">
          <Image
            src="/gallery/fletchers-goats-milk-soap-bars.jpg"
            alt="Handmade soaps from Fletcherbrook Small Farm"
            width={819}
            height={1024}
            sizes="(max-width: 768px) 45vw, 400px"
            className="h-full min-h-[350px] w-full object-cover md:min-h-[390px]"
          />
          <div className="px-5 py-6 md:px-7 md:py-9">
            <p className="mb-5 text-[9px] font-bold tracking-[0.15em] text-[#b4c2ad]">FLETCHERBROOK SMALL FARM</p>
            <blockquote className={`${HOME_HEADING_FONT} mb-7 text-[22px] leading-[1.25] md:text-[26px]`}>
              “The team has made it feel like a real partnership. It feels like we’re on this journey together.”
            </blockquote>
            <p className="text-[11px] text-[#b4c2ad]">The Fletchers · Donnybrook, WA</p>
            <Link href={`${STORIES}#fletcherbrook`} className="mt-5 block text-xs text-[var(--marigold)] hover:underline">
              Read their story ↗
            </Link>
          </div>
        </article>
        <article>
          <Image
            src="/gallery/jacaranda-hill-farm-shop.jpg"
            alt="Jacaranda Hill Farm’s on-farm shop"
            width={1024}
            height={789}
            sizes="(max-width: 1024px) 100vw, 420px"
            className="h-[230px] w-full object-cover md:h-[260px] lg:h-[220px]"
          />
          <blockquote className="mb-3 mt-5 text-[19px] leading-[1.45] text-[var(--field)]">
            “Thank you for making a great platform we can use to make payments easier.”
          </blockquote>
          <p className="text-xs text-[var(--muted)]">Jacaranda Hill Farm · Fairbridge, WA</p>
          <Link href={`${STORIES}#jacaranda-hill`} className={`${HOME_TEXT_LINK} mt-4 inline-block`}>
            Read their story ↗
          </Link>
        </article>
      </div>
    </section>
  );
}
