import { LP_DEFAULT_SIGNUP_HREF } from "@/lib/lp-signup-href";

type Props = {
  className?: string;
};

/** Primary LP CTA — identical wording everywhere. Static href; params patched by LpCtaParamScript. */
export default function LpStartFreeLink({ className }: Props) {
  return (
    <a
      href={LP_DEFAULT_SIGNUP_HREF}
      data-lp-cta
      className={
        className ??
        "inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)]"
      }
    >
      Start free
    </a>
  );
}
