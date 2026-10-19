import Link from "next/link";
import { ADMIN_BLOG_TABS, type AdminBlogTab } from "@/lib/blog/admin-queries";
import { adminBlogPath } from "@/lib/blog/paths";

export default function AdminBlogTabs({
  active,
  counts,
}: {
  active: AdminBlogTab;
  counts: Record<AdminBlogTab, number>;
}) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Blog sections">
      {ADMIN_BLOG_TABS.map((tab) => {
        const isActive = tab.id === active;
        const count = counts[tab.id];
        return (
          <Link
            key={tab.id}
            href={adminBlogPath(tab.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              isActive
                ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
                : "bg-white text-[var(--ink)] ring-1 ring-[var(--line)] hover:bg-[var(--panel)]"
            }`}
          >
            {tab.label}
            {count ? (
              <span
                className={`ml-1.5 rounded-full px-1.5 text-xs ${
                  isActive ? "bg-white/20" : "bg-[var(--marigold)] text-[var(--field)]"
                }`}
              >
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
