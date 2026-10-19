import { socialPlatformLabel } from "@/lib/blog/social-platform";

/** Profile links; rel="me" ties them to the author's identity. */
export default function AuthorSocialLinks({ urls, name }: { urls: string[]; name: string }) {
  if (!urls.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label={`${name} elsewhere`}>
      {urls.map((url) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="me noopener noreferrer"
            className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-[var(--leaf-dark)] ring-1 ring-[var(--line)] hover:bg-[var(--panel)]"
          >
            {socialPlatformLabel(url)}
          </a>
        </li>
      ))}
    </ul>
  );
}
