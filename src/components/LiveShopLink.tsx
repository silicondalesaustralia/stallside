import Link from "next/link";
import type { LiveShopLink as LiveShopLinkData } from "@/lib/load-live-shop-link";

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export default function LiveShopLink({
  link,
  setupHref,
}: {
  link: LiveShopLinkData;
  setupHref: string;
}) {
  if (!link.live) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Your shop is offline.{" "}
        <Link href={setupHref} className="font-semibold underline">
          Turn it on in Business setup
        </Link>
      </p>
    );
  }
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--field)] hover:bg-[var(--wash)]"
    >
      <span className="size-2 shrink-0 rounded-full bg-[var(--leaf)]" aria-hidden />
      View your shop
      <span className="truncate font-normal text-[var(--muted)]">{displayUrl(link.url)}</span>
      <span aria-hidden>↗</span>
    </a>
  );
}
