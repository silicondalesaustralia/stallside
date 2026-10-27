import type { KnowledgeArticle } from "./types";

export const accountArticles: KnowledgeArticle[] = [
  {
    slug: "referrals",
    title: "Earn with referrals",
    summary:
      "Share your link and earn 50% of every Pro payment from sellers you refer, for as long as they stay on Pro.",
    availability: "Pro",
    keywords: ["referral", "affiliate", "commission", "earn", "link"],
    related: ["billing"],
    ctas: [{ label: "Referrals", href: "/dashboard/referrals" }],
    steps: [
      "Referrals are for Vendl Pro accounts. On Free you'll see Upgrade to Pro instead.",
      "Open Referrals in the sidebar and copy Your referral link.",
      "Share it with other growers, bakers and makers. Anyone who signs up within 90 days of clicking is linked to you.",
      "You earn 50% of each Pro payment (excluding tax) from your referrals while they're on Pro and you're on Pro too.",
      "Track Link clicks, Signups, Live Pro, Owed to you and Paid to date on the same page. Your referrals lists each seller and their plan.",
    ],
    tips: ["Commission is paid out manually. Missed shows commission you missed while you weren't on Pro."],
  },
  {
    slug: "share-your-stand",
    title: "Share your stand in the gallery",
    summary: "Send a photo of your stall for the Vendl testimonials and gallery page.",
    keywords: ["gallery", "photo", "testimonial", "showcase"],
    related: ["stand-branding"],
    ctas: [{ label: "Share your stand", href: "/dashboard/gallery/submit" }],
    steps: [
      "Open Share your stand.",
      "Pick Your stand (optional), then enter a Display name and Location (town or region).",
      "Add a Caption (optional, up to 200 characters) and a Photo (JPEG, PNG, WebP or HEIC).",
      "Tick the consent box and tap Submit for review. It appears in the gallery once approved.",
    ],
  },
  {
    slug: "close-account",
    title: "Close your account",
    summary:
      "Stop your subscription, emails and live shops in one step. Your data is kept if you come back.",
    keywords: ["delete", "close", "cancel", "account", "remove"],
    related: ["billing", "business-details"],
    ctas: [{ label: "Settings", href: "/dashboard/settings" }],
    steps: [
      "Open Settings and scroll to Account.",
      "Tap Delete account, read the list, then tap Yes, delete my account.",
      "Your Vendl Pro subscription is cancelled straight away, your shops go offline, and alert and marketing emails stop.",
      "Your data is kept. Signing up again with the same email reopens your account.",
    ],
    tips: [
      "Just want to close one business? Use Delete this stand on its Business Details tab instead. That one is permanent.",
      "Only want to stop paying? Cancel Pro from Vendl billing and you'll move to Free.",
    ],
  },
];
