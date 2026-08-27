export const DEFAULT_STRIPE_SETUP_STEPS = [
  "Verify your identity",
  "Confirm your address",
  "Add a bank account for payouts",
] as const;

export const DEFAULT_NEVER_STARTED_STEPS = [
  "Open Stripe settings",
  "Verify your identity",
  "Add a bank account for payouts",
  "Turn on card payments on your checkout",
] as const;
