import Link from "next/link";

type Props = {
  href: string;
  className?: string;
};

/** Primary LP CTA — identical wording everywhere. */
export default function LpStartFreeLink({ href, className }: Props) {
  return (
    <Link
      href={href}
      className={
        className ??
        "inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)]"
      }
    >
      Start free
    </Link>
  );
}
