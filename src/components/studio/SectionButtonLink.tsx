"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { StudioMetadata } from "@/lib/studio/types";
import { isExternalLink, resolveButtonLink } from "@/lib/studio/button-link";
import { useSectionButtonLink } from "./SectionStyleContext";

/**
 * A section's main button: goes where the seller chose, else `defaultHref`. With no
 * destination at all it renders as a plain label (as some sections did before links).
 */
export default function SectionButtonLink({
  meta,
  defaultHref,
  className,
  children,
}: {
  meta: StudioMetadata;
  defaultHref: string | null;
  className: string;
  children: ReactNode;
}) {
  const href = resolveButtonLink(useSectionButtonLink(), meta) ?? defaultHref;
  if (!href) return <span className={className}>{children}</span>;
  if (isExternalLink(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (/^(mailto|tel):/i.test(href)) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
