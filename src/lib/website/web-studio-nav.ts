import type { HubNavItem } from "@/components/dash-nav-links";

export type WebStudioTabId = "details" | "branding" | "ai" | "studio";

export const WEB_STUDIO_TABS: {
  id: WebStudioTabId;
  label: string;
}[] = [
  { id: "details", label: "1 · Business details" },
  { id: "branding", label: "2 · Branding" },
  { id: "ai", label: "3 · AI builder" },
  { id: "studio", label: "4 · Edit layout" },
];

/** Ordered create-flow steps inside Web Studio (URL targets for deep links). */
export const WEB_STUDIO_STEPS: HubNavItem[] = WEB_STUDIO_TABS.map((tab) => ({
  href: `/dashboard/website/web-studio?tab=${tab.id}`,
  label: tab.label,
  matchPrefix: "/dashboard/website/web-studio",
}));

export function parseWebStudioTab(raw: string | undefined): WebStudioTabId {
  if (raw === "branding" || raw === "ai" || raw === "studio" || raw === "details") {
    return raw;
  }
  return "details";
}

export function webStudioPath(
  tab: WebStudioTabId,
  query?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
  }
  return `/dashboard/website/web-studio?${params.toString()}`;
}

export function isWebStudioPath(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard/website/web-studio") ||
    pathname.startsWith("/dashboard/website/details") ||
    pathname.startsWith("/dashboard/website/basics") ||
    pathname.startsWith("/dashboard/website/branding") ||
    pathname.startsWith("/dashboard/website/ai") ||
    pathname.startsWith("/dashboard/website/studio") ||
    pathname.startsWith("/dashboard/website/craft-spike") ||
    pathname.startsWith("/dashboard/website/puck-spike") ||
    pathname === "/dashboard/website"
  );
}
