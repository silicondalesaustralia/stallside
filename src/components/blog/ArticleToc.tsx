import type { ArticleHeading } from "@/lib/blog/heading-ids";
import SidebarSection from "./SidebarSection";

export default function ArticleToc({ headings }: { headings: ArticleHeading[] }) {
  if (headings.length < 2) return null;
  return (
    <SidebarSection title="On this page" className="hidden lg:block">
      <nav aria-label="On this page">
        <ol className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className="block leading-snug text-[var(--ink)] underline-offset-2 hover:text-[var(--leaf-dark)] hover:underline"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </SidebarSection>
  );
}
