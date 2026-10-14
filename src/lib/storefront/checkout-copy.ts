/** Editable checkout wording (cart section `texts` keys) and the default for each. */
export const CHECKOUT_COPY = {
  payHeading: "How would you like to pay?",
  reserveHeading: "Pay to reserve your order",
  payCash: "Pay cash",
  cardButton: "Checkout via credit card or these options:",
  noPayment: "No payment methods are available at this stand right now.",
  backToCart: "Back to cart",
  nameLabel: "Your name",
  emailLabel: "Email",
  phoneLabel: "Phone (optional)",
  deliveryHeading: "Delivery address",
  streetLabel: "Street address",
  suburbLabel: "Suburb",
  postcodeLabel: "Postcode",
  deliveryNotesLabel: "Delivery notes (optional)",
} as const;

export type CheckoutCopyKey = keyof typeof CHECKOUT_COPY;
