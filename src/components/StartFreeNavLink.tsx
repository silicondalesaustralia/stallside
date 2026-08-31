import Link from "next/link";
import { auth } from "@/lib/auth";

type StartFreeNavLinkProps = {
  variant?: "hero" | "marketing";
};

const STYLES = {
  hero: "rounded-[var(--radius-pill)] bg-[var(--leaf)] px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition duration-150 hover:bg-[var(--leaf-dark)] sm:px-4 sm:py-2 sm:text-sm",
  marketing:
    "rounded-[var(--radius-pill)] bg-[var(--leaf)] px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition hover:bg-[var(--leaf-dark)] sm:px-4 sm:py-2 sm:text-sm",
} as const;

/** Primary signup CTA for cold visitors; hidden when already signed in. */
export default async function StartFreeNavLink({
  variant = "marketing",
}: StartFreeNavLinkProps) {
  const session = await auth();
  if (session?.user?.id) return null;

  return (
    <Link href="/signup" className={STYLES[variant]}>
      Get Free Account
    </Link>
  );
}
