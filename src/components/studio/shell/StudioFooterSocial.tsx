import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";

type SocialBranding = Pick<ResolvedStorefrontBranding, "instagramUrl" | "facebookUrl" | "tiktokUrl" | "youtubeUrl">;

/** Social profile links the seller set in their business details, in a fixed order. */
export function footerSocialLinks(branding: SocialBranding): { label: string; href: string }[] {
  return [
    { label: "Instagram", href: branding.instagramUrl },
    { label: "Facebook", href: branding.facebookUrl },
    { label: "TikTok", href: branding.tiktokUrl },
    { label: "YouTube", href: branding.youtubeUrl },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href && /^https?:\/\//i.test(l.href)));
}

/** Footer row of social links; nothing renders when the seller has none. */
export default function StudioFooterSocial({ branding }: { branding: SocialBranding }) {
  const links = footerSocialLinks(branding);
  if (!links.length) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Social links">
      {links.map((link) => (
        <li key={link.label}>
          <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
