import MakersLpSignupLink from "@/components/lp/makers/MakersLpSignupLink";
import { HOME_BUTTON_GOLD, HOME_HEADING_FONT, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import { HOME_COMMUNITY_POINTS, HOME_SKOOL_URL } from "@/lib/makers-lp-page-copy";

export default function MakersLpCommunity() {
  return (
    <section id="community" className="scroll-mt-6 bg-[var(--field)] py-14 text-[#faf9f5] md:py-20">
      <div className={`${HOME_WRAP} grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-24`}>
        <div>
          <p className="mb-5 text-[11px] font-bold tracking-[0.15em] text-[var(--marigold)]">INCLUDED WITH FREE & PRO</p>
          <h2 className={`${HOME_HEADING_FONT} text-[34px] leading-[1.1] sm:text-[clamp(34px,3.8vw,52px)]`}>
            You make the products.
            <br />
            Let’s build the business.
          </h2>
          <p className="my-6 text-[#bdcbb7]">
            Join a community of makers learning, sharing ideas and working things out together.
          </p>
          <MakersLpSignupLink placement="community" className={HOME_BUTTON_GOLD}>
            Start free & join us <span aria-hidden>↗</span>
          </MakersLpSignupLink>
          <a
            href={HOME_SKOOL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-xs text-[#bdcbb7] hover:text-white"
          >
            Explore the community on Skool ↗
          </a>
        </div>
        <div>
          {HOME_COMMUNITY_POINTS.map((point) => (
            <div key={point.label} className="border-t border-white/20 py-6">
              <span className="text-[10px] tracking-[0.12em] text-[var(--marigold)]">{point.label}</span>
              <h3 className={`${HOME_HEADING_FONT} mt-3.5 text-[25px] leading-[1.15]`}>{point.title}</h3>
              <p className="mt-3 text-sm text-[#bdcbb7]">{point.body}</p>
            </div>
          ))}
          <div className="mt-3 border-t border-white/20 py-6">
            <b className="text-[15px]">Jono & Jono. Two Aussie mates.</b>
            <p className="mt-3 text-sm text-[#bdcbb7]">
              We’re producers ourselves, with over 20 years’ experience in ecommerce, software development and marketing
              (SEO, paid ads and social media). We bring our A game to help you grow your business!
            </p>
            <p className="mt-3 text-sm text-[#bdcbb7]">
              Let us help you grow your business. We ship new features every week, and members help decide what we
              build next.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
