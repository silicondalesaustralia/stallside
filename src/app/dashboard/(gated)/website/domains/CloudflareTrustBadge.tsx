import Image from "next/image";

/** Official Cloudflare “protected and accelerated” badge for Domains DNS setup. */
export default function CloudflareTrustBadge() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--line)] bg-white px-3 py-3">
      <Image
        src="/brand/cloudflare-protected-badge.jpg"
        alt="Protected and accelerated by Cloudflare services"
        width={828}
        height={271}
        className="h-auto w-full max-w-[280px]"
      />
      <p className="text-xs leading-snug text-[var(--muted)]">
        You only add DNS records at your domain host — never share registrar
        passwords or API keys with Vendl.
      </p>
    </div>
  );
}
