import { Smartphone } from "lucide-react";
import { HOME_HEADING_FONT, HOME_WRAP } from "@/components/lp/makers/makers-lp-styles";
import { MAKERS_LP_MOBILE_APPS, MAKERS_LP_MOBILE_APPS_SHOW } from "@/lib/makers-lp-mobile-apps";

export default function MakersLpMobileApps() {
  if (!MAKERS_LP_MOBILE_APPS_SHOW) return null;
  return (
    <section
      aria-labelledby="mobile-apps-heading"
      className={`${HOME_WRAP} border-t border-[var(--line)] py-12 text-center md:py-14`}
    >
      <h2 id="mobile-apps-heading" className={`${HOME_HEADING_FONT} text-[26px] leading-[1.15] text-[var(--field)] md:text-[30px]`}>
        Vendl is growing with you.
      </h2>
      <p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-relaxed text-[var(--muted)]">
        We&apos;re working on dedicated iOS and Android apps.
        <br />
        You can get started with Vendl on the web today.
      </p>
      <ul className="mt-7 flex flex-wrap justify-center gap-3">
        {MAKERS_LP_MOBILE_APPS.map(({ platform, status }) => (
          <li
            key={platform}
            className="flex min-w-[180px] items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-left"
          >
            <Smartphone aria-hidden className="size-5 shrink-0 text-[var(--leaf)]" />
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-[var(--field)]">{platform}</span>
              <span className="text-xs font-medium text-[var(--muted)]">{status}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
