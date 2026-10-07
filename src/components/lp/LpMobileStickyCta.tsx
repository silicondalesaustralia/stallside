"use client";

import { useEffect, useState } from "react";
import LpStartFreeLink from "@/components/lp/LpStartFreeLink";

type Props = {
  ctaLabel?: string;
  signupHref?: string;
  placement?: string;
  priceLabel?: string;
  ctaClassName?: string;
};

const DEFAULT_CTA_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white";

export default function LpMobileStickyCta({
  ctaLabel,
  signupHref,
  placement = "mobile_sticky",
  priceLabel = "A$0/mo on Free",
  ctaClassName = DEFAULT_CTA_CLASS,
}: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("lp-hero-cta");
    const final = document.getElementById("lp-final-cta");
    if (!hero) return;

    const visible = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
        setShow(!visible.get(hero) && !(final && visible.get(final)));
      },
      { threshold: 0.15 },
    );

    io.observe(hero);
    if (final) io.observe(final);
    return () => io.disconnect();
  }, []);

  // Always rendered (hidden) so LpCtaParamScript can rewrite the href on load.
  return (
    <div
      hidden={!show}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--muted)]">{priceLabel}</p>
        <LpStartFreeLink
          placement={placement}
          label={ctaLabel}
          href={signupHref}
          className={ctaClassName}
        />
      </div>
    </div>
  );
}
