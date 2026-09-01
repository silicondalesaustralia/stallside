const iconClass = "size-5 shrink-0";

function Icon({
  d,
  extra,
}: {
  d: string;
  extra?: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClass}
      aria-hidden
    >
      <path d={d} />
      {extra}
    </svg>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  "/dashboard/getting-started": (
    <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  ),
  "/dashboard/businesses": (
    <Icon d="M5 20V10l7-5 7 5v10M9 20v-6h6v6" />
  ),
  "/dashboard/settings/stripe": (
    <Icon d="M4 8h16v10H4zM4 8l2-3h12l2 3M8 13h4" />
  ),
  "/dashboard/settings/billing": (
    <Icon d="M12 3v18M8 8h7a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7" />
  ),
  "/dashboard": (
    <Icon d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
  ),
  "/dashboard/products": (
    <Icon d="M4 8h16v12H4zM4 8l2-4h12l2 4M9 12h6" />
  ),
  "/dashboard/categories": (
    <Icon d="M4 6h7v7H4zM13 6h7v7h-7M4 15h7v5H4zM13 15h7v5h-7" />
  ),
  "/dashboard/customers": (
    <Icon d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM4 20c1.5-3 4-5 8-5s6.5 2 8 5" />
  ),
  "/dashboard/website": (
    <Icon d="M4 6h16v12H4zM4 9h16M8 13h8" />
  ),
  "/dashboard/website/domains": (
    <Icon d="M12 3v18M8 8h7a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7" />
  ),
  "/dashboard/orders": (
    <Icon d="M7 3h10v18H7zM10 7h4M10 11h4M10 15h3" />
  ),
  "/dashboard/collections": (
    <Icon d="M5 11h14l-1.5 8H6.5L5 11zM8 11 10 5h4l2 6" />
  ),
  "/dashboard/pre-order-pages": (
    <Icon d="M6 4h12v16H6zM6 9h12M10 13h4" extra={<path d="M9 2v4M15 2v4" />} />
  ),
  "/dashboard/subscriptions": (
    <Icon d="M5 12a7 7 0 0 1 12-4l2-2v6h-6M19 12a7 7 0 0 1-12 4l-2 2v-6h6" />
  ),
  "/dashboard/notifications": (
    <Icon d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9M10 21h4" />
  ),
  "/dashboard/knowledge": (
    <Icon d="M4 5h7v14H4zM13 5h7v14h-7M8 8h1M17 8h1" />
  ),
  "/dashboard/settings": (
    <Icon d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM12 3v2M12 19v2M4.9 6.5l1.7 1M17.4 16.5l1.7 1M3 12h2M19 12h2M4.9 17.5l1.7-1M17.4 7.5l1.7-1" />
  ),
  "/admin": (
    <Icon d="M4 19V5h16v14zM8 9h8M8 13h5" />
  ),
  "/admin/owners": (
    <Icon d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM4 20c1.5-3 4-5 8-5s6.5 2 8 5" />
  ),
  "/admin/invites": (
    <Icon d="M4 6h16v12H4zM4 6l8 7 8-7" />
  ),
  "/admin/billing": (
    <Icon d="M4 8h16v10H4zM4 8l2-3h12l2 3M8 13h4" />
  ),
  "/admin/gallery": (
    <Icon d="M4 5h16v14H4zM8 14l3-3 3 3 2-2 4 4" extra={<path d="M8 9h.01" />} />
  ),
  "/admin/stands": (
    <Icon d="M5 20V10l7-5 7 5v10M9 20v-6h6v6" />
  ),
  "/admin/orders": (
    <Icon d="M7 3h10v18H7zM10 7h4M10 11h4M10 15h3" />
  ),
};

export default function DashNavIcon({ href }: { href: string }) {
  return ICONS[href] ?? <Icon d="M5 12h14" />;
}
