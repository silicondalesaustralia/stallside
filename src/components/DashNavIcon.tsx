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
  "/dashboard": (
    <Icon d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
  ),
  "/dashboard/products": (
    <Icon d="M4 8h16v12H4zM4 8l2-4h12l2 4M9 12h6" />
  ),
  "/dashboard/orders": (
    <Icon d="M7 3h10v18H7zM10 7h4M10 11h4M10 15h3" />
  ),
  "/dashboard/collections": (
    <Icon d="M5 11h14l-1.5 8H6.5L5 11zM8 11 10 5h4l2 6" />
  ),
  "/dashboard/inventory": (
    <Icon d="M4 5h16v4H4zM4 11h16v4H4zM4 17h16v4H4z" />
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
};

export default function DashNavIcon({ href }: { href: string }) {
  return ICONS[href] ?? <Icon d="M5 12h14" />;
}
