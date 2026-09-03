/** Public catalog: on the stand page grid. */
export const productCatalogWhere = {
  isArchived: false,
  isHidden: false,
} as const;

/**
 * Business page + business QR: catalog products that are not tied to a
 * pre-order page with “Hide on business page”.
 */
/** Business page + business QR: catalog products hidden by menu or pre-order page. */
export const businessPageProductWhere = {
  ...productCatalogWhere,
  NOT: {
    OR: [
      {
        preOrderPageItems: {
          some: {
            preOrderPage: { hideOnBusinessPage: true },
          },
        },
      },
      {
        menuItems: {
          some: {
            menu: { hideOnBusinessPage: true },
          },
        },
      },
    ],
  },
};

/** Still “live”: PDP + checkout (includes catalog-hidden). */
export const productLiveWhere = {
  isArchived: false,
} as const;

/** Owner dashboard default list (not archived). */
export const productDashboardWhere = {
  isArchived: false,
} as const;
