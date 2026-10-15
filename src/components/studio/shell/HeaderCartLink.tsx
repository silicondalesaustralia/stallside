import Link from "next/link";
import type { HeaderCartButton } from "@/lib/storefront/header-cart-button";

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}

/** Header cart button, styled from Site Wide Edits. The editor always shows it so it can be styled. */
export default function HeaderCartLink({
  href,
  count,
  button,
  preview = false,
}: {
  href: string;
  count: number;
  button: HeaderCartButton;
  preview?: boolean;
}) {
  if (count <= 0 && !button.showWhenEmpty && !preview) return null;
  const label = button.showCount ? `${button.label} (${count})` : button.label;
  return (
    <Link
      href={href}
      className={`${button.className} gap-1.5`}
      style={button.style}
      aria-label={button.showCount ? undefined : `${button.label}, ${count} ${count === 1 ? "item" : "items"}`}
    >
      {button.showIcon ? <BagIcon /> : null}
      {label}
    </Link>
  );
}
