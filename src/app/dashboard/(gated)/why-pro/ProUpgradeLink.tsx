"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackProUpgrade } from "@/lib/pro-upgrade-track";

type Props = { href: string; placement: string; className: string; children: ReactNode };

/** Upgrade CTA into the existing Billing checkout, tracked by placement. */
export default function ProUpgradeLink({ href, placement, className, children }: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackProUpgrade("pro_upgrade_primary_cta_click", { placement })}
    >
      {children}
    </Link>
  );
}
