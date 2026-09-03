export const CAMPAIGN_TEMPLATES: Record<
  string,
  {
    label: string;
    name: string;
    subject: string;
    heading: string;
    body: string;
    ctaLabel: string;
  }
> = {
  new_menu: {
    label: "New menu / drop",
    name: "New menu",
    subject: "Our new menu is ready",
    heading: "Fresh from the kitchen",
    body: "We've put together a new menu. Order soon — quantities are limited.",
    ctaLabel: "View menu",
  },
  we_miss_you: {
    label: "We miss you",
    name: "We miss you",
    subject: "We haven't seen you in a while",
    heading: "Come back soon",
    body: "It's been a little while since your last order. We'd love to see you again.",
    ctaLabel: "Shop now",
  },
  special_offer: {
    label: "Special offer",
    name: "Special offer",
    subject: "A little something for you",
    heading: "Special for our regulars",
    body: "Use the code in this email on your next order. Thanks for supporting a small business.",
    ctaLabel: "Claim offer",
  },
};
