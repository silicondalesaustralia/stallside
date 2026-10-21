export type FeaturedStandImage = {
  /** Path under /public, e.g. "/gallery/my-stand.jpg" */
  src: string;
  alt: string;
};

export type FeaturedStandLink = {
  href: string;
  label: string;
};

export type FeaturedStand = {
  id: string;
  name: string;
  location: string;
  /** First image is the main photo; a second is overlaid as a collage. */
  images: FeaturedStandImage[];
  /** Short tag above the name, e.g. "New stand" */
  eyebrow?: string;
  description: string[];
  /** Quick facts shown as chips, e.g. "Farm eggs", "PayID" */
  highlights?: string[];
  /** First link renders as the primary button. */
  links?: FeaturedStandLink[];
};

export const featuredStands: FeaturedStand[] = [
  {
    id: "fletcherbrook",
    eyebrow: "New stand",
    name: "The Fletchers · Fletcherbrook Small Farm",
    location: "Donnybrook, Western Australia",
    images: [
      {
        src: "/gallery/fletchers-artisan-soaps.jpg",
        alt: "Fletcherbrook Small Farm handmade goat's milk artisan soaps on display with goat plushies",
      },
      {
        src: "/gallery/fletchers-goats-milk-soap-bars.jpg",
        alt: "Three Fletchers goat's milk soap bars: unscented, rosemary, and activated charcoal sea salt",
      },
    ],
    description: [
      "A family of five living sustainably on one acre in Donnybrook, WA - sharing renovations, gardening, and all things small-scale farming.",
      "Their herd of Nigerian Dwarf and Mini LaMancha goats supplies the fresh milk for their handmade soaps, alongside farm eggs, raw goat's milk, and goat plushies - all available to pre-order through their Vendl stand.",
    ],
    highlights: ["Goat's milk soaps", "Raw goat's milk", "Farm eggs", "Pre-orders"],
    links: [
      { href: "https://vendl.app/s/fletcherbrook", label: "Visit their stand" },
      { href: "https://www.facebook.com/FletcherbrookSmallFarm", label: "Follow on Facebook" },
    ],
  },
  {
    id: "jacaranda-hill",
    eyebrow: "New stand",
    name: "Sarah & Rob · Jacaranda Hill Farm",
    location: "Fairbridge, Western Australia",
    images: [
      {
        src: "/gallery/jacaranda-hill-farm-shop.jpg",
        alt: "The timber Jacaranda Hill Farm Shop on a paddock at sunrise, with chairs and a fire pit beside it",
      },
      {
        src: "/gallery/jacaranda-hill-pasture-raised-eggs.jpg",
        alt: "Jacaranda Hill Farm pasture-raised egg cartons with hand-drawn farm artwork beside a vase of wattle",
      },
    ],
    description: [
      "Sarah and Rob run Jacaranda Hill Farm on 108 acres of regenerative bushland at the edge of the Darling Scarp near Pinjarra, about an hour south of Perth. It is also an award-winning off-grid campsite, twice named Hipcamp's Best Campsite in WA.",
      "Their pasture-raised eggs, handmade honey soap and farm goods are sold from the on-farm Jacaranda Hill Farm Shop - and are available to order through their Vendl stand.",
    ],
    highlights: ["Pasture-raised eggs", "Honey soap", "On-farm shop", "Off-grid camping"],
    links: [
      { href: "https://vendl.app/s/jacaranda-hill-farm-shop", label: "Visit their stand" },
      { href: "https://www.jacarandahill.com.au", label: "Visit their website" },
    ],
  },
];
