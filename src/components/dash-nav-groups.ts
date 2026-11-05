import type { DashNavGroup } from "@/components/dash-nav-links";

const WEB_STUDIO_PREFIXES = [
  "/dashboard/website/details",
  "/dashboard/website/basics",
  "/dashboard/website/branding",
  "/dashboard/website/ai",
  "/dashboard/website/studio",
  "/dashboard/website/craft-spike",
  "/dashboard/website/puck-spike",
];

/** The dashboard sidebar. `pro` links show a PRO chip to Free owners and open an upgrade card. */
export const DASH_NAV_GROUPS: DashNavGroup[] = [
  { heading: null, links: [{ href: "/dashboard", label: "Overview" }] },
  {
    heading: "Pages & Posts",
    links: [
      { href: "/dashboard/categories", label: "Product categories" },
      { href: "/dashboard/products", label: "Products" },
      { href: "/dashboard/pre-order-pages", label: "Pre-order pages" },
      { href: "/dashboard/subscriptions", label: "Subscriptions" },
      { href: "/dashboard/website/pages", label: "Pages", websiteOnly: true, pro: true },
      { href: "/dashboard/website/blog/topics", label: "Blog Categories", websiteOnly: true, pro: true },
      { href: "/dashboard/website/blog", label: "Blog Posts", websiteOnly: true, pro: true },
    ],
  },
  {
    heading: "Marketing",
    links: [
      { href: "/dashboard/upsells", label: "Upsells & offers" },
      { href: "/dashboard/discounts", label: "Discounts", pro: true },
      { href: "/dashboard/communication", label: "Communications", pro: true },
      { href: "/dashboard/reviews", label: "Reviews", pro: true },
      { href: "/dashboard/social", label: "Social", socialKit: true },
    ],
  },
  {
    heading: "Operations",
    links: [
      { href: "/dashboard/orders", label: "Orders" },
      { href: "/dashboard/shipping", label: "Shipping" },
      { href: "/dashboard/inventory", label: "Inventory" },
      { href: "/dashboard/customers", label: "Customers" },
      { href: "/dashboard/suppliers", label: "Suppliers" },
      { href: "/dashboard/collections", label: "Pick Ups & Delivery" },
      { href: "/dashboard/calendar", label: "Calendar", pro: true },
      { href: "/dashboard/qr", label: "QR codes" },
      { href: "/dashboard/data", label: "Data management" },
    ],
  },
  {
    heading: "Production",
    links: [
      { href: "/dashboard/production", label: "Batches", pro: true },
      { href: "/dashboard/production/materials", label: "Materials", pro: true },
      { href: "/dashboard/production/recipes", label: "Recipes & costing", pro: true },
      { href: "/dashboard/production/profit", label: "Profit & loss", pro: true },
    ],
  },
  {
    heading: "Website",
    links: [
      {
        href: "/dashboard/website/web-studio",
        label: "Web Studio",
        websiteOnly: true,
        pro: true,
        alsoActiveOn: WEB_STUDIO_PREFIXES,
      },
      { href: "/dashboard/website/redirects", label: "Redirects", websiteOnly: true, pro: true },
      { href: "/dashboard/website/tags-pixels", label: "Tags & Pixels", websiteOnly: true, pro: true },
      { href: "/dashboard/website/domains", label: "Domains", websiteOnly: true, pro: true },
    ],
  },
  {
    heading: "Settings",
    links: [
      {
        href: "/dashboard/business-details",
        label: "Business Details",
        alsoActiveOn: ["/dashboard/businesses"],
      },
      {
        href: "/dashboard/payments",
        label: "Payments",
        alsoActiveOn: ["/dashboard/settings/stripe", "/dashboard/settings/square", "/dashboard/settings/paypal"],
      },
      { href: "/dashboard/settings/tax", label: "Tax" },
      { href: "/dashboard/settings", label: "Account" },
      { href: "/dashboard/referrals", label: "Referrals" },
    ],
  },
  {
    heading: null,
    links: [
      { href: "/dashboard/notifications", label: "Notifications" },
      { href: "/dashboard/knowledge", label: "Guides" },
      { href: "/dashboard/connectors", label: "Connectors" },
    ],
  },
];
