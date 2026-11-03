import Image from "next/image";
import Link from "next/link";
import { HOME_BUTTON, HOME_EYEBROW, HOME_H2, HOME_HEADING_FONT, HOME_WRAP } from "@/components/home/home-styles";
import { HOME_IMPORT_SOURCES } from "@/lib/home-page-copy";

export default function HomeSwitch() {
  return (
    <section id="switch" className={`${HOME_WRAP} border-t border-[var(--line)] py-14 text-center md:pb-[85px] md:pt-[75px]`}>
      <p className={HOME_EYEBROW}>ALREADY SELLING SOMEWHERE ELSE?</p>
      <h2 className={HOME_H2}>
        Bring your products.
        <br />
        Build your next chapter.
      </h2>
      <p className="mx-auto my-6 text-sm text-[var(--muted)] md:text-base">
        Import products and customers from your existing platform with Vendl Pro.
        <br className="hidden sm:inline" /> Map your columns and review your catalogue as you move over.
      </p>
      <ul
        aria-label="Supported import sources"
        className={`${HOME_HEADING_FONT} my-9 flex flex-wrap justify-center gap-x-6 gap-y-3.5 text-xl font-bold text-[var(--field)] md:gap-9 md:text-[22px]`}
      >
        {HOME_IMPORT_SOURCES.map(({ name, icon }) => (
          <li key={name} className="flex items-center gap-2.5">
            <Image src={icon} alt="" aria-hidden width={26} height={26} className="size-6 md:size-[26px]" />
            {name}
          </li>
        ))}
      </ul>
      <Link href="/signup" className={HOME_BUTTON}>
        Start free <span aria-hidden>↗</span>
      </Link>
      <p className="mx-auto mt-4 max-w-[470px] text-xs text-[var(--muted)]">
        Imports bring across your data, not your website design. Check each import before you go live.
      </p>
    </section>
  );
}
