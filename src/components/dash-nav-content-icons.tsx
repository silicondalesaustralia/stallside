import Icon from "@/components/NavIconSvg";

/** Icons for content, website and QR links in the owner sidebar. */
export const CONTENT_NAV_ICONS: Record<string, React.ReactNode> = {
  "/dashboard/categories": (
    <Icon d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
  ),
  "/dashboard/website/pages": (
    <Icon d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" />
  ),
  "/dashboard/website/blog/topics": (
    <Icon d="M3 12V4h8l10 10-8 8L3 12z" extra={<path d="M7.5 7.5h.01" />} />
  ),
  "/dashboard/website/blog": (
    <Icon d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
  ),
  "/dashboard/website/redirects": (
    <Icon d="M4 7h11l-3-3M15 7l-3 3M20 17H9l3 3M9 17l3-3" />
  ),
  "/dashboard/website/domains": (
    <Icon d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
  ),
  "/dashboard/qr": (
    <Icon d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" />
  ),
};
