import { buildSimpleTextPageNodes } from "./starter-nodes";

export const GV_ABOUT_SECTIONS = [
  {
    heading: "A little farm with a lot going on",
    body: "Green Valley is part bakery, part market garden and part farm stand — which means no two weeks look exactly the same.",
  },
  {
    heading: "It started with a few extra eggs",
    body: "Green Valley began with a vegetable patch, a small flock of hens and a sourdough starter that quickly got out of hand. At first, there were simply more eggs, bread and vegetables than we could use ourselves. A little honesty-box stand at the gate gave the extras somewhere to go. Then neighbours started asking what would be available next weekend.",
  },
  {
    heading: "Small by design",
    body: "We don't try to have everything available all the time. Our weekly bake has an order window so we know what needs to go into the oven. The garden follows the season. Eggs depend on the hens, not a warehouse forecast.",
  },
  {
    heading: "From the garden to the bread bench",
    body: "Some days at Green Valley are spent feeding hens and picking vegetables. Others are flour-covered days built around dough, ovens and cooling racks. Whether you're collecting a loaf, grabbing eggs from the stand or taking home a box of vegetables, the idea is the same: good local food without making it complicated.",
  },
];

export const GV_OUR_FARM_SECTIONS = [
  {
    heading: "Come by Green Valley",
    body: "Green Valley is a fictional micro-farm in the Adelaide Hills where our bakery, garden, hens and self-serve farm stand all share the same patch.",
  },
  {
    heading: "The farm stand",
    body: "The stand carries a changing selection of eggs, produce and pantry goods. Because stock follows what we have available, some days the shelves are full and other days a favourite disappears quickly. For the best choice, order online ahead of Saturday pickup.",
  },
  {
    heading: "What's growing",
    body: "Our garden changes throughout the year. Depending on the season, you might find leafy greens, tomatoes, zucchini, herbs, root vegetables and other small harvests appearing in the online shop or farm stand.",
  },
  {
    heading: "Visiting the farm",
    body: "The self-serve stand is open during the published demo hours. Preorder pickup runs on Saturday mornings. Because Green Valley is fictional, this public demo does not invite visitors to a real address.",
  },
];

export const GV_PICKUP_SECTIONS = [
  {
    heading: "Pickup & delivery",
    body: "Choose the option that works best for you at checkout.",
  },
  {
    heading: "Saturday farm pickup",
    body: "Orders from the weekly bake can be collected from Green Valley Farm on Saturday between 8:00 AM and 11:00 AM. We'll pack your order under the name used at checkout.",
  },
  {
    heading: "Shopping the farm stand",
    body: "You don't need a preorder to shop the self-serve stand. Farm stand stock changes throughout the week and is available while supplies last.",
  },
  {
    heading: "Local delivery",
    body: "Selected Adelaide Hills areas can choose Saturday afternoon delivery when their address is inside the configured delivery zone.",
  },
];

export const GV_FAQ_SECTIONS = [
  {
    heading: "When do weekly orders close?",
    body: "Our Saturday Farm Bake normally closes at 6:00 PM on Thursday. The current Menu always shows the actual closing time.",
  },
  {
    heading: "When can I collect my order?",
    body: "Our regular farm pickup window is Saturday from 8:00 AM to 11:00 AM. Check your order confirmation for the option selected.",
  },
  {
    heading: "Can I shop without preordering?",
    body: "Yes. The farm stand carries selected eggs, produce and pantry goods while stock lasts.",
  },
  {
    heading: "Do you deliver?",
    body: "Limited local delivery may be available to selected Adelaide Hills areas. Enter delivery details at checkout to see available options.",
  },
  {
    heading: "What if something is sold out?",
    body: "Products are made or harvested in small quantities. Join the Green Valley list if you'd like to hear when the next Menu opens.",
  },
  {
    heading: "Do your baked products contain allergens?",
    body: "Individual Product pages list seller-recorded ingredients and allergens. Do not treat this demo copy as a safety guarantee.",
  },
];

export const GV_CONTACT_SECTIONS = [
  {
    heading: "Get in touch",
    body: "Have a question about an order, pickup or what's coming up next week? Send us a message.\n\nDemo email: hello@greenvalley.demo.vendl.app\nLocation: Adelaide Hills, South Australia\n\nThis is a fictional Vendl demo store — contact submissions may not be delivered.",
  },
];

export const GV_PRIVACY_SECTIONS = [
  {
    heading: "Privacy (demo)",
    body: "Green Valley Farm & Bakes is a fictional store created to demonstrate Vendl. Information may be collected when customers place orders, join a mailing list, submit a contact form or interact with the storefront. This page is placeholder demo content, not legal advice.",
  },
];

export const GV_TERMS_SECTIONS = [
  {
    heading: "Terms (demo)",
    body: "Orders are subject to availability. Prices are in AUD. Pickup or delivery is chosen at checkout. Many products are perishable. Green Valley Farm & Bakes is a fictional Vendl demo. This page is starter content, not legal advice, and does not attempt to exclude rights that cannot legally be excluded.",
  },
];

export const GV_RETURNS_SECTIONS = [
  {
    heading: "Returns & refunds (demo)",
    body: "Because many Green Valley products are fresh or perishable, change-of-mind returns may not be practical. If an order is incorrect or there is a problem with an item, contact us as soon as possible so the issue can be reviewed. This is demo placeholder content — production sellers must configure appropriate policies.",
  },
];

export function greenValleyPageNodes() {
  return {
    about: buildSimpleTextPageNodes("About Green Valley", GV_ABOUT_SECTIONS),
    "our-farm": buildSimpleTextPageNodes("Our Farm", GV_OUR_FARM_SECTIONS),
    "pickup-delivery": buildSimpleTextPageNodes(
      "Pickup & Delivery",
      GV_PICKUP_SECTIONS,
    ),
    faq: buildSimpleTextPageNodes("FAQ", GV_FAQ_SECTIONS),
    contact: buildSimpleTextPageNodes("Contact", GV_CONTACT_SECTIONS),
    privacy: buildSimpleTextPageNodes("Privacy", GV_PRIVACY_SECTIONS),
    terms: buildSimpleTextPageNodes("Terms", GV_TERMS_SECTIONS),
    returns: buildSimpleTextPageNodes("Returns & refunds", GV_RETURNS_SECTIONS),
  };
}
