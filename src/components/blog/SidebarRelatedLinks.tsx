import Link from "next/link";
import type { RelatedArticle } from "@/lib/blog/related-articles";
import SidebarSection from "./SidebarSection";

export default function SidebarRelatedLinks({ items }: { items: RelatedArticle[] }) {
  if (items.length === 0) return null;
  return (
    <SidebarSection title="Related guides">
      <ul className="space-y-3 text-sm">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="font-semibold leading-snug text-[var(--field)] underline-offset-2 hover:text-[var(--leaf-dark)] hover:underline"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </SidebarSection>
  );
}
