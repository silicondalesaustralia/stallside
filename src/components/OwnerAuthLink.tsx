import Link from "next/link";
import { auth } from "@/lib/auth";

type OwnerAuthLinkProps = {
  /** Visual style for the nav pill / text link */
  variant?: "hero" | "marketing" | "footer";
};

const STYLES = {
  hero: "rounded-[var(--radius-pill)] border border-[var(--ink-on-dark)]/30 bg-white/5 px-3 py-2 text-sm font-semibold backdrop-blur-sm transition duration-150 hover:bg-white/10 sm:px-4",
  marketing:
    "rounded-[var(--radius-pill)] border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--field)] transition hover:border-[var(--leaf)] hover:text-[var(--leaf-dark)] sm:px-4",
  footer: "hover:text-[var(--ink-on-dark)]",
} as const;

/** Owner login when signed out; Dashboard when a session cookie is present. */
export default async function OwnerAuthLink({
  variant = "marketing",
}: OwnerAuthLinkProps) {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);

  return (
    <Link href={signedIn ? "/dashboard" : "/login"} className={STYLES[variant]}>
      {signedIn ? "Dashboard" : "Owner login"}
    </Link>
  );
}
