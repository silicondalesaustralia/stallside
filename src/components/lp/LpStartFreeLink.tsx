"use client";

import { LP_DEFAULT_SIGNUP_HREF } from "@/lib/lp-signup-href";

type Props = {
  label?: string;
  className?: string;
  placement?: string;
};

const DEFAULT_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-base font-semibold text-white transition hover:bg-[var(--leaf-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--leaf)]";

/** Primary LP signup link - params patched by LpCtaParamScript. */
export default function LpStartFreeLink({
  label = "Start free",
  className,
  placement,
}: Props) {
  return (
    <a
      href={LP_DEFAULT_SIGNUP_HREF}
      data-lp-cta
      data-placement={placement}
      className={className ?? DEFAULT_CLASS}
    >
      {label}
    </a>
  );
}
