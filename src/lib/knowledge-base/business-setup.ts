import type { KnowledgeArticle } from "./types";

export const businessSetupArticles: KnowledgeArticle[] = [
  {
    slug: "business-details",
    title: "Business details and settings",
    summary:
      "Change your business name, location, currency and timezone, and see your site address.",
    keywords: ["business", "stand", "link", "url", "domain", "currency", "timezone", "delete stand", "website build", "done for you"],
    related: ["first-stand", "qr-signs", "stand-branding", "cash-payid"],
    ctas: [{ label: "My Businesses", href: "/dashboard/businesses" }],
    steps: [
      "Use the Business switcher at the bottom of the sidebar (More on your phone) and tap Manage. Your business opens on the Business Details tab.",
      "Edit Business name, Suburb / location, Currency and Timezone.",
      "Your site URL shows your free Vendl address, or your own domain once connected. Tap Connect a domain to add one.",
      "Tap Save details.",
      "How shoppers pay is set on the Payments page, not here.",
    ],
    tips: [
      "PayID only works in AUD. Changing currency away from AUD turns PayID off.",
      "Timezone sets when pre-order windows open and close.",
      "Delete this stand permanently deletes its products, orders and history. It can't be undone.",
      "You can run as many businesses as you like on any plan. Switch between them with the Business switcher.",
      "Want us to build your website and connect your domain? Tap Book a Done-For-You Build in Web Studio or on the Upgrade to Pro page. It's a one-off US$400 or the equivalent in your currency.",
    ],
  },
  {
    slug: "qr-signs",
    title: "Design and print your QR sign",
    summary:
      "Set the sign's wording and sections, preview it live, then print A4, half or quarter A4, or download a PNG.",
    keywords: ["qr", "print", "poster", "sign", "png", "a4", "cta", "farmstand"],
    related: ["first-stand", "customer-choice-cart", "stand-branding", "volume-prices"],
    ctas: [{ label: "Farmstand", href: "/dashboard/farmstand" }],
    steps: [
      "In the sidebar under Farmstand, tap Farmstand, then Print QR poster.",
      "Under Edit QR sign, choose the Cart mode (Product cart or Customer Choice cart), then fill in Stand name, Location, Sign message and Instructions. Add an Attention callout for anything urgent.",
      "Under Poster sections, choose what to show: Big CTA headline (with your own CTA text), Sign message + instructions, Bundle / volume prices, First-order offer, Freshness lines, and How it works.",
      "Check the live preview, then tap Save sign details.",
      "Pick a Print size: A4, Half A4 (2 per page) or Quarter A4 (4 per page, with cut lines). Print, or tap Download PNG.",
      "Use Copy checkout link to share the same page online.",
    ],
    tips: [
      "Your QR code opens your farmstand at your web address followed by /farmstand, even if you also have a website. The farmstand and website share products, cart and checkout.",
      "The payment icons on the poster follow what's ticked under Payments → Checkout payments.",
      "First-order offer only shows once you've turned on a first-order discount on the Upsells tab.",
      "Reprint after changing your logo, cart mode or checkout link.",
    ],
  },
  {
    slug: "customer-choice-cart",
    title: "Customer Choice cart",
    summary:
      "Let shoppers type in the prices of what they picked at an unattended stall. No catalogue or stock needed.",
    keywords: ["honesty", "unattended", "calculator", "price tags", "no products"],
    related: ["qr-signs", "cash-payid", "customer-payments"],
    ctas: [{ label: "My Businesses", href: "/dashboard/businesses" }],
    steps: [
      "Open Farmstand → Print QR poster. Under Cart mode, choose Customer Choice cart and tap Save sign details.",
      "Reprint the QR. The code now opens a Pay what you picked page.",
      "Shoppers type each price (for example $10, then $5), see a running Total and tap Continue to pay.",
      "They pay with cash, PayID (AUD) or card through Stripe, depending on what you've ticked under Payments → Checkout payments.",
      "Orders appear in Orders as a Customer choice line for the amount paid. Stock doesn't change.",
      "Switch back to Product cart anytime on the same page, then reprint.",
    ],
    tips: [
      "Square card isn't offered on Customer Choice. If Square is your checkout provider, shoppers can pay cash or PayID only, so connect Stripe if you want card here.",
      "Each total must be between 50 cents and 5,000.",
      "Use Product cart when you sell named items with stock. Use Customer Choice when goods already have price tags.",
    ],
  },
  {
    slug: "stand-branding",
    title: "Logo, colours, and social links",
    summary:
      "Make your shop and QR sign look like your business with a logo, colours, share image and social links.",
    keywords: ["logo", "brand", "colour", "color", "instagram", "facebook", "share image"],
    related: ["qr-signs", "business-details", "social-overview"],
    ctas: [{ label: "My Businesses", href: "/dashboard/businesses" }],
    steps: [
      "Open your business and choose the Branding tab.",
      "Tap Choose logo and upload a JPEG, PNG, WebP or HEIC. It appears on your shop header and QR sign.",
      "Set Primary colour (buttons) and Secondary colour (price / stock). Tick Vendl default to go back to the standard colours.",
      "Add a Share / link preview image (about 1200×630). It shows when your link is shared in WhatsApp, Messages or Facebook. Without one, your logo is used.",
      "Tap Save branding, then open your shop link to check.",
      "For social links, open the Business Details tab and add Instagram, Facebook, TikTok, YouTube or Website. Leave a field blank to hide it.",
    ],
    tips: [
      "The Branding tab sets your farmstand's logo and colours and your farmstand QR poster. Your website has its own look in Web Studio → Branding.",
      "Social icons show on your shop page, not on the QR poster or the Customer Choice page.",
      "Reprint your QR sign after changing the logo.",
    ],
  },
];
