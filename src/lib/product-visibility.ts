/** Public catalog: on the stand page grid. */
export const productCatalogWhere = {
  isArchived: false,
  isHidden: false,
} as const;

/** Still “live”: PDP + checkout (includes catalog-hidden). */
export const productLiveWhere = {
  isArchived: false,
} as const;

/** Owner dashboard default list (not archived). */
export const productDashboardWhere = {
  isArchived: false,
} as const;
