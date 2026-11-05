"use client";

import Link from "next/link";
import { trackProUpgrade } from "@/lib/pro-upgrade-track";

type Props = { placement: string; onDark?: boolean };

/** Secondary exit next to each Upgrade CTA, so Free owners can carry on into the dashboard. */
export default function ContinueWithFreeLink({ placement, onDark = false }: Props) {
  const tone = onDark
    ? "text-[var(--ink-on-dark)] focus-visible:outline-[var(--marigold)]"
    : "text-[var(--leaf-dark)] focus-visible:outline-[var(--leaf)]";
  return (
    <Link
      href="/dashboard"
      className={`inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 ${tone}`}
      onClick={() => trackProUpgrade("pro_upgrade_continue_free", { placement })}
    >
      Continue with Free
    </Link>
  );
}
