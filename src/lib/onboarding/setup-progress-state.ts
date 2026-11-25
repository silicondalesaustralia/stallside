export type SetupProgress = {
  products: boolean;
  website: boolean;
  payments: boolean;
  /** Website building is Pro-only, so Free setup can finish without it. */
  pro: boolean;
};

export function setupComplete(progress: SetupProgress): boolean {
  return progress.products && (progress.website || !progress.pro) && progress.payments;
}

/**
 * 1-based step for OnboardingFlow: 1 account, 2 products, 3 website/farmstand,
 * 4 payments. Free plans treat the website step as done (farmstand is included).
 * Returns 5 when every required step is done so the flow shows all ticks.
 */
export function onboardingActiveStep(progress: SetupProgress): number {
  if (!progress.products) return 2;
  if (progress.pro && !progress.website) return 3;
  if (!progress.payments) return 4;
  return 5;
}
