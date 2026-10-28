export const SITE_WIDE_TABS = [
  { id: "text", label: "Fonts & text", hint: "Heading and body fonts, colours and sizes." },
  { id: "layout", label: "Layout & spacing", hint: "Page width, section spacing, margins and corners." },
  { id: "colours", label: "Colours", hint: "Page background, buttons and links on every page." },
  { id: "cards", label: "Buttons, cards & effects", hint: "Button shape and size, product cards, animation." },
  { id: "chrome", label: "Header & footer", hint: "Menu links, logo, announcement bar and footer." },
  { id: "sharing", label: "Search & social", hint: "How your site looks in Google and when shared." },
  { id: "favicon", label: "Favicon", hint: "The small icon in browser tabs, bookmarks and Google results on your own domain." },
  { id: "shop", label: "Shop & categories", hint: "Sorting, filters and sale badges on your shop and category pages." },
] as const;

export type SiteWideTabId = (typeof SITE_WIDE_TABS)[number]["id"];
