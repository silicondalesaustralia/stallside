export type Testimonial = {
  id: string;
  quote: string[];
  name: string;
  location: string;
  link?: { href: string; label: string };
};

export const testimonials: Testimonial[] = [
  {
    id: "fletchers-donnybrook",
    quote: [
      "We've been using Vendl.app to manage our sales and get our farm stand up and running, and we couldn't be happier with the experience. We officially opened yesterday, and the whole setup process has felt straightforward.",
      "We've already made some great upgrades in a short time, and the team has made it feel like a real partnership. It feels like we're on this journey together, and that support means a lot as our little farm business grows.",
      "We'd happily recommend Vendl.app to other small businesses and farm stands!",
    ],
    name: "The Fletchers · Fletcherbrook Small Farm",
    location: "Donnybrook, Western Australia",
    link: { href: "#fletcherbrook", label: "See their stand" },
  },
  {
    id: "marnie-melbourne",
    quote: [
      "I've built a lemonade stand that I'll be using now to sell our eggs. It's super cute. Now I'm inspired to actually go through with it so you can see. ;o)",
      "I was going to put my PayPal QR code out but was keen to try something that doesn't have so many fees - like PayID etc.",
      "It was all so easy and fast to set up - your 10min time set up was generous! I did it all in like 3! ahaha",
      "I'll stay in touch and well done for a cool app!",
    ],
    name: "Marnie",
    location: "Melbourne, Australia",
  },
];
