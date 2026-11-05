import { Calculator, Clapperboard, Globe, type LucideIcon } from "lucide-react";
import { HOME_EYEBROW, HOME_H2, HOME_H3, HOME_HEADING_FONT, HOME_TEXT_LINK, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";

type Pillar = { title: string; body: string; icon: LucideIcon; href: string; link: string };

const PILLARS: Pillar[] = [
  {
    title: "Price with confidence",
    body: "Account for materials, packaging, labour and overheads, then use target margins to guide your pricing.",
    icon: Calculator,
    href: "#production",
    link: "Try the costing calculator",
  },
  {
    title: "Create content and promote your products",
    body: "Access Pro's social credits, AI video clips, video editor and additional promotional tools.",
    icon: Clapperboard,
    href: "#marketing",
    link: "See the social tools",
  },
];

/** Sits directly above the pricing cards; costing and social get equal weight. */
export default function MakersLpProUpgrade() {
  return (
    <section id="pro" className={`${HOME_WRAP} scroll-mt-6 pt-16 md:pt-[100px]`}>
      <div className="mb-10 max-w-[760px]">
        <p className={HOME_EYEBROW}>VENDL PRO</p>
        <h2 className={HOME_H2}>Know What It Costs to Make. Get More Eyes on What You Sell.</h2>
        <p className="mt-5 text-base text-[var(--muted)]">
          Vendl Pro brings production costing, pricing tools and social marketing features together, helping makers
          manage the numbers behind their products and promote what they&apos;ve created.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {PILLARS.map(({ title, body, icon: Icon, href, link }) => (
          <article key={title} className="flex flex-col bg-[var(--field)] p-7 text-[#faf9f5] md:p-9">
            <Icon aria-hidden className="mb-6 size-8 text-[var(--marigold)]" />
            <h3 className={`${HOME_HEADING_FONT} mb-3 text-[26px] leading-[1.15] md:text-[30px]`}>{title}</h3>
            <p className="mb-6 text-[15px] text-[#bdcbb7]">{body}</p>
            <a href={href} className="mt-auto self-start text-sm font-semibold text-[var(--marigold)] hover:underline">
              {link} ↑
            </a>
          </article>
        ))}
      </div>
      <article className="mt-5 flex flex-col gap-4 border border-[var(--line)] p-6 sm:flex-row sm:items-center sm:gap-6 md:p-7">
        <Globe aria-hidden className="size-7 shrink-0 text-[var(--leaf)]" />
        <div className="flex-1">
          <h3 className={`${HOME_H3} mb-1 text-[21px]`}>Build beyond a basic shop</h3>
          <p className="text-sm text-[var(--muted)]">
            Add a branded website, advanced selling features and more business-management tools.
          </p>
        </div>
        <a href="#platform" className={`${HOME_TEXT_LINK} self-start sm:self-center`}>
          See the website editor ↑
        </a>
      </article>
    </section>
  );
}
