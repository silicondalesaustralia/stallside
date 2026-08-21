export const CUSTOMER_CHOICE_PRODUCT_NAME = "Customer choice";

/** Min charge in minor units (Stripe-style floor for most currencies). */
export const CUSTOMER_CHOICE_MIN_CENTS = 50;
/** Soft cap to limit abuse ($5,000). */
export const CUSTOMER_CHOICE_MAX_CENTS = 500_000;
