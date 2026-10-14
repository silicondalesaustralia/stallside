import type { ComponentType, SVGProps } from "react";
import { Facebook, Instagram, Youtube } from "lucide-react";
import type { ResolvedStorefrontBranding } from "@/lib/storefront/types";
import TikTokIcon from "./TikTokIcon";

type SocialBranding = Pick<ResolvedStorefrontBranding, "instagramUrl" | "facebookUrl" | "tiktokUrl" | "youtubeUrl">;
type SocialLink = { label: string; href: string; Icon: ComponentType<SVGProps<SVGSVGElement>> };

/** Social profile links the seller set in their business details, in a fixed order. */
export function footerSocialLinks(branding: SocialBranding): SocialLink[] {
  const all: (Omit<SocialLink, "href"> & { href: string | null })[] = [
    { label: "Instagram", href: branding.instagramUrl, Icon: Instagram },
    { label: "Facebook", href: branding.facebookUrl, Icon: Facebook },
    { label: "TikTok", href: branding.tiktokUrl, Icon: TikTokIcon },
    { label: "YouTube", href: branding.youtubeUrl, Icon: Youtube },
  ];
  return all.filter((l): l is SocialLink => Boolean(l.href && /^https?:\/\//i.test(l.href)));
}

/** Social icon links for the footer's bottom line; nothing renders when the seller has none. */
export default function StudioFooterSocial({ branding }: { branding: SocialBranding }) {
  const links = footerSocialLinks(branding);
  if (!links.length) return null;
  return (
    <ul className="flex items-center gap-3" aria-label="Social links">
      {links.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="grid size-8 place-items-center rounded-full opacity-80 transition hover:bg-current/10 hover:opacity-100"
          >
            <Icon aria-hidden className="size-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
