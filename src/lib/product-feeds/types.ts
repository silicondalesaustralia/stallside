/** One purchasable row for Google Merchant Center and ChatGPT Business Hub feeds. */
export type FeedItem = {
  id: string;
  groupId: string | null;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  additionalImageUrls: string[];
  availability: "in_stock" | "out_of_stock" | "preorder";
  priceCents: number;
  /** Regular "was" price when on sale; omit when not on sale. */
  compareAtPriceCents: number | null;
  currency: string;
  brand: string;
  sellerName: string;
  sku: string | null;
  gtin: string | null;
  categoryPath: string | null;
  shippingCents: number | null;
  country: string;
  condition: "new";
  isPreOrder: boolean;
  availabilityDate: string | null;
  variantOptions: Record<string, string> | null;
  acceptsReturns: boolean | null;
  returnDays: number | null;
};

export type FeedCatalog = {
  title: string;
  link: string;
  items: FeedItem[];
};

export const GMC_FEED_PATH = "/feeds/google-merchant.xml";
export const CHATGPT_FEED_PATH = "/feeds/chatgpt-products.csv";
