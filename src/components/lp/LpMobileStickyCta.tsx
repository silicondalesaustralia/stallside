"use client";

import { useEffect, useState } from "react";
import LpStartFreeLink from "@/components/lp/LpStartFreeLink";

type Props = {
  ctaLabel?: string;
  signupHref?: string;
};

export default function LpMobileStickyCta({ ctaLabel, signupHref }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("lp-hero-cta");
    const final = document.getElementById("lp-final-cta");
    if (!hero) return;

    const io = new IntersectionObserver(
      (entries) => {
        const heroVisible = entries.find((e) => e.target === hero)?.isIntersecting;
        const finalVisible = entries.find((e) => e.target === final)?.isIntersecting;
        setShow(!heroVisible && !finalVisible);
      },
      { threshold: 0.15 },
    );

    io.observe(hero);
    if (final) io.observe(final);
    return () => io.disconnect();
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--muted)]">A$0/mo on Free</p>
        <LpStartFreeLink
          placement="mobile_sticky"
          label={ctaLabel}
          href={signupHref}
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white"
        />
      </div>
    </div>
  );
}
