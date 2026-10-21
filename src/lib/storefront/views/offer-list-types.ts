/** Open pre-order pages for the pre-orders list; dates are ISO strings so the editor can preview it. */
export type PreOrderListData = {
  standSlug: string;
  standName: string;
  timezone: string;
  accentColor: string | null;
  /** Base for card links, e.g. the website's `/pre-orders`; null uses the stand page. */
  pageHrefBase: string | null;
  pages: {
    slug: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    collectionAt: string;
    orderByAt: string;
    handoverMode: string;
    fallbackImageUrl: string | null;
  }[];
};

/** Live subscription and membership offers for the subscriptions list. */
export type SubscriptionListData = {
  standSlug: string;
  standName: string;
  accentColor: string | null;
  /** Base for card links, e.g. the website's `/subscriptions`; null uses the stand page. */
  offerHrefBase: string | null;
  offers: {
    slug: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    currency: string;
    termWeeks: number | null;
    weeklyPriceCents: number | null;
    monthlyPriceCents: number | null;
    upfrontPriceCents: number | null;
  }[];
};
