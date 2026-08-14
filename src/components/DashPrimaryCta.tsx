import Link from "next/link";

export const dashCtaClass =
  "inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--marigold)] px-4 py-2.5 text-sm font-bold text-[var(--field)] hover:brightness-95 disabled:opacity-60";

export default function DashPrimaryCta({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={dashCtaClass}>
      {children}
    </Link>
  );
}
