import type { HubNavItem } from "@/components/dash-nav-links";

/** Ordered create-flow steps inside Web Studio. */
export const WEB_STUDIO_STEPS: HubNavItem[] = [
  {
    href: "/dashboard/website/details",
    label: "1 · Business details",
    matchPrefix: "/dashboard/website/details",
  },
  {
    href: "/dashboard/website/branding",
    label: "2 · Branding",
    matchPrefix: "/dashboard/website/branding",
  },
  {
    href: "/dashboard/website/ai",
    label: "3 · AI builder",
    matchPrefix: "/dashboard/website/ai",
  },
  {
    href: "/dashboard/website/studio",
    label: "4 · Edit layout",
    matchPrefix: "/dashboard/website/studio",
  },
];

export function isWebStudioPath(pathname: string): boolean {
  return (
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
