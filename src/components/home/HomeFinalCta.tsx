import Link from "next/link";
import { HOME_BUTTON, HOME_EYEBROW, HOME_HEADING_FONT } from "@/components/home/home-styles";

export default function HomeFinalCta() {
  return (
    <section className="bg-[#f1eddf] px-[22px] pb-14 pt-12 text-center md:pb-[85px] md:pt-16">
      <p className={HOME_EYEBROW}>YOUR NEXT CHAPTER STARTS HERE</p>
      <h2 className={`${HOME_HEADING_FONT} mb-8 text-[40px] leading-[1.08] text-[var(--field)] md:text-[56px]`}>
        Made by you.
        <br />
        Backed by Vendl.
      </h2>
      <Link href="/signup" className={HOME_BUTTON}>
        Start free <span aria-hidden>↗</span>
      </Link>
    </section>
  );
}
