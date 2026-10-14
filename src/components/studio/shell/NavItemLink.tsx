import Link from "next/link";
import type { ReactNode } from "react";
import { isExternalLink } from "@/lib/studio/button-link";

/** A header menu link; other websites open in a new tab, mail/phone links use a plain anchor. */
export default function NavItemLink({
  href,
  className,
  role,
  onClick,
  children,
}: {
  href: string;
  className: string;
  role?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (isExternalLink(href)) {
    return (
      <a href={href} className={className} role={role} onClick={onClick} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (/^(mailto|tel):/i.test(href)) {
    return (
      <a href={href} className={className} role={role} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} role={role} onClick={onClick}>
      {children}
    </Link>
  );
}
