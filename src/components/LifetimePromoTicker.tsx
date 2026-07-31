import Link from "next/link";
import {
  getPromoLifetimeSeatsLeft,
  promoLifetimeInvitePath,
} from "@/lib/promo-invite";

function TickerGroup({
  line,
  prefix,
}: {
  line: string;
  prefix: string;
}) {
  return (
    <div className="ticker-group" aria-hidden={prefix !== "a" ? true : undefined}>
      {Array.from({ length: 8 }, (_, i) => (
        <span key={`${prefix}-${i}`} className="ticker-item">
          {line}
          <span className="ticker-sep" aria-hidden>
            ·
          </span>
        </span>
      ))}
    </div>
  );
}

/** Top-of-site marquee for the Free for Life promo invite. */
export default async function LifetimePromoTicker() {
  const left = await getPromoLifetimeSeatsLeft();
  if (left <= 0) return null;

  const href = promoLifetimeInvitePath();
  const line = `${left} Pro-for-life memberships left · Click to claim invite`;

  return (
    <Link
      href={href}
      className="ticker-tape group relative z-30 block overflow-hidden bg-[var(--marigold)] text-[var(--field)] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[var(--field)] focus-visible:ring-offset-2"
      aria-label={`${left} Pro-for-life memberships left. Click to claim invite.`}
    >
      <div className="ticker-track">
        <TickerGroup line={line} prefix="a" />
        <TickerGroup line={line} prefix="b" />
      </div>
    </Link>
  );
}
