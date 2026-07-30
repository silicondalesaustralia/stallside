export type Testimonial = {
  id: string;
  quote: string[];
  name: string;
  location: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "marnie-melbourne",
    quote: [
      "I've built a lemonade stand that I'll be using now to sell our eggs. It's super cute. Now I'm inspired to actually go through with it so you can see. ;o)",
      "I was going to put my PayPal QR code out but was keen to try something that doesn't have so many fees — like PayID etc.",
      "It was all so easy and fast to set up — your 10min time set up was generous! I did it all in like 3! ahaha",
      "I'll stay in touch and well done for a cool app!",
    ],
    name: "Marnie",
    location: "Melbourne, Australia",
  },
];
