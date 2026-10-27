import type { KnowledgeArticle } from "./types";

export const communicationArticles: KnowledgeArticle[] = [
  {
    slug: "email-campaigns",
    title: "Send an email to your customers",
    summary:
      "Write a formatted email to a list, everyone who bought a product or pre-order, or one customer.",
    keywords: ["campaign", "newsletter", "broadcast", "email", "marketing", "message", "communication"],
    related: ["customer-lists", "restock-emails", "customers"],
    ctas: [{ label: "New message", href: "/dashboard/communication/new" }],
    steps: [
      "Open Communication and tap + New message.",
      "Under Who, choose Everyone opted into marketing, a Saved list, people who Bought via a pre-order page, people who Bought these products, or One customer.",
      "For a saved list, untick anyone you want to leave out in Recipients.",
      "Enter a Subject and optional Heading, then write your Message. Use the buttons for bold, italic, links and lists.",
      "Optionally add a Button label and Button URL, for example Order now with your shop link.",
      "Tap Send. Sending starts straight away and the message page shows how many were sent, any that failed, and how many times the button link was clicked.",
    ],
    tips: [
      "Up to 500 recipients per message. Large sends finish in the background; refresh after a minute.",
      "Every email has an unsubscribe link, and unsubscribed people are skipped automatically.",
      "There are no drafts or scheduled sends, so check before you tap Send.",
    ],
  },
  {
    slug: "restock-emails",
    title: "Tell customers when you've restocked",
    summary: "Shoppers opt in after checkout. When you restock, send everyone one email.",
    keywords: ["restock", "back in stock", "notify", "waitlist", "opt in", "sold out"],
    related: ["email-campaigns", "customers", "alerts-push"],
    ctas: [{ label: "Communication", href: "/dashboard/communication" }],
    steps: [
      "After paying, shoppers see Get notified when we're back and can tap Yes, email me. They join your Restock alerts list.",
      "When you've restocked, open Communication. Under Standing lists, find Restock alerts and tap Broadcast.",
      "Check the recipients, write a short subject and message (for example Fresh sourdough is back this Saturday), and add a button to your shop if you like.",
      "Tap Send.",
    ],
    tips: [
      "Restock alerts collects sign-ups from all your businesses in one list.",
      "People who opt in also appear in Customers as happy to get marketing.",
    ],
  },
];
