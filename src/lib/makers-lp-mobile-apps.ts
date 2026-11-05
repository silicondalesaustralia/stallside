/** Mobile apps section on /lp/makers. Turn off with SHOW, or add verified store URLs when each app launches. */
export const MAKERS_LP_MOBILE_APPS_SHOW = true;

export type MakersLpMobileApp = { platform: string; status: string; storeUrl: string | null };

export const MAKERS_LP_MOBILE_APPS: MakersLpMobileApp[] = [
  { platform: "iOS App", status: "Coming soon", storeUrl: null },
  { platform: "Android App", status: "Coming soon", storeUrl: null },
];
