import {
  activeStandSocials,
  type StandSocialUrls,
} from "@/lib/stand-social";

export default function StandSocialLinks({
  urls,
  standName,
  className,
}: {
  urls: StandSocialUrls;
  standName: string;
  className?: string;
}) {
  const links = activeStandSocials(urls);
  if (links.length === 0) return null;

  return (
    <nav
      className={`flex items-center justify-center gap-3 ${className ?? "mt-3"}`}
      aria-label={`${standName} on social media`}
    >
      {links.map((social) => (
        <a
          key={social.id}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${standName} on ${social.label}`}
          className="text-[var(--muted)] transition hover:text-[var(--ink)]"
        >
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d={social.path} />
          </svg>
        </a>
      ))}
    </nav>
  );
}
