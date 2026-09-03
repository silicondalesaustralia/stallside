export type GreenValleyProductSeed = {
  slug: string;
  name: string;
  priceCents: number;
  category: string;
  short: string;
  description: string;
  featured?: boolean;
  standChannel?: boolean;
};

export const GREEN_VALLEY_CATEGORIES = [
  { title: "Bread & Bakes", slug: "bread-bakes" },
  { title: "Farm Fresh", slug: "farm-fresh" },
  { title: "Sweet Things", slug: "sweet-things" },
  { title: "Pantry", slug: "pantry" },
  { title: "Boxes & Bundles", slug: "boxes-bundles" },
] as const;

export const GREEN_VALLEY_PRODUCTS: GreenValleyProductSeed[] = [
  {
    slug: "country-sourdough",
    name: "Country Sourdough",
    priceCents: 1200,
    category: "Bread & Bakes",
    short:
      "Our everyday country loaf with a crisp crust, open crumb and slow-fermented flavour.",
    description:
      "Our Country Sourdough is the loaf we bake every week. Made with flour, water, salt and our mature sourdough starter, the dough is fermented slowly before being baked until deeply golden. Equally at home beside soup, under poached eggs or toasted with butter. Baked fresh for Saturday collection.\n\nIngredients: Wheat flour, water, sourdough starter, salt.\nAllergens: Contains wheat/gluten.",
    featured: true,
  },
  {
    slug: "seeded-sourdough",
    name: "Seeded Sourdough",
    priceCents: 1400,
    category: "Bread & Bakes",
    short:
      "Slow-fermented sourdough packed with toasted sunflower, sesame and pumpkin seeds.",
    description:
      "Our seeded loaf starts with the same slow-fermented dough as our Country Sourdough, then gets a generous mix of toasted seeds. Great toasted, sliced for sandwiches or served alongside cheese and preserves.\n\nIngredients: Wheat flour, water, sourdough starter, sunflower seeds, pumpkin seeds, sesame seeds, salt.\nAllergens: Contains wheat/gluten and sesame.",
  },
  {
    slug: "rosemary-sea-salt-focaccia",
    name: "Rosemary & Sea Salt Focaccia",
    priceCents: 1500,
    category: "Bread & Bakes",
    short: "Soft, olive-oil-rich focaccia finished with rosemary and flaky sea salt.",
    description:
      "A generous focaccia with a crisp golden base and soft, airy centre. Finished with olive oil, rosemary and sea salt.\n\nIngredients: Wheat flour, water, olive oil, sourdough starter, rosemary, salt.\nAllergens: Contains wheat/gluten.",
    featured: true,
  },
  {
    slug: "cinnamon-morning-buns",
    name: "Cinnamon Morning Buns — Box of 4",
    priceCents: 1800,
    category: "Sweet Things",
    short:
      "Four soft morning buns layered with cinnamon sugar and finished with a light glaze.",
    description:
      "A Saturday morning favourite. Soft buns rolled with cinnamon sugar, baked until caramelised at the edges and finished with a light glaze.\n\nIngredients: Wheat flour, milk, butter, sugar, eggs, cinnamon, yeast, salt.\nAllergens: Contains wheat/gluten, milk and egg.",
    featured: true,
  },
  {
    slug: "seasonal-fruit-danish",
    name: "Seasonal Fruit Danish — Box of 4",
    priceCents: 2200,
    category: "Sweet Things",
    short: "Four flaky pastries filled with seasonal fruit and vanilla custard.",
    description:
      "Flaky pastry, vanilla custard and fruit selected for the week's bake. The exact fruit may change depending on availability.\n\nAllergens: Contains wheat/gluten, milk and egg.",
  },
  {
    slug: "free-range-eggs-dozen",
    name: "Free-Range Eggs — Dozen",
    priceCents: 800,
    category: "Farm Fresh",
    short: "A dozen fresh eggs from the Green Valley hens.",
    description:
      "Fresh eggs collected from our small flock and packed by the dozen. Egg size and shell colour naturally vary. Available online when stock allows and regularly stocked at the farm stand.",
    featured: true,
    standChannel: true,
  },
  {
    slug: "seasonal-farm-box",
    name: "Seasonal Farm Box",
    priceCents: 2800,
    category: "Boxes & Bundles",
    short:
      "A mixed box of seasonal Green Valley produce selected from what's looking best in the garden.",
    description:
      "Contents change from week to week and may include leafy greens, herbs, tomatoes, zucchini, root vegetables or other seasonal produce.",
    featured: true,
    standChannel: true,
  },
  {
    slug: "strawberry-jam",
    name: "Green Valley Strawberry Jam",
    priceCents: 1100,
    category: "Pantry",
    short:
      "Small-batch strawberry jam with a bright fruit flavour and simple ingredient list.",
    description:
      "Made in small batches with strawberries, sugar and lemon.\n\nIngredients: Strawberries, sugar, lemon.",
    featured: true,
    standChannel: true,
  },
  {
    slug: "garden-herb-salt",
    name: "Garden Herb Salt",
    priceCents: 900,
    category: "Pantry",
    short: "Sea salt blended with dried herbs from the Green Valley garden.",
    description:
      "A simple finishing salt made with garden herbs. Use it on roast vegetables, eggs, focaccia or anything that needs a little Green Valley lift.",
    standChannel: true,
  },
  {
    slug: "weekend-breakfast-box",
    name: "Weekend Breakfast Box",
    priceCents: 3800,
    category: "Boxes & Bundles",
    short:
      "Country Sourdough, a dozen eggs and Green Valley strawberry jam in one weekend-ready box.",
    description:
      "Three Green Valley staples packed together: one Country Sourdough, one dozen Free-Range Eggs and one jar Green Valley Strawberry Jam.",
    featured: true,
  },
  {
    slug: "chocolate-babka",
    name: "Chocolate Babka",
    priceCents: 1600,
    category: "Sweet Things",
    short: "A rich twisted loaf layered with dark chocolate filling.",
    description:
      "Soft enriched dough twisted around a dark chocolate filling and baked until glossy and deeply golden.\n\nAllergens: Contains wheat/gluten, milk and egg.",
  },
  {
    slug: "garden-greens",
    name: "Garden Greens",
    priceCents: 650,
    category: "Farm Fresh",
    short: "A fresh mixed bag of seasonal leaves from the Green Valley garden.",
    description:
      "A changing mix of fresh garden leaves harvested for the weekend. The blend varies depending on the season.",
    standChannel: true,
  },
];

export const GREEN_VALLEY_REVIEWS = [
  {
    id: "gv-rev-emma",
    rating: 5,
    title: null as string | null,
    body: "The Country Sourdough has become our Saturday ritual. Great bread and pickup couldn't be easier.",
    customerName: "Emma R.",
  },
  {
    id: "gv-rev-claire",
    rating: 5,
    title: null,
    body: "We ordered the breakfast box and cinnamon buns for family visiting. Everything disappeared before lunch.",
    customerName: "Claire M.",
  },
  {
    id: "gv-rev-sophie",
    rating: 5,
    title: null,
    body: "I love that the farm box changes with the season. It feels like opening a little surprise every week.",
    customerName: "Sophie T.",
  },
  {
    id: "gv-rev-daniel",
    rating: 5,
    title: null,
    body: "Fresh eggs, beautiful bread and a simple pickup. Exactly what we want from a local producer.",
    customerName: "Daniel K.",
  },
  {
    id: "gv-rev-jess",
    rating: 5,
    title: null,
    body: "The focaccia is dangerous. We bought one for dinner and had eaten half of it before we got home.",
    customerName: "Jess P.",
  },
] as const;

export const GREEN_VALLEY_BLOG_POSTS = [
  {
    id: "gv-post-bake-to-order",
    slug: "why-we-bake-to-order",
    title: "Why we bake to order",
    excerpt:
      "Why our weekly Menu closes before bake day — and why a little planning makes sense for a small bakery.",
    bodyHtml: `<h2>A different way to fill the oven</h2><p>A small bakery works differently when almost everything is made by hand. Instead of filling shelves and hoping every loaf finds a home, our weekly Menu gives us a clearer idea of what customers actually want before bake day begins.</p><p>Once Thursday orders close, we can plan the dough, organise the bake and get ready for Saturday pickup.</p><h2>Less guessing, more baking</h2><p>Preorders don't remove every surprise — sourdough would never allow that — but they do mean we're not guessing how many loaves or trays of buns need to be made.</p><h2>And there are still extras</h2><p>When we can, we make a few extras or stock the farm stand with what is available. But if there's something you really want for the weekend, ordering ahead is the safest bet.</p>`,
  },
  {
    id: "gv-post-farm-stand",
    slug: "what-youll-find-at-the-farm-stand",
    title: "What you'll find at the farm stand",
    excerpt:
      "Eggs are the regulars, but the rest of the Green Valley farm stand changes with the week and season.",
    bodyHtml: `<p>The Green Valley farm stand isn't a miniature supermarket. That's rather the point.</p><p>Eggs are one of our most regular items, but the rest of the shelves depend on what's happening around the farm.</p><h2>Check online, then expect a surprise</h2><p>Some products can be ordered online when we know what will be available. Others simply appear at the stand.</p><h2>Small quantities</h2><p>We keep the farm stand deliberately small. When something sells out, it may be gone until the garden, hens or bake schedule gives us more.</p>`,
  },
  {
    id: "gv-post-saturday",
    slug: "saturday-morning-at-green-valley",
    title: "A Saturday morning at Green Valley",
    excerpt:
      "Bread cooling, egg cartons stacked and preorder bags lined up — Saturday is the busiest morning of the Green Valley week.",
    bodyHtml: `<p>Saturday starts before the first customer arrives. By pickup time, bread is cooling, orders are packed and the collection area has been organised into something resembling a system.</p><h2>The weekly rhythm</h2><p>Orders build through the Menu, Thursday evening gives us final numbers and Friday is shaped around preparation and production.</p><h2>Pickup time</h2><p>Some customers are in and out with a loaf and eggs. Others have a week's worth of bread, pastries and produce waiting for them. It's busy, but it's our favourite part of the week.</p>`,
  },
  {
    id: "gv-post-sourdough",
    slug: "make-sourdough-last-the-weekend",
    title: "Three ways to make a loaf last the weekend",
    excerpt:
      "A few simple ways we use a Green Valley Country Sourdough from Saturday morning through Sunday night.",
    bodyHtml: `<p>A fresh loaf rarely needs much help on Saturday morning. Slice it, add butter and you're already doing pretty well.</p><h2>Saturday lunch</h2><p>Thick slices make excellent toast or open sandwiches. Try tomatoes, cheese, garden greens or whatever else is already in the fridge.</p><h2>Sunday breakfast</h2><p>Day-old sourdough is ideal for toast. It's also a good excuse for eggs.</p><h2>Sunday night</h2><p>The remaining pieces can become croutons, breadcrumbs or toast alongside soup.</p>`,
  },
] as const;
