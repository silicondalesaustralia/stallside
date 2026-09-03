/** Shown on policy page starters and static fallbacks — not legal advice. */
export const POLICY_EDITING_DISCLAIMER =
  "This is starter placeholder text only. Replace with your own policy content. Vendl does not provide legal advice.";

export const POLICY_STATIC_FALLBACK: Record<
  "privacy" | "terms" | "returns" | "shipping",
  { title: string; sections: { heading: string; body: string }[] }
> = {
  privacy: {
    title: "Privacy policy",
    sections: [
      {
        heading: "Overview",
        body: `${POLICY_EDITING_DISCLAIMER}\n\nExplain what personal information you collect (name, email, order details), why you collect it, and how you use it.`,
      },
      {
        heading: "Contact",
        body: "Describe how customers can ask about their data or request deletion.",
      },
    ],
  },
  terms: {
    title: "Terms of service",
    sections: [
      {
        heading: "Using this shop",
        body: `${POLICY_EDITING_DISCLAIMER}\n\nOutline the basic terms for browsing and purchasing from your online shop.`,
      },
      {
        heading: "Orders & payment",
        body: "Describe how orders are accepted, priced, and paid for.",
      },
    ],
  },
  returns: {
    title: "Returns & refunds",
    sections: [
      {
        heading: "Our approach",
        body: `${POLICY_EDITING_DISCLAIMER}\n\nExplain your returns and refund policy for fresh food, pre-orders, or made-to-order products.`,
      },
      {
        heading: "How to request a refund",
        body: "Tell customers how to contact you and what information to include.",
      },
    ],
  },
  shipping: {
    title: "Shipping, pickup & delivery",
    sections: [
      {
        heading: "Fulfilment options",
        body: `${POLICY_EDITING_DISCLAIMER}\n\nDescribe pickup locations, delivery areas, and any fees or minimum orders.`,
      },
      {
        heading: "Timing",
        body: "Explain order cut-offs, collection windows, and what happens if you're running late.",
      },
    ],
  },
};
